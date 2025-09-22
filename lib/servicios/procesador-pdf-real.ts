/**
 * Servicio real de procesamiento de PDFs con Gemini AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReporteVeterinario } from '../tipos/reporte-veterinario';
import { extractorImagenesReal } from './extractor-imagenes-real'
import { extractorImagenesPaginas } from './extractor-imagenes-paginas';
import { servicioGoogleDriveOAuth2 } from './google-drive-oauth2';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class ProcesadorPDFReal {
  private genAI: GoogleGenerativeAI | null;
  private modelo: any;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY no configurada, usando procesamiento simulado');
      this.genAI = null;
      this.modelo = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.modelo = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  /**
   * Procesa un archivo PDF y extrae información estructurada usando Gemini AI
   */
  async procesarPDF(archivo: File): Promise<ReporteVeterinario> {
    try {
      console.log('🔍 Iniciando procesamiento de PDF con Gemini AI...');
      
      if (!this.genAI || !this.modelo) {
        throw new Error('Gemini AI no está configurado. Verifica NEXT_PUBLIC_GEMINI_API_KEY');
      }

      // Extraer texto del PDF
      console.log('📄 Extrayendo texto del PDF...');
      const textoPDF = await this.extraerTextoDePDF(archivo);
      
      // Extraer imágenes del PDF
      console.log('🖼️ Extrayendo imágenes del PDF...');
      let imagenes: any[] = [];
      try {
        // Intentar con el extractor mejorado primero
        imagenes = await extractorImagenesPaginas.extraerImagenes(archivo);
        console.log(`✅ Imágenes extraídas con extractor mejorado: ${imagenes.length}`);
      } catch (error) {
        console.warn('⚠️ Error con extractor mejorado, usando extractor original:', error);
        // Fallback al extractor original
        imagenes = await extractorImagenesReal.extraerImagenes(archivo);
      }
      
      // Procesar con Gemini AI
      console.log('🤖 Procesando con Gemini AI...');
      const reporte = await this.procesarConGemini(textoPDF, archivo.name, imagenes);
      
      // Subir PDF a Google Drive (temporalmente deshabilitado)
      console.log('📁 Subiendo PDF a Google Drive...');
      try {
        await this.subirPDFaGoogleDrive(archivo, reporte);
        console.log('✅ PDF subido exitosamente a Google Drive');
      } catch (error) {
        console.warn('⚠️ Error al subir PDF a Google Drive:', error);
        console.log('📝 Continuando sin subir a Google Drive...');
      }
      
      console.log('✅ PDF procesado exitosamente con Gemini AI');
      return reporte;
      
    } catch (error) {
      console.error('❌ Error al procesar PDF:', error);
      throw new Error(`Error al procesar PDF: ${error instanceof Error ? error.message : 'Desconocido'}`);
    }
  }

  /**
   * Extrae texto real del PDF usando pdfjs-dist
   */
  private async extraerTextoDePDF(archivo: File): Promise<string> {
    try {
      const arrayBuffer = await archivo.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textoCompleto = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const pagina = await pdf.getPage(i);
        const contenido = await pagina.getTextContent();
        const textoPagina = contenido.items.map(item => (item as any).str).join(' ');
        textoCompleto += `\n--- PÁGINA ${i} ---\n${textoPagina}\n`;
      }
      
      return textoCompleto;
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error);
      throw new Error('No se pudo extraer el texto del PDF');
    }
  }

  /**
   * Procesa el texto con Gemini AI
   */
  private async procesarConGemini(texto: string, nombreArchivo: string, imagenes: any[]): Promise<ReporteVeterinario> {
    if (!this.genAI || !this.modelo) {
      throw new Error('Gemini AI no está configurado');
    }

    const prompt = `Actúa como un asistente de IA especializado en el análisis de documentos médicos veterinarios. Tu tarea es analizar el texto de un informe veterinario y extraer la información en un formato JSON estructurado.

## REGLAS IMPORTANTES:
1.  **RESPONDE ÚNICAMENTE CON EL OBJETO JSON.** No incluyas texto introductorio, explicaciones, comentarios fuera del JSON, ni la palabra \`json\` o \`\`\`json\`\`\` al principio o al final. Tu respuesta debe ser directamente el objeto JSON.
2.  **SÉ LITERAL:** Extrae la información tal como aparece en el texto. No inventes, infieras ni resumas datos que no estén explícitamente escritos.
3.  **MANEJA DATOS FALTANTES:** Si un campo de texto no se encuentra en el documento, utiliza un string vacío \`""\`. Si un campo de lista (array) no tiene elementos, utiliza un array vacío \`[]\`.
4.  **PROCESA LISTAS:** Para secciones con viñetas (•), guiones (-) o numeración, extrae cada punto como un elemento de string separado en el array JSON correspondiente.
5.  **VETERINARIOS MÚLTIPLES:** El informe puede estar firmado por varios veterinarios. Asegúrate de extraer a todos los que encuentres en la lista \`veterinarios\`.
6.  **NO INCLUYAS:** No incluyas marcadores de página (--- PÁGINA X ---) ni información duplicada que ya esté en otros campos.
7.  **INFORME ESTRUCTURADO:** En el campo "informe" incluye la información médica estructurada como en el PDF original, con secciones claras como "Se observa:", "DIAGNÓSTICO RADIOGRÁFICO:", "Notas:", etc.
8.  **IDENTIFICAR DERIVANTE:** El veterinario derivante es quien solicita el estudio, no necesariamente quien lo firma.

## FORMATO DE SALIDA JSON ESPERADO:
{
  "informacionEstudio": {
    "fecha": "DD/MM/YYYY", // La fecha en la que se realizó el estudio.
    "tipo": "radiografia", // Debe ser uno de: "radiografia", "ecografia", "analisis", "consulta", "otro".
    "solicitud": "Texto de la solicitud del estudio.",
    "veterinarioDerivante": "Nombre del veterinario que refiere el caso."
  },
  "paciente": {
    "nombre": "Nombre de la mascota.",
    "especie": "Especie del animal (ej: Canino, Felino).",
    "raza": "Raza del animal.",
    "edad": "Edad del animal como aparece en el texto.",
    "sexo": "Debe ser uno de: 'macho', 'hembra', 'castrado', 'esterilizada', 'desconocido'."
  },
  "tutor": {
    "nombre": "Nombre del propietario o tutor."
  },
  "veterinarios": [ // Una lista, ya que pueden ser varios.
    {
      "nombre": "Nombre completo del primer veterinario firmante.",
      "matricula": "Matrícula del primer veterinario (ej: M.P. 1234)."
    },
    {
      "nombre": "Nombre completo del segundo veterinario si existe.",
      "matricula": "Matrícula del segundo veterinario si existe."
    }
  ],
  "hallazgos": {
    // Corresponde a la sección "Se observa:" o similar. Lista de observaciones OBJETIVAS.
    "principales": [
      "Primer hallazgo objetivo descrito.",
      "Segundo hallazgo objetivo descrito.",
      "Tercer hallazgo objetivo descrito."
    ]
  },
  "conclusion": {
    // Corresponde a la sección "DIAGNÓSTICO" o "Conclusiones".
    "principales": [
      "Primer diagnóstico o conclusión.",
      "Segundo diagnóstico o conclusión."
    ],
    "notasAdicionales": "Texto encontrado en la sección 'Notas' o comentarios finales."
  },
  "tratamiento": {
    // Corresponde a la sección "Recomendaciones" o "Tratamiento".
    "recomendaciones": [
      "Primera recomendación o paso a seguir.",
      "Segunda recomendación o paso a seguir."
    ]
  },
  "contenidoAdicional": {
    "informe": "Información médica relevante del informe, incluyendo observaciones, diagnósticos, recomendaciones, etc. Sin marcadores de página ni información duplicada.",
    "observaciones": [
      "Observaciones encontradas en el texto.",
      "Notas del veterinario."
    ],
    "recomendaciones": [
      "Recomendaciones específicas de tratamiento.",
      "Instrucciones de cuidado."
    ],
    "medicamentos": [
      "Lista de medicamentos prescritos.",
      "Dosis y frecuencia si se mencionan."
    ],
    "procedimientos": [
      "Procedimientos realizados o recomendados.",
      "Técnicas utilizadas."
    ]
  }
}

## TEXTO DEL INFORME A ANALIZAR:
${texto}`;

    try {
      const resultado = await this.modelo.generateContent(prompt);
      const respuesta = await resultado.response;
      const textoRespuesta = respuesta.text();
      
      // Limpiar la respuesta para extraer solo el JSON
      const jsonMatch = textoRespuesta.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
      }
      
      const datos = JSON.parse(jsonMatch[0]);
      return this.crearReporteEstructurado(datos, nombreArchivo, imagenes, texto);
      
    } catch (error) {
      console.error('Error al procesar con Gemini:', error);
      throw error;
    }
  }

  /**
   * Crea un reporte estructurado a partir del resultado de Gemini
   */
  private crearReporteEstructurado(datos: any, nombreArchivo: string, imagenes: any[], texto: string): ReporteVeterinario {
    const ahora = new Date();
    
    return {
      id: `reporte_${Date.now()}`,
      fechaCreacion: ahora,
      archivoOriginal: nombreArchivo,
      estado: 'completado',
      confianzaExtraccion: 0.95, // Alta confianza con prompt especializado
      
      informacionEstudio: {
        fecha: datos.informacionEstudio?.fecha || new Date().toLocaleDateString('es-AR'),
        tipo: datos.informacionEstudio?.tipo || 'consulta',
        solicitud: datos.informacionEstudio?.solicitud || '',
        veterinarioDerivante: datos.informacionEstudio?.veterinarioDerivante || ''
      },
      
      paciente: {
        nombre: datos.paciente?.nombre || '',
        especie: datos.paciente?.especie || '',
        raza: datos.paciente?.raza || '',
        edad: datos.paciente?.edad || '',
        sexo: datos.paciente?.sexo || 'desconocido',
        peso: datos.paciente?.peso,
        identificacion: datos.paciente?.identificacion
      },
      
      tutor: {
        nombre: datos.tutor?.nombre || '',
        telefono: datos.tutor?.telefono,
        email: datos.tutor?.email,
        direccion: datos.tutor?.direccion
      },
      
      veterinarios: datos.veterinarios?.map((vet: any) => ({
        nombre: vet.nombre || '',
        matricula: vet.matricula || '',
        clinica: vet.clinica || ''
      })) || [],
      
      hallazgos: {
        resumen: datos.hallazgos?.resumen,
        principales: datos.hallazgos?.principales || []
      },
      
      conclusion: {
        principales: datos.conclusion?.principales || [],
        diferenciales: datos.conclusion?.diferenciales || [],
        notasAdicionales: datos.conclusion?.notasAdicionales || ''
      },
      
      tratamiento: {
        recomendaciones: datos.tratamiento?.recomendaciones || []
      },
      
      // Información adicional del PDF
      contenidoCompleto: {
        textoOriginal: texto, // Texto completo extraído del PDF
        informe: datos.contenidoAdicional?.informe || '',
        observaciones: datos.contenidoAdicional?.observaciones || [],
        recomendaciones: datos.contenidoAdicional?.recomendaciones || [],
        medicamentos: datos.contenidoAdicional?.medicamentos || [],
        procedimientos: datos.contenidoAdicional?.procedimientos || []
      },
      
      imagenes: imagenes,
      contenidoExtraido: 'Contenido extraído del PDF con Gemini AI'
    };
  }

  /**
   * Sube el PDF procesado a Google Drive
   */
  private async subirPDFaGoogleDrive(archivo: File, reporte: ReporteVeterinario): Promise<void> {
    try {
      // Preparar metadata para Google Drive
      const metadata = {
        paciente_nombre: reporte.paciente?.nombre || 'Sin nombre',
        veterinario_nombre: reporte.veterinarios?.[0]?.nombre || 'Sin veterinario',
        tipo_estudio: reporte.informacionEstudio?.tipo || 'Sin tipo',
        fecha_estudio: reporte.informacionEstudio?.fecha || new Date().toISOString()
      };

      // Subir archivo a Google Drive
      const respuesta = await servicioGoogleDriveOAuth2.subirPDF(archivo, metadata);

      if (respuesta.exito && respuesta.archivo) {
        console.log('✅ PDF subido exitosamente a Google Drive');
        console.log('📁 ID del archivo:', respuesta.archivo.id);
        console.log('🔗 URL del archivo:', respuesta.archivo.url);
        
        // Aquí podrías guardar la URL del archivo en la base de datos
        // para que el chatbot pueda acceder a él
        console.log('💾 Archivo disponible para el chatbot:', respuesta.archivo.url);
      } else {
        console.warn('⚠️ No se pudo subir el PDF a Google Drive:', respuesta.error);
        // No lanzamos error para que el procesamiento continúe
      }

    } catch (error) {
      console.error('❌ Error al subir PDF a Google Drive:', error);
      // No lanzamos error para que el procesamiento continúe
    }
  }

  /**
   * Procesa un PDF completo con opciones configurables
   */
  async procesarPDFConOpciones(archivo: File, opciones: OpcionesProcesamiento): Promise<RespuestaProcesamiento> {
    try {
      console.log('🔄 Iniciando procesamiento de PDF...');
      console.log('📄 Archivo:', archivo.name);
      console.log('⚙️ Opciones:', opciones);
      
      let reporte: ReporteVeterinario;
      let archivoDrive: any = null;
      
      // Extraer texto del PDF
      console.log('📄 Extrayendo texto del PDF...');
      const textoPDF = await this.extraerTextoDePDF(archivo);
      
      // Extraer imágenes del PDF si está habilitado
      let imagenes: any[] = [];
      if (opciones.extraerImagenes) {
        console.log('🖼️ Extrayendo imágenes del PDF...');
        try {
          // Intentar con el extractor mejorado primero
          imagenes = await extractorImagenesPaginas.extraerImagenes(archivo);
          console.log(`✅ Imágenes extraídas con extractor mejorado: ${imagenes.length}`);
        } catch (error) {
          console.warn('⚠️ Error con extractor mejorado, usando extractor original:', error);
          // Fallback al extractor original
          imagenes = await extractorImagenesReal.extraerImagenes(archivo);
        }
      }
      
      // Procesar con Gemini AI si está habilitado
      if (opciones.usarIA) {
        console.log('🤖 Procesando con Gemini AI...');
        reporte = await this.procesarConGemini(textoPDF, archivo.name, imagenes);
      } else {
        console.log('📝 Creando reporte básico sin IA...');
        reporte = this.crearReporteBasico(archivo, textoPDF, imagenes);
      }
      
      // Subir PDF ORIGINAL a Google Drive si está habilitado
      if (opciones.analizarYSubir) {
        console.log('📁 Subiendo PDF ORIGINAL a Google Drive...');
        try {
          const respuestaDrive = await this.subirPDFOriginalaGoogleDrive(archivo);
          if (respuestaDrive.exito && respuestaDrive.archivo) {
            archivoDrive = respuestaDrive.archivo;
            console.log('✅ PDF ORIGINAL subido exitosamente a Google Drive');
            console.log('📁 ID del archivo:', archivoDrive.id);
            console.log('🔗 URL del archivo:', archivoDrive.url);
            console.log('💾 Reporte procesado guardado en Supabase');
          }
        } catch (error) {
          console.warn('⚠️ Error al subir PDF ORIGINAL a Google Drive:', error);
          console.log('📝 Continuando sin subir a Google Drive...');
        }
      }
      
      console.log('✅ PDF procesado exitosamente');
      return {
        exito: true,
        reporte,
        archivoDrive
      };
      
    } catch (error) {
      console.error('❌ Error al procesar PDF:', error);
      return {
        exito: false,
        error: `Error al procesar PDF: ${error instanceof Error ? error.message : 'Desconocido'}`
      };
    }
  }

  /**
   * Sube el PDF ORIGINAL a Google Drive (sin procesar)
   */
  private async subirPDFOriginalaGoogleDrive(archivo: File): Promise<{exito: boolean, archivo?: any, error?: string}> {
    try {
      console.log('📁 Subiendo PDF ORIGINAL a Google Drive...');
      console.log('📄 Archivo:', archivo.name);
      console.log('📏 Tamaño:', (archivo.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Convertir archivo a buffer
      const arrayBuffer = await archivo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Subir usando el servicio de Google Drive
      const respuesta = await servicioGoogleDriveOAuth2.subirPDF(archivo.name, buffer, 'application/pdf');
      
      if (respuesta.exito && respuesta.archivo) {
        console.log('✅ PDF ORIGINAL subido exitosamente a Google Drive');
        console.log('📁 ID del archivo:', respuesta.archivo.id);
        console.log('🔗 URL del archivo:', respuesta.archivo.url);
        console.log('📂 Carpeta:', respuesta.archivo.carpeta_id);
        
        return {
          exito: true,
          archivo: {
            id: respuesta.archivo.id,
            nombre: archivo.name,
            url: respuesta.archivo.url,
            carpeta_id: respuesta.archivo.carpeta_id,
            tipo: 'pdf_original',
            tamaño: archivo.size,
            fecha_subida: new Date().toISOString()
          }
        };
      } else {
        console.warn('⚠️ No se pudo subir el PDF ORIGINAL a Google Drive:', respuesta.error);
        return {
          exito: false,
          error: respuesta.error || 'Error desconocido al subir PDF ORIGINAL'
        };
      }
      
    } catch (error) {
      console.error('❌ Error al subir PDF ORIGINAL a Google Drive:', error);
      return {
        exito: false,
        error: `Error al subir PDF ORIGINAL: ${error instanceof Error ? error.message : 'Desconocido'}`
      };
    }
  }

  /**
   * Crea un reporte básico sin IA
   */
  private crearReporteBasico(archivo: File, textoPDF: string, imagenes: any[]): ReporteVeterinario {
    return {
      id: Date.now().toString(),
      nombreArchivo: archivo.name,
      fechaProcesamiento: new Date().toISOString(),
      estado: 'completado',
      confianzaExtraccion: 0.5,
      
      informacionEstudio: {
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'otro',
        solicitud: 'Análisis básico de documento',
        veterinarioDerivante: 'No especificado'
      },
      
      paciente: {
        nombre: 'No especificado',
        especie: 'No especificado',
        raza: 'No especificado',
        edad: 'No especificado',
        sexo: 'desconocido'
      },
      
      tutor: {
        nombre: 'No especificado'
      },
      
      veterinarios: [{
        nombre: 'No especificado',
        matricula: 'No especificado',
        clinica: 'No especificado'
      }],
      
      hallazgos: {
        principales: ['Análisis básico realizado'],
        secundarios: [],
        observaciones: 'Documento procesado sin análisis de IA'
      },
      
      conclusion: {
        diagnostico: 'Análisis básico completado',
        recomendaciones: ['Revisar documento manualmente']
      },
      
      tratamiento: {
        medicamentos: [],
        procedimientos: [],
        seguimiento: 'Revisar con veterinario'
      },
      
      imagenes,
      contenidoExtraido: textoPDF
    };
  }
}

export const procesadorPDFReal = new ProcesadorPDFReal();