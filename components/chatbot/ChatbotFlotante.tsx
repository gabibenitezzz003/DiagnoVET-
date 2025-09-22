'use client'

import { useState, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { chatbotN8nReal } from '@/lib/servicios/chatbot-n8n-real'
import { toast } from 'react-hot-toast'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
  timestamp: Date
}

export default function ChatbotFlotante() {
  const [mostrar, setMostrar] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      tipo: 'asistente',
      contenido: '¡Hola! Soy el asistente médico de DiagnoVET. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ])
  const [mensajeActual, setMensajeActual] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || enviando) return

    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: mensajeActual,
      timestamp: new Date()
    }

    setMensajes(prev => [...prev, nuevoMensaje])
    const mensajeParaEnviar = mensajeActual
    setMensajeActual('')
    setEnviando(true)

    try {
      console.log('🤖 Enviando mensaje al chatbot...')

      // Enviar mensaje al chatbot real
      const respuesta = await chatbotN8nReal.enviarMensaje(mensajeParaEnviar)

      const respuestaAsistente: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: respuesta,
        timestamp: new Date()
      }

      setMensajes(prev => [...prev, respuestaAsistente])
      console.log('✅ Respuesta recibida del chatbot')

    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error)
      toast.error('Error al enviar mensaje al chatbot')

      // Respuesta de fallback
      const respuestaFallback: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }

      setMensajes(prev => [...prev, respuestaFallback])
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!mostrar && (
        <button
          onClick={() => setMostrar(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-primario-600 text-white rounded-full shadow-lg hover:bg-primario-700 transition-all duration-300 flex items-center justify-center z-50 group"
          title="Abrir Chatbot"
        >
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-exito-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Ventana del chatbot */}
      {mostrar && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primario-600 text-white rounded-t-xl">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <h3 className="font-semibold">Asistente Médico</h3>
              <div className="w-2 h-2 bg-exito-500 rounded-full animate-pulse"></div>
            </div>
            <button
              onClick={() => setMostrar(false)}
              className="p-1 hover:bg-primario-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${mensaje.tipo === 'usuario' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mensaje.tipo === 'usuario'
                      ? 'bg-primario-600'
                      : 'bg-gray-100'
                    }`}>
                    {mensaje.tipo === 'usuario' ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <CpuChipIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div className={`px-4 py-2 rounded-lg ${mensaje.tipo === 'usuario'
                      ? 'bg-primario-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
                    <p className={`text-xs mt-1 ${mensaje.tipo === 'usuario' ? 'text-primario-100' : 'text-gray-500'
                      }`}>
                      {mensaje.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {enviando && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <CpuChipIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input de mensaje */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                type="text"
                value={mensajeActual}
                onChange={(e) => setMensajeActual(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta veterinaria..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent"
                disabled={enviando}
              />
              <button
                onClick={enviarMensaje}
                disabled={!mensajeActual.trim() || enviando}
                className="px-6 py-2 bg-primario-600 text-white rounded-lg hover:bg-primario-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
