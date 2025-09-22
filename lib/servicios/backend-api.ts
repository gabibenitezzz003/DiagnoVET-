/**
 * Servicio para comunicación con el backend de DiagnoVET
 */

import { ReporteVeterinario, RespuestaProcesamiento } from '../tipos/reporte-veterinario';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export class BackendAPIService {
    private baseURL: string;

    constructor() {
        this.baseURL = BACKEND_URL;
    }

    /**
     * Procesa un PDF enviándolo al backend
     */
    async procesarPDF(archivo: File): Promise<RespuestaProcesamiento> {
        try {
            console.log('🚀 Enviando PDF al backend para procesamiento...');

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('archivo', archivo);

            // Enviar al backend
            const response = await fetch(`${this.baseURL}/api/reportes/procesar`, {
                method: 'POST',
                body: formData,
                headers: {
                    // No agregar Content-Type, fetch lo maneja automáticamente para FormData
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al procesar el PDF');
            }

            console.log('✅ PDF procesado exitosamente por el backend');
            console.log('📊 Datos del reporte:', data.datos);

            // Convertir la respuesta del backend al formato esperado por el frontend
            const reporte: ReporteVeterinario = {
                id: data.datos.id,
                fechaCreacion: data.datos.fecha_creacion ? new Date(data.datos.fecha_creacion) : new Date(),
                // fechaActualizacion: data.datos.fecha_actualizacion ? new Date(data.datos.fecha_actualizacion) : new Date(),
                informacionEstudio: {
                    tipo: data.datos.tipo_estudio || 'otro',
                    fecha: data.datos.fecha_creacion || new Date().toISOString(),
                    solicitud: data.datos.solicitud || ''
                },
                paciente: data.datos.paciente || {},
                tutor: data.datos.tutor || {},
                veterinarios: data.datos.veterinarios || [],
                hallazgos: data.datos.hallazgos || {
                    resumen: '',
                    principales: []
                },
                conclusion: data.datos.conclusion || {
                    principales: [],
                    diferenciales: [],
                    notasAdicionales: ''
                },
                tratamiento: data.datos.tratamiento || {
                    recomendaciones: []
                },
                imagenes: data.datos.imagenes || [],
                archivoOriginal: data.datos.archivo_original,
                contenidoExtraido: data.datos.contenido_extraido || '',
                confianzaExtraccion: data.datos.confianza_extraccion || 0,
                estado: data.datos.estado || 'procesando',
                // urlGoogleDrive: data.datos.url_google_drive,
                // idGoogleDrive: data.datos.id_google_drive
            };

            return {
                exito: true,
                reporte,
                archivoDrive: data.datos.google_drive ? {
                    id: data.datos.google_drive.id,
                    url: data.datos.google_drive.url,
                    nombre: data.datos.google_drive.nombre,
                    carpeta_id: data.datos.google_drive.carpeta_id || ''
                } : (data.datos.url_google_drive ? {
                    id: data.datos.id_google_drive,
                    url: data.datos.url_google_drive,
                    nombre: data.datos.archivo_original,
                    carpeta_id: ''
                } : undefined),
                // mensaje: data.mensaje || 'PDF procesado exitosamente'
            };

        } catch (error) {
            console.error('❌ Error al procesar PDF en el backend:', error);
            return {
                exito: false,
                error: error instanceof Error ? error.message : 'Error desconocido al procesar PDF'
            };
        }
    }

    /**
     * Verifica la conexión con el backend
     */
    async verificarConexion(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/api/archivos/test-google-drive`);
            const data = await response.json();
            return data.exito === true;
        } catch (error) {
            console.error('❌ Error al verificar conexión con backend:', error);
            return false;
        }
    }

    /**
     * Obtiene la lista de reportes desde el backend
     */
    async obtenerReportes(filtros: any = {}, pagina: number = 1, limite: number = 10): Promise<ReporteVeterinario[]> {
        try {
            const params = new URLSearchParams();
            if (filtros.tipoEstudio) params.append('tipo_estudio', filtros.tipoEstudio);
            if (filtros.especie) params.append('especie', filtros.especie);
            if (filtros.veterinario) params.append('veterinario', filtros.veterinario);
            params.append('pagina', pagina.toString());
            params.append('limite', limite.toString());

            const response = await fetch(`${this.baseURL}/api/reportes?${params.toString()}`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al obtener reportes');
            }

            return data.datos.map((reporte: any) => ({
                id: reporte.id,
                fechaCreacion: new Date(reporte.fecha_creacion || reporte.creado_en),
                // fechaActualizacion: new Date(reporte.fecha_actualizacion || reporte.actualizado_en),
                informacionEstudio: {
                    tipo: reporte.tipo_estudio || 'otro',
                    fecha: reporte.fecha_creacion || new Date().toISOString(),
                    solicitud: reporte.solicitud || ''
                },
                paciente: reporte.paciente,
                tutor: reporte.tutor,
                veterinarios: reporte.veterinarios || [],
                hallazgos: reporte.hallazgos || {
                    resumen: '',
                    principales: []
                },
                conclusion: reporte.conclusion || {
                    principales: [],
                    diferenciales: [],
                    notasAdicionales: ''
                },
                tratamiento: reporte.tratamiento || {
                    recomendaciones: []
                },
                imagenes: reporte.imagenes || [],
                archivoOriginal: reporte.archivo_original,
                contenidoExtraido: reporte.contenido_extraido,
                confianzaExtraccion: reporte.confianza_extraccion,
                estado: reporte.estado,
                // urlGoogleDrive: reporte.url_google_drive,
                // idGoogleDrive: reporte.id_google_drive
            }));

        } catch (error) {
            console.error('❌ Error al obtener reportes:', error);
            return [];
        }
    }

    /**
     * Obtiene un reporte específico por ID
     */
    async obtenerReportePorId(reporteId: string): Promise<ReporteVeterinario | null> {
        try {
            const response = await fetch(`${this.baseURL}/api/reportes/${reporteId}`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al obtener reporte');
            }

            const reporte = data.datos;
            return {
                id: reporte.id,
                fechaCreacion: new Date(reporte.fecha_creacion || reporte.creado_en),
                // fechaActualizacion: new Date(reporte.fecha_actualizacion || reporte.actualizado_en),
                informacionEstudio: {
                    tipo: reporte.tipo_estudio || 'otro',
                    fecha: reporte.fecha_creacion || new Date().toISOString(),
                    solicitud: reporte.solicitud || ''
                },
                paciente: reporte.paciente,
                tutor: reporte.tutor,
                veterinarios: reporte.veterinarios || [],
                hallazgos: reporte.hallazgos || {
                    resumen: '',
                    principales: []
                },
                conclusion: reporte.conclusion || {
                    principales: [],
                    diferenciales: [],
                    notasAdicionales: ''
                },
                tratamiento: reporte.tratamiento || {
                    recomendaciones: []
                },
                imagenes: reporte.imagenes || [],
                archivoOriginal: reporte.archivo_original,
                contenidoExtraido: reporte.contenido_extraido,
                confianzaExtraccion: reporte.confianza_extraccion,
                estado: reporte.estado,
                // urlGoogleDrive: reporte.url_google_drive,
                // idGoogleDrive: reporte.id_google_drive
            };

        } catch (error) {
            console.error('❌ Error al obtener reporte:', error);
            return null;
        }
    }

    /**
     * Busca reportes por término
     */
    async buscarReportes(termino: string, limite: number = 10): Promise<ReporteVeterinario[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/reportes/buscar?termino=${encodeURIComponent(termino)}&limite=${limite}`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al buscar reportes');
            }

            return data.datos.map((reporte: any) => ({
                id: reporte.id,
                fechaCreacion: new Date(reporte.fecha_creacion || reporte.creado_en),
                // fechaActualizacion: new Date(reporte.fecha_actualizacion || reporte.actualizado_en),
                informacionEstudio: {
                    tipo: reporte.tipo_estudio || 'otro',
                    fecha: reporte.fecha_creacion || new Date().toISOString(),
                    solicitud: reporte.solicitud || ''
                },
                paciente: reporte.paciente,
                tutor: reporte.tutor,
                veterinarios: reporte.veterinarios || [],
                hallazgos: reporte.hallazgos || {
                    resumen: '',
                    principales: []
                },
                conclusion: reporte.conclusion || {
                    principales: [],
                    diferenciales: [],
                    notasAdicionales: ''
                },
                tratamiento: reporte.tratamiento || {
                    recomendaciones: []
                },
                imagenes: reporte.imagenes || [],
                archivoOriginal: reporte.archivo_original,
                contenidoExtraido: reporte.contenido_extraido,
                confianzaExtraccion: reporte.confianza_extraccion,
                estado: reporte.estado,
                // urlGoogleDrive: reporte.url_google_drive,
                // idGoogleDrive: reporte.id_google_drive
            }));

        } catch (error) {
            console.error('❌ Error al buscar reportes:', error);
            return [];
        }
    }

    /**
     * Obtiene la lista de veterinarios
     */
    async obtenerVeterinarios(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/veterinarios`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al obtener veterinarios');
            }

            return data.datos;

        } catch (error) {
            console.error('❌ Error al obtener veterinarios:', error);
            return [];
        }
    }

    /**
     * Obtiene la lista de pacientes
     */
    async obtenerPacientes(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/pacientes`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al obtener pacientes');
            }

            return data.datos;

        } catch (error) {
            console.error('❌ Error al obtener pacientes:', error);
            return [];
        }
    }

    /**
     * Obtiene la lista de turnos
     */
    async obtenerTurnos(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/turnos`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al obtener turnos');
            }

            return data.datos;

        } catch (error) {
            console.error('❌ Error al obtener turnos:', error);
            return [];
        }
    }

    /**
     * Crea un nuevo turno
     */
    async crearTurno(turno: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/api/turnos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(turno),
            });

            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al crear turno');
            }

            return data.datos;

        } catch (error) {
            console.error('❌ Error al crear turno:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas del sistema
     */
    async obtenerEstadisticas(): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/api/estadisticas`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al obtener estadísticas');
            }

            return data.datos;

        } catch (error) {
            console.error('❌ Error al obtener estadísticas:', error);
            return null;
        }
    }

    /**
     * Envía un mensaje al chatbot
     */
    async enviarMensajeChatbot(mensaje: string, sessionId: string, historial: any[] = []): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/api/chatbot/mensaje`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mensaje,
                    session_id: sessionId,
                    historial
                }),
            });

            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al enviar mensaje al chatbot');
            }

            return data.datos;

        } catch (error) {
            console.error('❌ Error al enviar mensaje al chatbot:', error);
            throw error;
        }
    }

    /**
     * Obtiene sugerencias del chatbot
     */
    async obtenerSugerenciasChatbot(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/chatbot/sugerencias`);
            const data = await response.json();

            if (!data.exito) {
                throw new Error(data.error || 'Error al obtener sugerencias');
            }

            return data.datos;

        } catch (error) {
            console.error('❌ Error al obtener sugerencias:', error);
            return [];
        }
    }
}

// Instancia singleton
export const backendAPI = new BackendAPIService();
