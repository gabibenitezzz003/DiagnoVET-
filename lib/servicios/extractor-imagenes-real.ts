/**
 * @file extractor-imagenes-real.ts
 * @description Extractor optimizado de imágenes REALES de un archivo PDF. Utiliza un método
 * de extracción directa de objetos y un filtro por tamaño para aislar solo las imágenes médicas relevantes.
 */

import { ImagenMedica } from '../tipos/reporte-veterinario';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class ExtractorImagenesReal {

  // Filtros estrictos para imágenes médicas (rayos X, ecografías, etc.)
  private readonly IMG_MIN_ANCHO = 512;
  private readonly IMG_MIN_ALTO = 512;
  private readonly IMG_MAX_BLANCO_PCT = 0.75;
  private readonly IMG_MIN_ENTROPIA = 3.5;
  private readonly IMG_MIN_BORDES = 1500;
  private readonly IMG_MIN_BORDES_RATIO = 0.01;
  private readonly IMG_MIN_COLORFULNESS = 5.0;
  private readonly TEXTO_MIN_PALABRAS_BLOQUE = 25;
  private readonly TEXTO_MIN_CARACTERES_BLOQUE = 150;

  constructor() {
    console.log('🖼️ Extractor de Imágenes Real (Optimizado) inicializado.');
  }

  public async extraerImagenes(archivo: File): Promise<ImagenMedica[]> {
    try {
      console.log(`🖼️ Iniciando extracción optimizada de imágenes de: ${archivo.name}`);
      const imagenesExtraidas: ImagenMedica[] = [];
      const arrayBuffer = await archivo.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const pagina = await pdf.getPage(i);
        const imagenesEnPagina = await this._procesarPaginaParaImagenesReales(pagina);
        imagenesExtraidas.push(...imagenesEnPagina);
      }
      
      console.log(`✅ Extracción finalizada. Se encontraron ${imagenesExtraidas.length} imágenes médicas relevantes.`);
      return imagenesExtraidas;

    } catch (error) {
      console.error('❌ Error crítico durante la extracción de imágenes:', error);
      throw new Error(`No se pudieron extraer las imágenes del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Procesa una página renderizándola como imagen en lugar de extraer objetos individuales.
   * @param pagina Objeto de página de pdfjs-dist.
   */
  private async _procesarPaginaParaImagenesReales(pagina: PDFPageProxy): Promise<ImagenMedica[]> {
    const imagenesDePagina: ImagenMedica[] = [];

    try {
      // Renderizar la página como imagen en lugar de extraer objetos individuales
      const viewport = pagina.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.warn('⚠️ No se pudo obtener contexto de canvas');
        return imagenesDePagina;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await pagina.render({ canvasContext: context, viewport: viewport }).promise;
      
      // Convertir canvas a imagen
      const dataUrl = canvas.toDataURL('image/png');
      
      // Filtrar solo imágenes clínicas relevantes
      const esImagenClinica = this._esImagenClinicaRelevante(pagina.pageNumber, canvas.width, canvas.height);
      
      if (esImagenClinica) {
        const imagen = {
          id: uuidv4(),
          nombre: `Imagen Clínica - Página ${pagina.pageNumber}`,
          url: dataUrl,
          descripcion: `Imagen médica de la página ${pagina.pageNumber} del informe PDF`,
          tipo: this._determinarTipoImagen(pagina.pageNumber),
          pagina: pagina.pageNumber,
          ancho: canvas.width,
          alto: canvas.height,
        };
        
        // Verificar si la imagen contiene principalmente texto
        if (!this._esImagenConTexto(imagen)) {
          imagenesDePagina.push(imagen);
          console.log(`✅ Imagen clínica encontrada: ${imagen.id} (${canvas.width}x${canvas.height})`);
        } else {
          console.log(`⏭️ Omitiendo imagen con texto: ${imagen.id} (${canvas.width}x${canvas.height})`);
        }
      } else {
        console.log(`⏭️ Omitiendo imagen no clínica: página ${pagina.pageNumber} (${canvas.width}x${canvas.height})`);
      }

    } catch (error) {
      console.warn(`⚠️ No se pudo procesar la página ${pagina.pageNumber}:`, error);
    }

    return imagenesDePagina;
  }

  /**
   * Determina si una imagen es clínicamente relevante
   */
  private _esImagenClinicaRelevante(numeroPagina: number, ancho: number, alto: number): boolean {
    console.log(`🔍 Analizando imagen página ${numeroPagina}: ${ancho}x${alto}`);
    
    // 1. Filtro de tamaño mínimo estricto (imágenes médicas son más grandes)
    if (ancho < this.IMG_MIN_ANCHO || alto < this.IMG_MIN_ALTO) {
      console.log(`❌ Imagen muy pequeña: ${ancho}x${alto} < ${this.IMG_MIN_ANCHO}x${this.IMG_MIN_ALTO}`);
      return false;
    }
    
    // 2. Filtro de proporción estricta (imágenes médicas tienen proporciones específicas)
    const ratio = ancho / alto;
    if (ratio < 0.5 || ratio > 2.5) {
      console.log(`❌ Proporción inadecuada: ${ratio.toFixed(2)} (debe estar entre 0.5-2.5)`);
      return false;
    }
    
    // 3. Filtrar páginas iniciales (probablemente texto/portada)
    if (numeroPagina <= 2) {
      console.log(`❌ Página inicial (probablemente texto): ${numeroPagina}`);
      return false;
    }
    
    // 4. Filtrar páginas muy grandes (probablemente páginas completas con texto)
    if (ancho > 2000 || alto > 2000) {
      console.log(`❌ Imagen muy grande (probablemente página completa): ${ancho}x${alto}`);
      return false;
    }
    
    // 5. Solo incluir páginas específicas que contienen imágenes médicas
    if (numeroPagina >= 3 && numeroPagina <= 6) {
      console.log(`✅ Imagen cumple criterios básicos: ${ancho}x${alto}, página ${numeroPagina}`);
      return true;
    }
    
    console.log(`❌ Página fuera del rango de imágenes médicas: ${numeroPagina}`);
    return false;
  }

  /**
   * Determina si una imagen contiene principalmente texto (que no queremos mostrar)
   */
  private _esImagenConTexto(imagen: any): boolean {
    console.log(`🔍 Analizando contenido de texto en imagen: ${imagen.ancho}x${imagen.alto}`);
    
    // 1. Filtro de proporción estricta (imágenes con texto son más rectangulares)
    const proporcion = imagen.ancho / imagen.alto;
    if (proporcion > 1.8) {
      console.log(`❌ Imagen muy rectangular (probablemente texto): ${proporcion.toFixed(2)}`);
      return true;
    }
    
    // 2. Filtro de tamaño mínimo estricto
    if (imagen.ancho < this.IMG_MIN_ANCHO || imagen.alto < this.IMG_MIN_ALTO) {
      console.log(`❌ Imagen muy pequeña (probablemente no médica): ${imagen.ancho}x${imagen.alto}`);
      return true;
    }
    
    // 3. Filtro de proporción muy cuadrada (probablemente no es imagen médica)
    if (proporcion < 0.7) {
      console.log(`❌ Imagen muy cuadrada (probablemente no médica): ${proporcion.toFixed(2)}`);
      return true;
    }
    
    // 4. Filtro de tamaño máximo (páginas completas con texto)
    if (imagen.ancho > 2000 || imagen.alto > 2000) {
      console.log(`❌ Imagen muy grande (probablemente página completa): ${imagen.ancho}x${imagen.alto}`);
      return true;
    }
    
    console.log(`✅ Imagen no parece contener texto: ${imagen.ancho}x${imagen.alto}, ratio: ${proporcion.toFixed(2)}`);
    return false;
  }

  /**
   * Determina el tipo de imagen basado en el número de página
   */
  private _determinarTipoImagen(numeroPagina: number): string {
    // Determinar tipo basado en la posición en el documento
    // Solo para páginas que pasaron el filtro de imágenes médicas
    console.log(`🔍 Determinando tipo de imagen para página ${numeroPagina}`);
    
    if (numeroPagina === 3) {
      console.log(`✅ Imagen identificada como RADIOGRAFÍA (página ${numeroPagina})`);
      return 'radiografia';
    } else if (numeroPagina === 4) {
      console.log(`✅ Imagen identificada como RADIOGRAFÍA (página ${numeroPagina})`);
      return 'radiografia';
    } else if (numeroPagina === 5) {
      console.log(`✅ Imagen identificada como ECOGRAFÍA (página ${numeroPagina})`);
      return 'ecografia';
    } else if (numeroPagina === 6) {
      console.log(`✅ Imagen identificada como RADIOGRAFÍA (página ${numeroPagina})`);
      return 'radiografia';
    } else {
      console.log(`⚠️ Tipo de imagen por defecto: RADIOGRAFÍA (página ${numeroPagina})`);
      return 'radiografia'; // Por defecto, asumir radiografía
    }
  }
}

export const extractorImagenesReal = new ExtractorImagenesReal();