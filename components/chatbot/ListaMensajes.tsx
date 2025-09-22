'use client'

import { Bot, User, Clock } from 'lucide-react'
import { MensajeChatbot } from '@/lib/tipos/reporte-veterinario'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ListaMensajesProps {
  mensajes: MensajeChatbot[]
}

export function ListaMensajes({ mensajes }: ListaMensajesProps) {
  const formatearTiempo = (timestamp: Date) => {
    return format(timestamp, 'HH:mm', { locale: es })
  }

  return (
    <div className="space-y-4">
      {mensajes.map((mensaje) => (
        <div
          key={mensaje.id}
          className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex space-x-3 max-w-[80%] ${mensaje.tipo === 'usuario' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${mensaje.tipo === 'usuario'
                  ? 'bg-primario-600 text-white'
                  : 'bg-gray-100 text-gray-600'
                }`}
            >
              {mensaje.tipo === 'usuario' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            {/* Contenido del Mensaje */}
            <div
              className={`rounded-lg px-4 py-2 ${mensaje.tipo === 'usuario'
                  ? 'bg-primario-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                }`}
            >
              <div className="text-sm whitespace-pre-wrap">
                {mensaje.contenido}
              </div>
              <div
                className={`text-xs mt-1 ${mensaje.tipo === 'usuario'
                    ? 'text-primario-100'
                    : 'text-gray-500'
                  }`}
              >
                {formatearTiempo(new Date(mensaje.timestamp))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
