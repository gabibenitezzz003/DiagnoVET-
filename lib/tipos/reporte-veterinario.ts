// /tipos/reporte-veterinario.ts

/**
 * ==========================
 * DEFINICIONES DE ENTIDADES PRINCIPALES
 * Representan a los actores involucrados en el reporte.
 * =====================================
 */

export interface InformacionPaciente {
  readonly nombre: string;
  readonly especie: string;
  readonly raza: string;
  readonly edad: string;
  readonly sexo: 'macho' | 'hembra' | 'castrado' | 'esterilizada' | 'desconocido';
  readonly peso?: string;
  readonly identificacion?: string;
}

export interface InformacionTutor {
  readonly nombre: string;
  readonly telefono?: string;
  readonly email?: string;
  readonly direccion?: string;
}

export interface InformacionVeterinario {
  readonly nombre: string;
  readonly matricula?: string;
  readonly clinica?: string;
}


/**
 * ====================================================================
 * ESTRUCTURA DEL INFORME MÉDICO
 * Estas interfaces dividen el reporte en secciones lógicas y ordenadas,
 * evitando que la información se mezcle.
 * ====================================================================
 */

/**
 * SECCIÓN NUEVA: Metadatos sobre el estudio en sí.
 */
export interface InformacionEstudio {
  readonly fecha: string; // Fecha en la que se realizó el estudio
  readonly tipo: 'radiografia' | 'ecografia' | 'analisis' | 'consulta' | 'otro';
  readonly solicitud: string; // Motivo del estudio o solicitud
  readonly veterinarioDerivante?: string;
}

/**
 * SECCIÓN NUEVA: Separa los hallazgos observados del diagnóstico final.
 * Corresponde a la sección "Se observa:" del PDF.
 */
export interface HallazgosClinicos {
  readonly resumen?: string; // Un resumen general si lo hubiera.
  readonly principales: string[]; // Lista ordenada de hallazgos puntuales (ej: viñetas).
}

/**
 * SECCIÓN NUEVA: Contiene la conclusión del profesional.
 * Corresponde a la sección "DIAGNÓSTICO RADIOGRÁFICO" del PDF.
 */
export interface ConclusionDiagnostica {
  readonly principales: string[]; // Lista de diagnósticos principales.
  readonly diferenciales?: string[]; // Diagnósticos menos probables.
  readonly notasAdicionales?: string; // Comentarios o notas finales.
}

/**
 * SECCIÓN NUEVA: Aísla las recomendaciones para que no se mezclen.
 * Corresponde a la sección "Notas:" o "Recomendaciones:" del PDF.
 */
export interface TratamientoRecomendado {
  readonly recomendaciones: string[];
}

export interface ImagenMedica {
  readonly id: string;
  readonly nombre: string;
  readonly url: string;
  readonly descripcion: string;
  readonly tipo: 'radiografia' | 'ecografia' | 'ecocardiografia' | 'analisis' | 'otro';
  readonly pagina: number;
}


/**
 * ====================================================================
 * EL REPORTE VETERINARIO FINAL Y ESTRUCTURADO
 * Esta es la interfaz principal que une todas las piezas de forma ordenada.
 * ====================================================================
 */

export interface ReporteVeterinario {
  readonly id: string;
  readonly fechaCreacion: Date;
  readonly archivoOriginal: string;
  readonly estado: 'procesando' | 'completado' | 'error';
  readonly confianzaExtraccion: number;

  // --- Datos Estructurados y Ordenados ---
  readonly informacionEstudio: InformacionEstudio;
  readonly paciente: InformacionPaciente;
  readonly tutor: InformacionTutor;
  readonly veterinarios: InformacionVeterinario[]; // Puede haber más de un veterinario firmante

  // --- Secciones Médicas Claras ---
  readonly hallazgos: HallazgosClinicos;
  readonly conclusion: ConclusionDiagnostica;
  readonly tratamiento: TratamientoRecomendado;

  // --- Activos y Contenido Crudo ---
  readonly imagenes: ImagenMedica[];
  readonly contenidoExtraido: string; // El texto completo para referencia
  readonly markdownCompleto?: string; // El contenido en formato Markdown
}

/**
 * ====================================================================
 * OPCIONES DE PROCESAMIENTO
 * Interfaces para manejar diferentes opciones de procesamiento de PDFs
 * ====================================================================
 */

export interface OpcionesProcesamiento {
  soloAnalizar: boolean
  analizarYSubir: boolean
  extraerImagenes: boolean
  usarIA: boolean
}

export interface ProcesarPDFRequest {
  archivo: File
  opciones: OpcionesProcesamiento
}

export interface RespuestaProcesamiento {
  exito: boolean
  reporte?: ReporteVeterinario
  archivoDrive?: {
    id: string
    nombre: string
    url: string
    carpeta_id: string
  }
  error?: string
}