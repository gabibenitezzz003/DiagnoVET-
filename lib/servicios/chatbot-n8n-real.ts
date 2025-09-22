/**
 * Servicio real de chatbot con integración n8n
 * Usa la función proporcionada por el usuario
 */

import { MensajeChatbot } from '@/lib/tipos/reporte-veterinario'

export class ChatbotN8nReal {
  private webhookUrl: string
  private sessionId: string

  constructor() {
    this.webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''
    this.sessionId = `session_${Date.now()}`

    if (!this.webhookUrl) {
      console.warn('⚠️ N8N_WEBHOOK_URL no configurada')
    } else {
      console.log('✅ Chatbot n8n configurado:', this.webhookUrl)
    }
  }

  /**
   * Envía un mensaje al chatbot usando la función proporcionada
   */
  async enviarMensaje(mensaje: string): Promise<string> {
    try {
      if (!this.webhookUrl) {
        console.log('⚠️ Webhook URL no configurada, usando respuesta simulada')
        return this.generarRespuestaSimulada(mensaje)
      }

      console.log('🤖 Enviando mensaje a n8n webhook...')
      console.log('📝 Mensaje:', mensaje)
      console.log('🆔 Session ID:', this.sessionId)
      console.log('🔗 Webhook URL:', this.webhookUrl)

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          chatInput: mensaje,
          sessionId: this.sessionId
        })
      })

      console.log('📡 Status de respuesta:', response.status)
      console.log('📡 Headers de respuesta:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error en respuesta:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Respuesta recibida de n8n:', data)

      // Manejar diferentes formatos de respuesta de n8n
      if (data.response) {
        return data.response
      } else if (data.message) {
        return data.message
      } else if (data.text) {
        return data.text
      } else if (data.content) {
        return data.content
      } else if (typeof data === 'string') {
        return data
      } else {
        console.warn('⚠️ Formato de respuesta no reconocido:', data)
        return 'Respuesta recibida del chatbot'
      }

    } catch (error) {
      console.error('❌ Error al comunicarse con n8n:', error)
      console.log('🔄 Usando respuesta simulada como fallback')
      return this.generarRespuestaSimulada(mensaje)
    }
  }

  /**
   * Genera una respuesta simulada cuando n8n no está disponible
   */
  private generarRespuestaSimulada(mensaje: string): string {
    const mensajeLower = mensaje.toLowerCase()

    // Respuestas contextuales basadas en palabras clave
    if (mensajeLower.includes('radiografia') || mensajeLower.includes('rayos x')) {
      return `Para interpretar una radiografía correctamente, es importante evaluar:

1. **Posicionamiento**: Verificar que la imagen esté bien centrada y sin rotación
2. **Exposición**: La densidad ósea debe ser visible sin sobreexposición
3. **Estructuras anatómicas**: Revisar alineación, densidad y contornos
4. **Signos patológicos**: Buscar fracturas, luxaciones, masas o cambios en la densidad

¿Hay algún hallazgo específico que te preocupe en la radiografía?`
    }

    if (mensajeLower.includes('analisis') || mensajeLower.includes('laboratorio')) {
      return `Los análisis de laboratorio requieren interpretación cuidadosa considerando:

**Valores hematológicos:**
- Leucocitos: 6.0-17.0 x10³/μL (caninos), 5.5-19.5 x10³/μL (felinos)
- Hematocrito: 37-55% (caninos), 30-45% (felinos)
- Plaquetas: 200-500 x10³/μL

**Bioquímica básica:**
- Creatinina: <1.4 mg/dL
- BUN: <25 mg/dL
- ALT: <100 U/L

¿Qué valores específicos necesitas interpretar?`
    }

    if (mensajeLower.includes('cirugia') || mensajeLower.includes('quirurgico')) {
      return `Para procedimientos quirúrgicos, considera:

**Preoperatorio:**
- Evaluación completa del paciente
- Análisis preanestésico
- Preparación del campo quirúrgico

**Intraoperatorio:**
- Monitoreo anestésico continuo
- Técnica aséptica estricta
- Hemostasia adecuada

**Postoperatorio:**
- Control del dolor
- Prevención de infecciones
- Monitoreo de complicaciones

¿Qué tipo de cirugía estás planificando?`
    }

    if (mensajeLower.includes('medicamento') || mensajeLower.includes('farmaco')) {
      return `Para prescripción de medicamentos, recuerda:

**Consideraciones importantes:**
- Dosificación según peso y especie
- Vías de administración apropiadas
- Interacciones medicamentosas
- Contraindicaciones específicas

**Dosis comunes:**
- Antiinflamatorios: Meloxicam 0.1 mg/kg/día
- Antibióticos: Amoxicilina 10-20 mg/kg cada 12h
- Analgésicos: Tramadol 2-5 mg/kg cada 8-12h

¿Qué medicamento necesitas prescribir?`
    }

    if (mensajeLower.includes('emergencia') || mensajeLower.includes('urgencia')) {
      return `En situaciones de emergencia veterinaria:

**Prioridades inmediatas:**
1. Evaluar vías aéreas, respiración y circulación (ABC)
2. Controlar hemorragias
3. Estabilizar al paciente
4. Evaluar nivel de conciencia

**Signos de alarma:**
- Dificultad respiratoria severa
- Hemorragia masiva
- Shock
- Convulsiones prolongadas

¿Cuál es la situación de emergencia que estás enfrentando?`
    }

    // Respuesta general
    return `Entiendo tu consulta. Como asistente médico veterinario, puedo ayudarte con:

- Interpretación de estudios diagnósticos
- Protocolos de tratamiento
- Dosificación de medicamentos
- Manejo de emergencias
- Cirugía y procedimientos
- Medicina preventiva

¿Podrías ser más específico sobre tu consulta para darte una respuesta más precisa?`
  }

  /**
   * Obtiene sugerencias de preguntas frecuentes
   */
  obtenerSugerencias(): string[] {
    return [
      '¿Cómo interpretar una radiografía de tórax?',
      '¿Cuáles son los valores normales de laboratorio en caninos?',
      '¿Cómo diagnosticar una displasia de cadera?',
      '¿Qué hacer en caso de envenenamiento?',
      '¿Cómo manejar una fractura abierta?',
      '¿Cuál es el protocolo para cirugía de esterilización?',
      '¿Cómo tratar la insuficiencia renal aguda?',
      '¿Qué medicamentos usar para el dolor postoperatorio?'
    ]
  }

  /**
   * Obtiene el ID de sesión actual
   */
  obtenerSessionId(): string {
    return this.sessionId
  }

  /**
   * Establece un nuevo ID de sesión
   */
  establecerSessionId(nuevoSessionId: string): void {
    this.sessionId = nuevoSessionId
  }
}

export const chatbotN8nReal = new ChatbotN8nReal();
