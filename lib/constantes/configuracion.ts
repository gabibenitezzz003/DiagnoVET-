/**
 * Constantes de configuración del sistema
 * Centraliza todas las configuraciones para facilitar mantenimiento
 */

export const CONFIGURACION_APLICACION = {
  NOMBRE: 'DiagnoVET - Sistema de Reportes',
  VERSION: '1.0.0',
  DESCRIPCION: 'Sistema de procesamiento de reportes veterinarios con IA',
} as const;

export const CONFIGURACION_API = {
  URL_BASE: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  REINTENTOS: 3,
} as const;

export const CONFIGURACION_BACKEND = {
  URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  REINTENTOS: 3,
  ENDPOINTS: {
    REPORTES: '/api/reportes',
    VETERINARIOS: '/api/veterinarios',
    PACIENTES: '/api/pacientes',
    TURNOS: '/api/turnos',
    CHATBOT: '/api/chatbot',
    ESTADISTICAS: '/api/estadisticas',
    ARCHIVOS: '/api/archivos',
  },
} as const;

export const CONFIGURACION_SUPABASE = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  CLAVE_ANONIMA: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  TABLA_REPORTES: 'reportes_veterinarios',
  TABLA_IMAGENES: 'imagenes_medicas',
  TABLA_CHATBOT: 'mensajes_chat',
  TABLA_PACIENTES: 'pacientes',
  TABLA_VETERINARIOS: 'veterinarios',
  TABLA_DIAGNOSTICOS: 'diagnosticos',
  TABLA_HALLAZGOS: 'hallazgos_clinicos',
  TABLA_TURNOS: 'turnos',
  TABLA_SESIONES: 'sesiones_chat',
} as const;

export const CONFIGURACION_CHATBOT = {
  WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '',
  TIMEOUT: 30000,
  REINTENTOS: 2,
} as const;

export const CONFIGURACION_ARCHIVOS = {
  TAMANO_MAXIMO: 10 * 1024 * 1024, // 10MB
  TIPOS_PERMITIDOS: ['application/pdf', 'image/jpeg', 'image/png'],
  RUTA_UPLOADS: './uploads',
} as const;

export const CONFIGURACION_IA = {
  MODELO_OCR: 'tesseract',
  MODELO_LLM: 'gpt-3.5-turbo',
  CONFIANZA_MINIMA: 0.7,
  TIMEOUT_PROCESAMIENTO: 60000,
} as const;

export const CONFIGURACION_UI = {
  ELEMENTOS_POR_PAGINA: 10,
  DEBOUNCE_BUSQUEDA: 300,
  ANIMACION_DURACION: 200,
} as const;

export const MENSAJES_SISTEMA = {
  CARGA_EXITOSA: 'Reporte procesado exitosamente',
  ERROR_PROCESAMIENTO: 'Error al procesar el reporte',
  ERROR_SUBIDA: 'Error al subir el archivo',
  ERROR_CONEXION: 'Error de conexión con el servidor',
  ARCHIVO_NO_VALIDO: 'Tipo de archivo no válido',
  ARCHIVO_MUY_GRANDE: 'El archivo es demasiado grande',
  BUSQUEDA_SIN_RESULTADOS: 'No se encontraron reportes',
  CHATBOT_ERROR: 'Error en el chatbot',
  CHATBOT_TIMEOUT: 'El chatbot tardó demasiado en responder',
} as const;

export const TIPOS_ESTUDIO = [
  { valor: 'radiografia', etiqueta: 'Radiografía' },
  { valor: 'ecografia', etiqueta: 'Ecografía' },
  { valor: 'analisis', etiqueta: 'Análisis' },
  { valor: 'consulta', etiqueta: 'Consulta' },
  { valor: 'otro', etiqueta: 'Otro' },
] as const;

export const ESPECIES = [
  { valor: 'canino', etiqueta: 'Canino' },
  { valor: 'felino', etiqueta: 'Felino' },
  { valor: 'equino', etiqueta: 'Equino' },
  { valor: 'bovino', etiqueta: 'Bovino' },
  { valor: 'porcino', etiqueta: 'Porcino' },
  { valor: 'otro', etiqueta: 'Otro' },
] as const;

export const ESTADOS_REPORTE = [
  { valor: 'procesando', etiqueta: 'Procesando', color: 'advertencia' },
  { valor: 'completado', etiqueta: 'Completado', color: 'exito' },
  { valor: 'error', etiqueta: 'Error', color: 'error' },
] as const;
