"""
Procesador de imágenes médicas con OpenCV
Filtra y procesa imágenes según criterios específicos para rayos X
"""

import cv2
import numpy as np
from PIL import Image
import io
import base64
import logging
from typing import List, Dict, Any, Tuple
import os

logger = logging.getLogger(__name__)

class ProcesadorImagenesMedicas:
    def __init__(self):
        # Parámetros de filtrado de imágenes
        self.IMG_MIN_ANCHO = 512
        self.IMG_MIN_ALTO = 512
        self.IMG_MAX_BLANCO_PCT = 0.75
        self.IMG_MIN_ENTROPIA = 3.5
        self.IMG_MIN_BORDES = 1500
        self.IMG_MIN_BORDES_RATIO = 0.01
        self.IMG_MIN_COLORFULNESS = 5.0
        
        # Parámetros de detección de texto
        self.TEXTO_MIN_PALABRAS_BLOQUE = 25
        self.TEXTO_MIN_CARACTERES_BLOQUE = 150

    def procesar_imagenes_desde_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extrae y procesa imágenes de un PDF usando OpenCV
        """
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(pdf_path)
            imagenes_procesadas = []
            
            for pagina_num in range(len(doc)):
                pagina = doc[pagina_num]
                lista_imagenes = pagina.get_images()
                
                for img_index, img in enumerate(lista_imagenes):
                    try:
                        # Extraer imagen
                        xref = img[0]
                        pix = fitz.Pixmap(doc, xref)
                        
                        if pix.n - pix.alpha < 4:  # GRAY o RGB
                            img_data = pix.tobytes("png")
                            
                            # Procesar con OpenCV
                            imagen_procesada = self._procesar_imagen_cv2(img_data, pagina_num + 1, img_index)
                            
                            if imagen_procesada:
                                imagenes_procesadas.append(imagen_procesada)
                        
                        pix = None
                        
                    except Exception as e:
                        logger.warning(f"Error procesando imagen {img_index} en página {pagina_num}: {str(e)}")
                        continue
            
            doc.close()
            return imagenes_procesadas
            
        except ImportError:
            logger.error("PyMuPDF no está instalado. Instalando...")
            os.system("pip install PyMuPDF")
            return []
        except Exception as e:
            logger.error(f"Error procesando PDF: {str(e)}")
            return []

    def _procesar_imagen_cv2(self, img_data: bytes, pagina: int, indice: int) -> Dict[str, Any]:
        """
        Procesa una imagen individual con OpenCV
        """
        try:
            # Convertir bytes a imagen OpenCV
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return None
            
            # Obtener dimensiones
            alto, ancho = img.shape[:2]
            
            # Aplicar filtros de calidad
            if not self._cumple_criterios_calidad(img):
                logger.info(f"Imagen {indice} en página {pagina} no cumple criterios de calidad")
                return None
            
            # Detectar tipo de imagen (rayos X, ecografía, etc.)
            tipo_imagen = self._detectar_tipo_imagen(img)
            
            # Extraer texto si existe
            texto_extraido = self._extraer_texto_imagen(img)
            
            # Convertir a base64 para almacenamiento
            _, buffer = cv2.imencode('.png', img)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Crear descripción basada en análisis
            descripcion = self._generar_descripcion_imagen(img, tipo_imagen, texto_extraido)
            
            return {
                'id': f"img_{pagina}_{indice}",
                'nombre': f"Imagen_{pagina}_{indice}",
                'url': f"data:image/png;base64,{img_base64}",
                'descripcion': descripcion,
                'tipo': tipo_imagen,
                'pagina': pagina,
                'ancho': ancho,
                'alto': alto,
                'texto_extraido': texto_extraido,
                'criterios_cumplidos': self._evaluar_criterios(img)
            }
            
        except Exception as e:
            logger.error(f"Error procesando imagen: {str(e)}")
            return None

    def _cumple_criterios_calidad(self, img: np.ndarray) -> bool:
        """
        Verifica si la imagen cumple los criterios de calidad
        """
        alto, ancho = img.shape[:2]
        
        # Verificar dimensiones mínimas
        if ancho < self.IMG_MIN_ANCHO or alto < self.IMG_MIN_ALTO:
            return False
        
        # Convertir a escala de grises para análisis
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Verificar porcentaje de blanco
        blanco_pct = np.sum(gray > 240) / (ancho * alto)
        if blanco_pct > self.IMG_MAX_BLANCO_PCT:
            return False
        
        # Calcular entropía
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist.flatten()
        hist = hist / hist.sum()
        entropia = -np.sum(hist * np.log2(hist + 1e-10))
        if entropia < self.IMG_MIN_ENTROPIA:
            return False
        
        # Detectar bordes
        edges = cv2.Canny(gray, 50, 150)
        num_edges = np.sum(edges > 0)
        edges_ratio = num_edges / (ancho * alto)
        if num_edges < self.IMG_MIN_BORDES or edges_ratio < self.IMG_MIN_BORDES_RATIO:
            return False
        
        # Calcular colorfulness
        colorfulness = self._calcular_colorfulness(img)
        if colorfulness < self.IMG_MIN_COLORFULNESS:
            return False
        
        return True

    def _calcular_colorfulness(self, img: np.ndarray) -> float:
        """
        Calcula el colorfulness de una imagen
        """
        # Convertir a RGB
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Calcular diferencias de color
        rg = np.absolute(rgb[:, :, 0] - rgb[:, :, 1])
        yb = np.absolute(0.5 * (rgb[:, :, 0] + rgb[:, :, 1]) - rgb[:, :, 2])
        
        # Calcular desviación estándar
        rg_std = np.std(rg)
        yb_std = np.std(yb)
        
        # Calcular colorfulness
        colorfulness = np.sqrt(rg_std**2 + yb_std**2)
        return colorfulness

    def _detectar_tipo_imagen(self, img: np.ndarray) -> str:
        """
        Detecta el tipo de imagen médica
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Análisis de histograma
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        
        # Calcular estadísticas
        mean_intensity = np.mean(gray)
        std_intensity = np.std(gray)
        
        # Detectar rayos X (generalmente más oscuros, menos contraste)
        if mean_intensity < 100 and std_intensity < 50:
            return 'radiografia'
        
        # Detectar ecografías (más brillantes, más contraste)
        elif mean_intensity > 150 and std_intensity > 80:
            return 'ecografia'
        
        # Detectar ecocardiografías (patrones específicos)
        elif self._detectar_patron_ecocardio(img):
            return 'ecocardiografia'
        
        # Detectar análisis de laboratorio (texto y gráficos)
        elif self._detectar_patron_analisis(img):
            return 'analisis'
        
        else:
            return 'otro'

    def _detectar_patron_ecocardio(self, img: np.ndarray) -> bool:
        """
        Detecta patrones específicos de ecocardiografía
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Buscar patrones de ondas y curvas características
        edges = cv2.Canny(gray, 50, 150)
        
        # Detectar líneas horizontales (típicas en ecocardiografías)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)
        
        if lines is not None:
            horizontal_lines = 0
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi
                if abs(angle) < 15 or abs(angle - 180) < 15:  # Líneas horizontales
                    horizontal_lines += 1
            
            return horizontal_lines > 5
        
        return False

    def _detectar_patron_analisis(self, img: np.ndarray) -> bool:
        """
        Detecta patrones de análisis de laboratorio
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Buscar texto usando OCR básico
        texto = self._extraer_texto_imagen(img)
        
        # Si hay mucho texto, probablemente es un análisis
        if len(texto.split()) > self.TEXTO_MIN_PALABRAS_BLOQUE:
            return True
        
        # Buscar patrones de gráficos/tablas
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Contar rectángulos (tablas)
        rectangulos = 0
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4:
                rectangulos += 1
        
        return rectangulos > 3

    def _extraer_texto_imagen(self, img: np.ndarray) -> str:
        """
        Extrae texto de una imagen usando OCR
        """
        try:
            import pytesseract
            
            # Preprocesar imagen para OCR
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Aplicar filtros para mejorar OCR
            gray = cv2.medianBlur(gray, 3)
            gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            
            # Extraer texto
            texto = pytesseract.image_to_string(gray, lang='spa')
            
            return texto.strip()
            
        except ImportError:
            logger.warning("pytesseract no está instalado. Instalando...")
            os.system("pip install pytesseract")
            return ""
        except Exception as e:
            logger.warning(f"Error en OCR: {str(e)}")
            return ""

    def _generar_descripcion_imagen(self, img: np.ndarray, tipo: str, texto: str) -> str:
        """
        Genera una descripción de la imagen basada en el análisis
        """
        alto, ancho = img.shape[:2]
        
        descripciones_base = {
            'radiografia': f"Radiografía médica ({ancho}x{alto}px)",
            'ecografia': f"Ecografía médica ({ancho}x{alto}px)",
            'ecocardiografia': f"Ecocardiografía ({ancho}x{alto}px)",
            'analisis': f"Análisis de laboratorio ({ancho}x{alto}px)",
            'otro': f"Imagen médica ({ancho}x{alto}px)"
        }
        
        descripcion = descripciones_base.get(tipo, descripciones_base['otro'])
        
        # Agregar información del texto extraído si es relevante
        if texto and len(texto.split()) > 5:
            palabras_clave = self._extraer_palabras_clave(texto)
            if palabras_clave:
                descripcion += f" - {', '.join(palabras_clave[:3])}"
        
        return descripcion

    def _extraer_palabras_clave(self, texto: str) -> List[str]:
        """
        Extrae palabras clave relevantes del texto
        """
        palabras_medicas = [
            'corazón', 'pulmón', 'hígado', 'riñón', 'estómago', 'intestino',
            'hueso', 'articulación', 'músculo', 'nervio', 'vaso', 'sangre',
            'cristalino', 'retina', 'córnea', 'iris', 'pupila', 'ojo',
            'cerebro', 'médula', 'columna', 'cráneo', 'mandíbula'
        ]
        
        texto_lower = texto.lower()
        palabras_encontradas = []
        
        for palabra in palabras_medicas:
            if palabra in texto_lower:
                palabras_encontradas.append(palabra)
        
        return palabras_encontradas

    def _evaluar_criterios(self, img: np.ndarray) -> Dict[str, bool]:
        """
        Evalúa qué criterios cumple la imagen
        """
        alto, ancho = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calcular métricas
        blanco_pct = np.sum(gray > 240) / (ancho * alto)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist.flatten()
        hist = hist / hist.sum()
        entropia = -np.sum(hist * np.log2(hist + 1e-10))
        
        edges = cv2.Canny(gray, 50, 150)
        num_edges = np.sum(edges > 0)
        edges_ratio = num_edges / (ancho * alto)
        
        colorfulness = self._calcular_colorfulness(img)
        
        return {
            'dimensiones_ok': ancho >= self.IMG_MIN_ANCHO and alto >= self.IMG_MIN_ALTO,
            'blanco_ok': blanco_pct <= self.IMG_MAX_BLANCO_PCT,
            'entropia_ok': entropia >= self.IMG_MIN_ENTROPIA,
            'bordes_ok': num_edges >= self.IMG_MIN_BORDES and edges_ratio >= self.IMG_MIN_BORDES_RATIO,
            'colorfulness_ok': colorfulness >= self.IMG_MIN_COLORFULNESS
        }
