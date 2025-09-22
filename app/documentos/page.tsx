'use client'

import { useState } from 'react'
import { DocumentTextIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'
import ReporteFormateado from '@/components/reportes/ReporteFormateado'
import { FormularioSubidaConOpciones } from '@/components/documentos/FormularioSubidaConOpciones'

export default function DocumentosPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [resultado, setResultado] = useState<ReporteVeterinario | null>(null)

  const handleSubidaExitosa = (reporte: ReporteVeterinario) => {
    setResultado(reporte)
    setMostrarFormulario(false)
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
  }

  const handleNuevoDocumento = () => {
    setResultado(null)
    setMostrarFormulario(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Análisis de Documentos Veterinarios
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sube documentos PDF de reportes veterinarios y obtén análisis estructurados 
            con inteligencia artificial. Elige si quieres solo analizar o también subir a Google Drive.
          </p>
        </div>

        {/* Contenido principal */}
        {mostrarFormulario ? (
          <FormularioSubidaConOpciones
            onSubidaExitosa={handleSubidaExitosa}
            onCancelar={handleCancelar}
          />
        ) : resultado ? (
          <div className="space-y-8">
            {/* Resultado del análisis */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  <span>Análisis Completado</span>
                </h2>
                <button
                  onClick={handleNuevoDocumento}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nuevo Documento</span>
                </button>
              </div>
              
              <ReporteFormateado reporte={resultado} />
            </div>
          </div>
        ) : (
          <div className="text-center">
            {/* Estado inicial */}
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <DocumentTextIcon className="w-12 h-12 text-blue-500" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Subir Documento PDF
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Selecciona un archivo PDF de reporte veterinario para procesar. 
                    Puedes elegir solo analizarlo o también subirlo a Google Drive.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">Solo Analizar</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Procesa el PDF con IA y genera un reporte estructurado
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CloudArrowUpIcon className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-gray-900">Analizar y Subir</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Procesa el PDF y lo sube a Google Drive para el chatbot
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNuevoDocumento}
                  className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="w-6 h-6" />
                  <span>Subir Documento</span>
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Análisis Inteligente
                </h3>
                <p className="text-gray-600">
                  Utiliza Gemini AI para extraer información estructurada de reportes veterinarios
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CloudArrowUpIcon className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Integración Drive
                </h3>
                <p className="text-gray-600">
                  Sube documentos a Google Drive para que estén disponibles para el chatbot
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Base de Datos
                </h3>
                <p className="text-gray-600">
                  Todos los reportes se guardan en Supabase para consulta posterior
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}