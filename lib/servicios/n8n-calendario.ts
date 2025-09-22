/**
 * Servicio para comunicación con n8n - Gestión de Turnos
 * Sigue exactamente la documentación del workflow calendario_diagnovet.md
 */

interface TurnoN8nRequest {
  id: string
  tipo_evento: 'crear' | 'modificar' | 'cancelar'
  fecha_hora: string
  tutor: string
  email_tutor: string
  paciente: string
  tipo_consulta: string
  veterinario?: string
  notas?: string
  precio?: number
}

interface TurnoN8nResponse {
  exito: boolean
  mensaje: string
  evento_calendar_id?: string
  error?: string
}

export class ServicioN8nCalendario {
  private webhookUrl: string

  constructor() {
    this.webhookUrl = process.env.NEXT_PUBLIC_N8N_CALENDARIO_WEBHOOK_URL || ''

    if (!this.webhookUrl) {
      console.warn('⚠️ N8N_CALENDARIO_WEBHOOK_URL no configurada')
    }
  }

  /**
   * Crear turno - Envía petición al workflow de n8n
   * Sigue exactamente el formato especificado en la documentación
   */
  async crearTurno(turno: {
    id: string
    fecha_hora: string
    tutor: string
    email_tutor: string
    paciente: string
    tipo_consulta: string
    veterinario?: string
    notas?: string
    precio?: number
  }): Promise<TurnoN8nResponse> {
    if (!this.webhookUrl) {
      return {
        exito: false,
        error: 'Webhook URL no configurada',
        mensaje: 'Webhook URL no configurada'
      }
    }

    // Construir query parameters para GET
    const params = new URLSearchParams({
      id: turno.id,
      tipo_evento: 'crear',
      fecha_hora: turno.fecha_hora,
      tutor: turno.tutor,
      email_tutor: turno.email_tutor,
      paciente: turno.paciente,
      tipo_consulta: turno.tipo_consulta,
      ...(turno.veterinario && { veterinario: turno.veterinario }),
      ...(turno.notas && { notas: turno.notas }),
      ...(turno.precio && { precio: turno.precio.toString() })
    })

    try {
      console.log('🔄 Enviando petición a n8n para crear turno:', params.toString())

      const response = await fetch(`${this.webhookUrl}?${params}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      console.log('✅ Respuesta de n8n:', data)

      return {
        exito: true,
        mensaje: 'Turno creado exitosamente en Google Calendar',
        evento_calendar_id: data.evento_calendar_id
      }
    } catch (error) {
      console.error('❌ Error al crear turno en n8n:', error)
      return {
        exito: false,
        error: `Error al crear turno: ${error}`,
        mensaje: `Error al crear turno: ${error}`
      }
    }
  }

  /**
   * Modificar turno - Envía petición al workflow de n8n
   * Sigue exactamente el formato especificado en la documentación
   */
  async modificarTurno(turno: {
    id: string
    fecha_hora: string
    tutor: string
    email_tutor: string
    paciente: string
    tipo_consulta: string
    veterinario?: string
    notas?: string
    precio?: number
  }): Promise<TurnoN8nResponse> {
    if (!this.webhookUrl) {
      return {
        exito: false,
        error: 'Webhook URL no configurada',
        mensaje: 'Webhook URL no configurada'
      }
    }

    // Construir query parameters para GET
    const params = new URLSearchParams({
      id: turno.id,
      tipo_evento: 'modificar',
      fecha_hora: turno.fecha_hora,
      tutor: turno.tutor,
      email_tutor: turno.email_tutor,
      paciente: turno.paciente,
      tipo_consulta: turno.tipo_consulta,
      ...(turno.veterinario && { veterinario: turno.veterinario }),
      ...(turno.notas && { notas: turno.notas }),
      ...(turno.precio && { precio: turno.precio.toString() })
    })

    try {
      console.log('🔄 Enviando petición a n8n para modificar turno:', params.toString())

      const response = await fetch(`${this.webhookUrl}?${params}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      console.log('✅ Respuesta de n8n:', data)

      return {
        exito: true,
        mensaje: 'Turno modificado exitosamente en Google Calendar',
        evento_calendar_id: data.evento_calendar_id
      }
    } catch (error) {
      console.error('❌ Error al modificar turno en n8n:', error)
      return {
        exito: false,
        error: `Error al modificar turno: ${error}`,
        mensaje: `Error al modificar turno: ${error}`
      }
    }
  }

  /**
   * Cancelar turno - Envía petición al workflow de n8n
   * Sigue exactamente el formato especificado en la documentación
   */
  async cancelarTurno(turno: {
    id: string
    fecha_hora: string
    tutor: string
    email_tutor: string
    paciente: string
    tipo_consulta: string
  }): Promise<TurnoN8nResponse> {
    if (!this.webhookUrl) {
      return {
        exito: false,
        error: 'Webhook URL no configurada',
        mensaje: 'Webhook URL no configurada'
      }
    }

    // Construir query parameters para GET
    const params = new URLSearchParams({
      id: turno.id,
      tipo_evento: 'cancelar',
      fecha_hora: turno.fecha_hora,
      tutor: turno.tutor,
      email_tutor: turno.email_tutor,
      paciente: turno.paciente,
      tipo_consulta: turno.tipo_consulta
    })

    try {
      console.log('🔄 Enviando petición a n8n para cancelar turno:', params.toString())

      const response = await fetch(`${this.webhookUrl}?${params}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      console.log('✅ Respuesta de n8n:', data)

      return {
        exito: true,
        mensaje: 'Turno cancelado exitosamente en Google Calendar'
      }
    } catch (error) {
      console.error('❌ Error al cancelar turno en n8n:', error)
      return {
        exito: false,
        error: `Error al cancelar turno: ${error}`,
        mensaje: `Error al cancelar turno: ${error}`
      }
    }
  }

  /**
   * Verificar conexión con n8n
   */
  async verificarConexion(): Promise<boolean> {
    if (!this.webhookUrl) {
      return false
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'test_connection',
          tipo_evento: 'crear',
          fecha_hora: new Date().toISOString(),
          tutor: 'Test',
          email_tutor: 'test@test.com',
          paciente: 'Test Pet',
          tipo_consulta: 'Test'
        })
      })

      return response.ok
    } catch (error) {
      console.error('❌ Error al verificar conexión con n8n:', error)
      return false
    }
  }
}

// Instancia singleton
export const servicioN8nCalendario = new ServicioN8nCalendario()
