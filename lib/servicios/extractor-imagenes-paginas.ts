/**
 * @file extractor-imagenes-paginas.ts
 * @description Extractor que renderiza páginas específicas del PDF como imágenes médicas
 * enfocándose en páginas que contienen contenido médico visual.
 */

import { ImagenMedica } from '../tipos/reporte-veterinario';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class ExtractorImagenesPaginas {

  constructor() {
    console.log('🖼️ Extractor de Imágenes por Páginas inicializado.');
  }

  public async extraerImagenes(archivo: File): Promise<ImagenMedica[]> {
    try {
      console.log(`🖼️ Iniciando extracción de imágenes por páginas de: ${archivo.name}`);
      const imagenesExtraidas: ImagenMedica[] = [];
      const arrayBuffer = await archivo.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      console.log(`📄 PDF tiene ${pdf.numPages} páginas`);

      // Procesar páginas específicas que suelen contener imágenes médicas
      const paginasConImagenes = this._identificarPaginasConImagenes(pdf.numPages);

      for (const numeroPagina of paginasConImagenes) {
        try {
          const pagina = await pdf.getPage(numeroPagina);
          const imagenesEnPagina = await this._renderizarPaginaComoImagen(pagina, numeroPagina);
          imagenesExtraidas.push(...imagenesEnPagina);
        } catch (error) {
          console.warn(`⚠️ Error procesando página ${numeroPagina}:`, error);
        }
      }

      console.log(`✅ Extracción finalizada. Se encontraron ${imagenesExtraidas.length} imágenes médicas.`);
      return imagenesExtraidas;

    } catch (error) {
      console.error('❌ Error durante la extracción de imágenes:', error);
      throw new Error(`No se pudieron extraer las imágenes del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Identifica qué páginas del PDF probablemente contienen imágenes médicas
   */
  private _identificarPaginasConImagenes(totalPaginas: number): number[] {
    const paginasConImagenes: number[] = [];

    // Estrategia: incluir páginas del medio hacia el final (donde suelen estar las imágenes)
    const inicioImagenes = Math.max(2, Math.floor(totalPaginas * 0.3));
    const finImagenes = totalPaginas;

    for (let i = inicioImagenes; i <= finImagenes; i++) {
      paginasConImagenes.push(i);
    }

    console.log(`📋 Páginas identificadas para extracción: ${paginasConImagenes.join(', ')}`);
    return paginasConImagenes;
  }

  /**
   * Renderiza una página específica como imagen médica
   */
  private async _renderizarPaginaComoImagen(pagina: any, numeroPagina: number): Promise<ImagenMedica[]> {
    const imagenes: ImagenMedica[] = [];

    try {
      console.log(`🖼️ Renderizando página ${numeroPagina} como imagen médica...`);

      // Renderizar con alta resolución para mejor calidad
      const viewport = pagina.getViewport({ scale: 2.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        console.warn('⚠️ No se pudo obtener contexto de canvas');
        return imagenes;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Renderizar la página
      await pagina.render({ canvasContext: context, viewport: viewport }).promise;

      // Verificar si la página contiene contenido médico visual
      if (this._esPaginaConContenidoMedico(canvas, numeroPagina)) {
        const dataUrl = canvas.toDataURL('image/png');

        const imagen: ImagenMedica = {
          id: uuidv4(),
          nombre: `Imagen Médica - Página ${numeroPagina}`,
          url: dataUrl,
          descripcion: `Imagen médica de la página ${numeroPagina} del informe PDF`,
          tipo: this._determinarTipoImagen(numeroPagina),
          pagina: numeroPagina,
          // ancho: canvas.width,
          // alto: canvas.height,
        };

        imagenes.push(imagen);
        console.log(`✅ Imagen médica creada: ${imagen.nombre} (${canvas.width}x${canvas.height})`);
      } else {
        console.log(`⏭️ Página ${numeroPagina} no contiene contenido médico visual relevante`);
      }

    } catch (error) {
      console.warn(`⚠️ Error renderizando página ${numeroPagina}:`, error);
    }

    return imagenes;
  }

  /**
   * Determina si una página contiene contenido médico visual
   */
  private _esPaginaConContenidoMedico(canvas: HTMLCanvasElement, numeroPagina: number): boolean {
    const context = canvas.getContext('2d');
    if (!context) return false;

    // Obtener datos de imagen para análisis
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Análisis básico de contenido
    let contenidoNoBlanco = 0;
    let contenidoGris = 0;
    let contenidoNegro = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      if (alpha > 0) {
        const luminancia = (r + g + b) / 3;

        if (luminancia < 50) {
          contenidoNegro++;
        } else if (luminancia < 200) {
          contenidoGris++;
        } else {
          contenidoNoBlanco++;
        }
      }
    }

    const totalPixeles = data.length / 4;
    const ratioContenido = (contenidoNoBlanco + contenidoGris + contenidoNegro) / totalPixeles;
    const ratioGrisNegro = (contenidoGris + contenidoNegro) / totalPixeles;

    console.log(`🔍 Análisis página ${numeroPagina}:`, {
      ratioContenido: ratioContenido.toFixed(3),
      ratioGrisNegro: ratioGrisNegro.toFixed(3),
      ancho: canvas.width,
      alto: canvas.height
    });

    // Criterios para considerar una página como médica:
    // 1. Debe tener contenido visual (no solo texto)
    // 2. Debe tener una proporción razonable de grises/negros (imágenes médicas)
    // 3. Debe tener un tamaño mínimo
    const tieneContenidoVisual = ratioContenido > 0.1;
    const tieneContenidoMedico = ratioGrisNegro > 0.05;
    const tieneTamañoAdecuado = canvas.width > 400 && canvas.height > 300;

    return tieneContenidoVisual && tieneContenidoMedico && tieneTamañoAdecuado;
  }

  /**
   * Determina el tipo de imagen basado en la página
   */
  private _determinarTipoImagen(numeroPagina: number): 'radiografia' | 'ecografia' | 'otro' {
    // Lógica simple basada en el número de página
    if (numeroPagina % 2 === 0) {
      return 'radiografia';
    } else if (numeroPagina % 3 === 0) {
      return 'ecografia';
    } else {
      return 'otro';
    }
  }
}

export const extractorImagenesPaginas = new ExtractorImagenesPaginas();
