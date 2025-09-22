'use client'

import { useState } from 'react'
import { 
  CheckIcon,
  XMarkIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { OpcionesProcesamiento } from '@/lib/tipos/reporte-veterinario'

interface OpcionesProcesamientoProps {
  opciones: OpcionesProcesamiento
  onChange: (opciones: OpcionesProcesamiento) => void
  onConfirm: () => void
  onCancel: () => void
}

export default function OpcionesProcesamientoComponent({ 
  opciones, 
  onChange, 
  onConfirm, 
  onCancel 
}: OpcionesProcesamientoProps) {
  const [opcionesLocales, setOpcionesLocales] = useState<OpcionesProcesamiento>(opciones)

  const handleChange = (key: keyof OpcionesProcesamiento, value: boolean) => {
    const nuevasOpciones = { ...opcionesLocales, [key]: value }
    
    // Si se selecciona "Analizar y Subir", también se selecciona "Solo Analizar"
    if (key === 'analizarYSubir' && value) {
      nuevasOpciones.soloAnalizar = true
    }
    
    // Si se deselecciona "Solo Analizar", también se deselecciona "Analizar y Subir"
    if (key === 'soloAnalizar' && !value) {
      nuevasOpciones.analizarYSubir = false
    }
    
    setOpcionesLocales(nuevasOpciones)
    onChange(nuevasOpciones)
  }

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            <span>Opciones de Procesamiento</span>
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 mb-4 text-sm">
          Selecciona cómo quieres procesar el documento PDF. Puedes elegir solo analizarlo 
          o analizarlo y subir el PDF ORIGINAL a Google Drive para que esté disponible para el chatbot.
          <br />
          <span className="text-xs text-blue-600 font-medium">
            💡 Tip: El reporte procesado siempre se guarda en Supabase, solo cambia si se sube el PDF original a Drive
          </span>
        </p>

        {/* Opciones principales */}
        <div className="space-y-4">
          {/* Solo Analizar */}
          <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleChange('soloAnalizar', !opcionesLocales.soloAnalizar)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    opcionesLocales.soloAnalizar ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  {opcionesLocales.soloAnalizar && <CheckIcon className="w-4 h-4 text-white" />}
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CpuChipIcon className="w-4 h-4 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-900">Solo Analizar</h3>
                </div>
                <p className="text-gray-600 mb-2 text-sm">
                  Procesa el PDF con IA, extrae información y genera un reporte estructurado. 
                  El reporte procesado se guarda en Supabase pero el PDF original NO se sube a Google Drive.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <CheckIcon className="w-4 h-4" />
                    <span>Análisis con Gemini AI</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckIcon className="w-4 h-4" />
                    <span>Extracción de imágenes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckIcon className="w-4 h-4" />
                    <span>Guardado en Supabase</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analizar y Subir */}
          <div className="border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleChange('analizarYSubir', !opcionesLocales.analizarYSubir)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    opcionesLocales.analizarYSubir ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {opcionesLocales.analizarYSubir && <CheckIcon className="w-4 h-4 text-white" />}
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CloudArrowUpIcon className="w-4 h-4 text-green-500" />
                  <h3 className="text-base font-semibold text-gray-900">Analizar y Subir</h3>
                </div>
                <p className="text-gray-600 mb-2 text-sm">
                  Procesa el PDF con IA y sube el PDF ORIGINAL a Google Drive. 
                  El PDF original estará disponible para el chatbot y el reporte procesado se guardará en Supabase.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <CheckIcon className="w-4 h-4" />
                    <span>Análisis con Gemini AI</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckIcon className="w-4 h-4" />
                    <span>Extracción de imágenes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckIcon className="w-4 h-4" />
                    <span>Subida del PDF ORIGINAL a Google Drive</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckIcon className="w-4 h-4" />
                    <span>PDF original disponible para chatbot</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones adicionales */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Opciones Adicionales</h4>
          <div className="space-y-3">
            {/* Extraer Imágenes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PhotoIcon className="w-4 h-4 text-purple-500" />
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">Extraer Imágenes</h5>
                  <p className="text-xs text-gray-500">Extrae y procesa imágenes médicas del PDF</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('extraerImagenes', !opcionesLocales.extraerImagenes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  opcionesLocales.extraerImagenes ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    opcionesLocales.extraerImagenes ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Usar IA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-blue-500" />
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">Usar Inteligencia Artificial</h5>
                  <p className="text-xs text-gray-500">Procesa el contenido con Gemini AI para análisis avanzado</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('usarIA', !opcionesLocales.usarIA)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  opcionesLocales.usarIA ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    opcionesLocales.usarIA ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center space-x-2 text-sm"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Procesar Documento</span>
          </button>
        </div>
      </div>
    </div>
  )
}
