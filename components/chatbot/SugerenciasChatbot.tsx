'use client'

import { MessageCircle } from 'lucide-react'

interface SugerenciasChatbotProps {
  sugerencias: string[]
  onSeleccionarSugerencia: (sugerencia: string) => void
}

export function SugerenciasChatbot({
  sugerencias,
  onSeleccionarSugerencia
}: SugerenciasChatbotProps) {
  if (sugerencias.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
        <MessageCircle className="h-4 w-4" />
        <span>Preguntas Frecuentes</span>
      </h4>
      
      <div className="grid grid-cols-1 gap-2">
        {sugerencias.map((sugerencia, index) => (
          <button
            key={index}
            onClick={() => onSeleccionarSugerencia(sugerencia)}
            className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-primario-300 hover:bg-primario-50 transition-colors duration-200 group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primario-100 rounded-full flex items-center justify-center group-hover:bg-primario-200 transition-colors duration-200">
                <span className="text-xs font-medium text-primario-600">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 group-hover:text-primario-700 transition-colors duration-200">
                  {sugerencia}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Haz clic en cualquier pregunta para enviarla
      </div>
    </div>
  )
}
