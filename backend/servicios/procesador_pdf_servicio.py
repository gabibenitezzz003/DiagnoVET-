"""
Servicio de procesamiento de PDFs
Implementa la lógica de extracción de información de PDFs veterinarios usando Gemini
"""

from typing import Dict, Any, List
import logging
from fastapi import UploadFile
import uuid
from datetime import datetime
import os

from modelos.reporte_modelo import ReporteModelo
from .procesador_imagenes import ProcesadorImagenesMedicas

logger = logging.getLogger(__name__)

class ProcesadorPDFServicio:
    """Servicio para procesamiento de PDFs veterinarios"""
    
    def __init__(self):
        self.confianza_minima = 0.7
        self.procesador_imagenes = ProcesadorImagenesMedicas()
    
    async def procesar_pdf(self, archivo: UploadFile) -> Dict[str, Any]:
        """
        Procesa un archivo PDF y extrae información estructurada usando Gemini
        
        Args:
            archivo: Archivo PDF a procesar
            
        Returns:
            Dict con el resultado del procesamiento
        """
        try:
            logger.info(f"Iniciando procesamiento de PDF: {archivo.filename}")
            
            # Cargar variables de entorno
            from dotenv import load_dotenv
            load_dotenv('.env')
            
            # Leer el contenido del archivo
            contenido = await archivo.read()
            logger.info(f"Archivo leído: {len(contenido)} bytes")
            
            # Intentar usar Gemini si está configurado
            try:
                # Crear archivo temporal para procesamiento
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                    temp_file.write(contenido)
                    temp_file_path = temp_file.name
                
                try:
                    # Extraer texto del PDF usando Gemini
                    texto_extraido = await self._extraer_texto_con_gemini(contenido, archivo.filename)
                    
                    # Procesar imágenes del PDF
                    imagenes_procesadas = self.procesador_imagenes.procesar_imagenes_desde_pdf(temp_file_path)
                    logger.info(f"Imágenes procesadas: {len(imagenes_procesadas)}")
                    
                    # Procesar el texto con Gemini para extraer información estructurada
                    datos_estructurados = await self._procesar_texto_con_gemini(texto_extraido, imagenes_procesadas)
                    
                    return {
                        "exito": True,
                        "datos": datos_estructurados,
                        "mensaje": "PDF procesado exitosamente con Gemini e imágenes"
                    }
                
                finally:
                    # Limpiar archivo temporal
                    try:
                        os.unlink(temp_file_path)
                    except:
                        pass
                
            except Exception as gemini_error:
                logger.error(f"Error con Gemini: {str(gemini_error)}")
                raise gemini_error  # Re-lanzar el error en lugar de usar fallback
            
        except Exception as e:
            logger.error(f"Error al procesar PDF: {str(e)}")
            return {
                "exito": False,
                "error": str(e),
                "mensaje": "Error al procesar PDF"
            }
    
    async def _extraer_texto_con_gemini(self, contenido: bytes, nombre_archivo: str) -> str:
        """Extrae texto del PDF usando Gemini"""
        try:
            import google.generativeai as genai
            from dotenv import load_dotenv
            
            # Cargar variables de entorno
            load_dotenv()
            
            # Configurar Gemini
            api_key = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
            if not api_key:
                raise ValueError("NEXT_PUBLIC_GEMINI_API_KEY no configurada")
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Crear archivo temporal para Gemini
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                temp_file.write(contenido)
                temp_file_path = temp_file.name
            
            try:
                # Subir archivo a Gemini
                archivo_gemini = genai.upload_file(
                    path=temp_file_path,
                    mime_type='application/pdf',
                    display_name=nombre_archivo
                )
                
                # Procesar con Gemini
                prompt = """
                Extrae todo el texto de este documento PDF veterinario.
                Devuelve solo el texto extraído sin comentarios adicionales.
                """
                
                response = model.generate_content([prompt, archivo_gemini])
                texto_extraido = response.text
                
                logger.info(f"Texto extraído: {len(texto_extraido)} caracteres")
                return texto_extraido
                
            finally:
                # Limpiar archivo temporal
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
            
        except Exception as e:
            logger.error(f"Error al extraer texto con Gemini: {str(e)}")
            raise e
    
    async def _procesar_texto_con_gemini(self, texto: str, imagenes: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Procesa el texto extraído con Gemini para obtener información estructurada"""
        try:
            import google.generativeai as genai
            import json
            from dotenv import load_dotenv
            
            # Cargar variables de entorno
            load_dotenv()
            
            # Configurar Gemini
            api_key = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
            if not api_key:
                raise ValueError("NEXT_PUBLIC_GEMINI_API_KEY no configurada")
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Preparar información de imágenes para el prompt
            info_imagenes = ""
            if imagenes:
                info_imagenes = "\n\n### INFORMACIÓN DE IMÁGENES DETECTADAS:\n"
                for i, img in enumerate(imagenes, 1):
                    info_imagenes += f"- **IMAGEN {i}:** {img['descripcion']} (Tipo: {img['tipo']}, Página: {img['pagina']})\n"
                    if img.get('texto_extraido'):
                        info_imagenes += f"  - Texto detectado: {img['texto_extraido'][:100]}...\n"

            prompt = f"""
        Actúa como un **Asistente Experto en Documentación Médica Veterinaria (CliniDoc AI)**. Tu única función es transformar informes veterinarios complejos, provistos como texto plano, en un resumen estructurado, claro y profesional en formato **Markdown**.

        El resumen debe ser fácilmente legible tanto para otros veterinarios como para los propietarios de las mascotas, destacando la información más relevante sin omitir detalles cruciales.

        ### Principios Fundamentales de Procesamiento:
        1.  **Principio de Relevancia:** Extrae y presenta solo la información clínica y de identificación. Ignora metadatos repetitivos del pie de página (números de teléfono, M.P., etc.) a menos que sea la única fuente para identificar a un veterinario.
        2.  **Principio de Estructura:** Organiza la información obligatoriamente en las secciones predefinidas más abajo. No mezcles hallazgos objetivos con diagnósticos o recomendaciones.
        3.  **Principio de Consistencia:** Normaliza todas las fechas al formato **AAAA-MM-DD**. Estandariza los nombres de los campos como se muestra en la plantilla.
        4.  **Principio de Claridad:** Usa listas con viñetas (`-`) para desglosar los hallazgos, diagnósticos y recomendaciones, facilitando una lectura rápida. Si el texto original describe hallazgos por órgano, mantén esa estructura.

        ---

        ### ## Estructura de Salida OBLIGATORIA (Formato Markdown):

        # Resumen del Informe Veterinario de [Nombre del Paciente]

        **Fecha del Estudio:** AAAA-MM-DD
        **Tipo de Estudio:** [Ej: Ecografía Ocular, Radiografía de Tórax, Ecocardiografía]
        **Paciente:** [Nombre], [Especie], [Raza], [Edad], [Sexo]
        **Propietario:** [Nombre del Propietario]
        **Veterinario/s Principal/es:** [Nombre del Veterinario Principal o Solicitante]

        ---

        ## 🔬 Hallazgos Clínicos Detallados
        *Esta sección contiene las observaciones objetivas y mediciones descritas en el informe (las secciones "Hallazgos" o "Descripción").*

        - **[Órgano 1, ej: Ojo izquierdo]:**
          - [Hallazgo 1.1, extraído textualmente, ej: Presenta un diámetro total de 19.7 mm, cámara vítrea de 9.5 mm.]
          - [Hallazgo 1.2, ej: Humor vítreo presenta puntillado hiperecoico abundante, no móvil.]
        - **[Órgano 2, ej: Ojo derecho]:**
          - [Hallazgo 2.1, ej: Cristalino de 6.2 mm, con una estructura hiperecoica central con forma de reloj de arena.]
        - **[Hallazgo general si no está desglosado por órgano]:**
          - [Descripción del hallazgo general.]

        ## 🩺 Diagnóstico y Conclusiones
        *Esta es la interpretación profesional de los hallazgos (la sección "Diagnóstico" o "Conclusión").*

        - **Diagnóstico Principal:** [Extraer el diagnóstico más importante, ej: Catarata intumescente bilateral.]
        - **Diagnósticos Secundarios / Presuntivos:**
          - [Diagnóstico secundario o presuntivo 1, ej: Esclerosis nuclear en cristalino derecho.]
          - [Diagnóstico secundario o presuntivo 2, ej: Presuntivo de coagulo en cámara vítrea derecha.]
          - [Y así sucesivamente con todos los diagnósticos listados.]

        ## 💡 Plan de Acción y Recomendaciones
        *Pasos a seguir sugeridos por el profesional (la sección "Notas" o "Recomendaciones").*

        - [Recomendación 1, ej: Se recomienda estudio radiológico de control en 30 días, según criterio clínico.]
        - [Recomendación 2, si aplica, ej: Se recomienda pimobendan 0.25 mg/kg cada 12 horas, de por vida.]

        ## 🖼️ Imágenes Médicas Adjuntas
        *(Nota: A continuación se listan las imágenes médicas relevantes identificadas en el documento. La aplicación debe reemplazar estos placeholders con las imágenes reales.)*

        - **[IMAGEN 1: Breve descripción basada en el contexto o etiquetas del informe, ej: Ecografía del cristalino del ojo derecho con mediciones.]**
        - **[IMAGEN 2: Breve descripción, ej: Radiografía de tórax, incidencia latero-lateral derecha.]**

        ---

        ### ## Reglas Finales de Procesamiento:
        - Tu única salida debe ser el texto en formato Markdown. No añadas introducciones, despedidas ni explicaciones.
        - Para la sección de imágenes, **NO intentes crear o mostrar imágenes**. En su lugar, crea una lista de placeholders `[IMAGEN X: ...]`. Basa la descripción en el texto cercano a donde se mencionan las imágenes (como "IMÁGENES ADJUNTAS") o en las etiquetas que aparecen sobre las propias imágenes si fueron extraídas por el OCR (ej: "HIGADO", "CRISTALINO").
        - Sé exhaustivo. Revisa todo el texto proporcionado para no omitir ninguna sección, especialmente en informes largos de múltiples páginas.

        {info_imagenes}

        ## TEXTO DEL INFORME A CONTINUACIÓN:
        {texto}
        """
            
            response = model.generate_content(prompt)
            texto_respuesta = response.text.strip()
            
            # El prompt ahora devuelve Markdown directamente, no JSON
            # Extraer información básica del Markdown para compatibilidad
            datos_estructurados = self._extraer_datos_desde_markdown(texto_respuesta)
            
            # Agregar el markdown completo
            datos_estructurados["markdown_completo"] = texto_respuesta
            
            # Agregar las imágenes procesadas
            if imagenes:
                datos_estructurados["imagenes"] = imagenes
                logger.info(f"Agregadas {len(imagenes)} imágenes al reporte")
            else:
                datos_estructurados["imagenes"] = []
            
            logger.info("Datos estructurados extraídos exitosamente con Gemini (formato Markdown)")
            return datos_estructurados
            
        except Exception as e:
            logger.error(f"Error al procesar texto con Gemini: {str(e)}")
            raise e
    
    def _extraer_datos_desde_markdown(self, markdown_text: str) -> Dict[str, Any]:
        """
        Extrae datos estructurados del Markdown generado por Gemini
        """
        try:
            import re
            
            # Inicializar datos
            datos = {
                "tipo_estudio": "estudio veterinario",
                "paciente": {
                    "nombre": "Paciente",
                    "especie": "No especificada",
                    "raza": "No especificada",
                    "edad": "No especificada",
                    "peso": None,
                    "sexo": "No especificado"
                },
                "tutor": {
                    "nombre": "No especificado",
                    "telefono": None,
                    "email": None
                },
                "veterinario": {
                    "nombre": "No especificado",
                    "especialidad": None,
                    "clinica": "No especificada",
                    "matricula": None
                },
                "diagnostico": {
                    "principal": "No especificado",
                    "secundarios": [],
                    "observaciones": "",
                    "recomendaciones": [],
                    "tratamiento": None,
                    "proximo_control": None
                },
                "imagenes": [],
                "contenido_extraido": markdown_text,
                "confianza_extraccion": 0.95
            }
            
            # Extraer información del header
            # Fecha del Estudio
            fecha_match = re.search(r'\*\*Fecha del Estudio:\*\*\s*(\d{4}-\d{2}-\d{2})', markdown_text)
            if fecha_match:
                datos["fecha_estudio"] = fecha_match.group(1)
            
            # Tipo de Estudio
            tipo_match = re.search(r'\*\*Tipo de Estudio:\*\*\s*([^\n]+)', markdown_text)
            if tipo_match:
                datos["tipo_estudio"] = tipo_match.group(1).strip()
            
            # Paciente
            paciente_match = re.search(r'\*\*Paciente:\*\*\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^\n]+)', markdown_text)
            if paciente_match:
                datos["paciente"]["nombre"] = paciente_match.group(1).strip()
                datos["paciente"]["especie"] = paciente_match.group(2).strip()
                datos["paciente"]["raza"] = paciente_match.group(3).strip()
                datos["paciente"]["edad"] = paciente_match.group(4).strip()
                datos["paciente"]["sexo"] = paciente_match.group(5).strip()
            
            # Propietario
            propietario_match = re.search(r'\*\*Propietario:\*\*\s*([^\n]+)', markdown_text)
            if propietario_match:
                datos["tutor"]["nombre"] = propietario_match.group(1).strip()
            
            # Veterinario
            veterinario_match = re.search(r'\*\*Veterinario/s Principal/es:\*\*\s*([^\n]+)', markdown_text)
            if veterinario_match:
                datos["veterinario"]["nombre"] = veterinario_match.group(1).strip()
            
            # Diagnóstico Principal
            diag_principal_match = re.search(r'- \*\*Diagnóstico Principal:\*\*\s*([^\n]+)', markdown_text)
            if diag_principal_match:
                datos["diagnostico"]["principal"] = diag_principal_match.group(1).strip()
            
            # Diagnósticos Secundarios
            diag_secundarios = re.findall(r'- \*\*Diagnósticos Secundarios / Presuntivos:\*\*\s*\n(.*?)(?=\n## |$)', markdown_text, re.DOTALL)
            if diag_secundarios:
                lineas = diag_secundarios[0].strip().split('\n')
                for linea in lineas:
                    if linea.strip().startswith('- '):
                        diag = linea.strip()[2:].strip()
                        if diag:
                            datos["diagnostico"]["secundarios"].append(diag)
            
            # Recomendaciones
            recomendaciones_match = re.search(r'## 💡 Plan de Acción y Recomendaciones.*?\n(.*?)(?=\n## |$)', markdown_text, re.DOTALL)
            if recomendaciones_match:
                lineas = recomendaciones_match.group(1).strip().split('\n')
                for linea in lineas:
                    if linea.strip().startswith('- '):
                        rec = linea.strip()[2:].strip()
                        if rec:
                            datos["diagnostico"]["recomendaciones"].append(rec)
            
            # Imágenes médicas
            imagenes_match = re.search(r'## 🖼️ Imágenes Médicas Adjuntas.*?\n(.*?)(?=\n---|$)', markdown_text, re.DOTALL)
            if imagenes_match:
                lineas = imagenes_match.group(1).strip().split('\n')
                for i, linea in enumerate(lineas):
                    if linea.strip().startswith('- **[IMAGEN'):
                        # Extraer descripción de la imagen
                        desc_match = re.search(r'\[IMAGEN \d+:\s*([^\]]+)\]', linea)
                        if desc_match:
                            descripcion = desc_match.group(1).strip()
                            datos["imagenes"].append({
                                "tipo": "imagen_medica",
                                "descripcion": descripcion,
                                "hallazgos": descripcion,
                                "ubicacion": "No especificada",
                                "url": f"placeholder_imagen_{i+1}.jpg"
                            })
            
            # Si no hay imágenes específicas, crear una genérica
            if not datos["imagenes"]:
                datos["imagenes"].append({
                    "tipo": "imagen_medica",
                    "descripcion": "Imagen médica del estudio",
                    "hallazgos": "Imagen médica relevante para el diagnóstico",
                    "ubicacion": "No especificada",
                    "url": "placeholder_imagen_1.jpg"
                })
            
            return datos
            
        except Exception as e:
            logger.error(f"Error extrayendo datos del Markdown: {str(e)}")
            # Devolver datos básicos en caso de error
            return {
                "tipo_estudio": "estudio veterinario",
                "paciente": {"nombre": "Paciente", "especie": "No especificada", "raza": "No especificada", "edad": "No especificada", "peso": None, "sexo": "No especificado"},
                "tutor": {"nombre": "No especificado", "telefono": None, "email": None},
                "veterinario": {"nombre": "No especificado", "especialidad": None, "clinica": "No especificada", "matricula": None},
                "diagnostico": {"principal": "No especificado", "secundarios": [], "observaciones": "", "recomendaciones": [], "tratamiento": None, "proximo_control": None},
                "imagenes": [{"tipo": "imagen_medica", "descripcion": "Imagen médica del estudio", "hallazgos": "Imagen médica relevante", "ubicacion": "No especificada", "url": "placeholder_imagen_1.jpg"}],
                "contenido_extraido": markdown_text,
                "confianza_extraccion": 0.95
            }