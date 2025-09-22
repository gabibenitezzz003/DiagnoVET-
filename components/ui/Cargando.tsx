'use client'

import { Loader2 } from 'lucide-react'

interface CargandoProps {
  mensaje?: string
  tamano?: 'sm' | 'md' | 'lg'
}

export function Cargando({ mensaje = 'Cargando...', tamano = 'md' }: CargandoProps) {
  const tamanos = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className={`${tamanos[tamano]} text-primario-600 animate-spin`} />
        </div>
        <p className="text-gray-600 text-lg">{mensaje}</p>
      </div>
    </div>
  )
}
