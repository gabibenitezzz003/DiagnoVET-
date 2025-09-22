'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Bot, User, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { MensajeChatbot } from '@/lib/tipos/reporte-veterinario'
import { chatbotN8nReal } from '@/lib/servicios/chatbot-n8n-real'
import { ListaMensajes } from './ListaMensajes'
import { FormularioMensaje } from './FormularioMensaje'
import { SugerenciasChatbot } from './SugerenciasChatbot'
import toast from 'react-hot-toast'

interface SeccionChatbotProps {
  disponible: boolean
}

export function SeccionChatbot({ disponible }: SeccionChatbotProps) {
  const [mensajes, setMensajes] = useState<MensajeChatbot[]>([])
  const [mensajeActual, setMensajeActual] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const mensajesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cargarSugerencias()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const cargarSugerencias = async () => {
    try {
      const sugerencias = chatbotN8nReal.obtenerSugerencias()
      setSugerencias(sugerencias)
    } catch (error) {
      console.error('Error al cargar sugerencias:', error)
    }
  }

  const enviarMensaje = async (contenido: string) => {
    if (!contenido.trim() || enviando) return

    try {
      setEnviando(true)
      setMensajeActual('')

      // Crear mensaje de usuario
      const mensajeUsuario: MensajeChatbot = {
        id: `msg_${Date.now()}`,
        contenido,
        tipo: 'usuario',
        timestamp: new Date().toISOString(),
        session_id: sessionId
      }
      setMensajes(prev => [...prev, mensajeUsuario])

      // Enviar al chatbot
      const respuesta = await chatbotN8nReal.enviarMensaje(contenido)

      if (respuesta) {
        // Crear mensaje de respuesta
        const mensajeRespuesta: MensajeChatbot = {
          id: `msg_${Date.now() + 1}`,
          contenido: respuesta,
          tipo: 'asistente',
          timestamp: new Date().toISOString(),
          session_id: sessionId
        }
        setMensajes(prev => [...prev, mensajeRespuesta])
        toast.success('Respuesta recibida')
      } else {
        throw new Error('Error al enviar mensaje')
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      toast.error('Error al enviar mensaje al chatbot')

      // Agregar mensaje de error
      const mensajeError: MensajeChatbot = {
        id: `msg_error_${Date.now()}`,
        contenido: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        tipo: 'asistente',
        timestamp: new Date().toISOString(),
        session_id: sessionId
      }
      setMensajes(prev => [...prev, mensajeError])
    } finally {
      setEnviando(false)
    }
  }

  const manejarSugerencia = (sugerencia: string) => {
    setMensajeActual(sugerencia)
    setMostrarSugerencias(false)
  }

  const limpiarConversacion = () => {
    setMensajes([])
    setMensajeActual('')
    toast.success('Conversación limpiada')
  }

  if (!disponible) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chatbot No Disponible
          </h3>
          <p className="text-gray-600 mb-4">
            El chatbot está temporalmente fuera de servicio
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-primario-100 p-2 rounded-lg">
            <Bot className="h-5 w-5 text-primario-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Dr. VetAI</h3>
            <p className="text-sm text-gray-500">Asistente Veterinario</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-exito-600">
            <CheckCircle className="h-4 w-4" />
            <span>En línea</span>
          </div>
          <button
            onClick={limpiarConversacion}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            title="Limpiar conversación"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Lista de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              ¡Hola! Soy Dr. VetAI
            </h4>
            <p className="text-gray-600 mb-4">
              Tu asistente especializado en medicina veterinaria.
              ¿En qué puedo ayudarte hoy?
            </p>
            {sugerencias.length > 0 && (
              <SugerenciasChatbot
                sugerencias={sugerencias}
                onSeleccionarSugerencia={manejarSugerencia}
              />
            )}
          </div>
        ) : (
          <ListaMensajes mensajes={mensajes} />
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Formulario de Mensaje */}
      <div className="p-4 border-t border-gray-200">
        <FormularioMensaje
          mensaje={mensajeActual}
          onCambioMensaje={setMensajeActual}
          onEnviarMensaje={enviarMensaje}
          enviando={enviando}
          onMostrarSugerencias={() => setMostrarSugerencias(!mostrarSugerencias)}
          mostrarSugerencias={mostrarSugerencias}
          sugerencias={sugerencias}
          onSeleccionarSugerencia={manejarSugerencia}
        />
      </div>
    </div>
  )
}
