'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, X } from 'lucide-react'

interface FormularioMensajeProps {
  mensaje: string
  onCambioMensaje: (mensaje: string) => void
  onEnviarMensaje: (mensaje: string) => void
  enviando: boolean
  onMostrarSugerencias: () => void
  mostrarSugerencias: boolean
  sugerencias: string[]
  onSeleccionarSugerencia: (sugerencia: string) => void
}

export function FormularioMensaje({
  mensaje,
  onCambioMensaje,
  onEnviarMensaje,
  enviando,
  onMostrarSugerencias,
  mostrarSugerencias,
  sugerencias,
  onSeleccionarSugerencia
}: FormularioMensajeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [mensaje])

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()
    if (mensaje.trim() && !enviando) {
      onEnviarMensaje(mensaje.trim())
    }
  }

  const manejarKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      manejarEnvio(e)
    }
  }

  const manejarCambio = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCambioMensaje(e.target.value)
  }

  return (
    <div className="space-y-3">
      {/* Sugerencias */}
      {mostrarSugerencias && sugerencias.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Preguntas Sugeridas
            </h4>
            <button
              onClick={onMostrarSugerencias}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {sugerencias.slice(0, 4).map((sugerencia, index) => (
              <button
                key={index}
                onClick={() => onSeleccionarSugerencia(sugerencia)}
                className="text-left text-sm text-primario-600 hover:text-primario-700 hover:bg-primario-50 p-2 rounded transition-colors duration-200"
              >
                {sugerencia}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={manejarEnvio} className="flex space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={mensaje}
            onChange={manejarCambio}
            onKeyPress={manejarKeyPress}
            placeholder="Escribe tu pregunta aquí..."
            className="textarea-field resize-none min-h-[44px] max-h-32 pr-12"
            rows={1}
            disabled={enviando}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onMostrarSugerencias}
              className="text-gray-400 hover:text-primario-600 transition-colors duration-200"
              title="Ver sugerencias"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!mensaje.trim() || enviando}
          className="btn-primary flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* Indicador de Estado */}
      {enviando && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primario-600 border-t-transparent" />
          <span>Dr. VetAI está escribiendo...</span>
        </div>
      )}

      {/* Ayuda */}
      <div className="text-xs text-gray-500">
        Presiona Enter para enviar, Shift+Enter para nueva línea
      </div>
    </div>
  )
}
