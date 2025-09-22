'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'
import { backendAPI } from '@/lib/servicios/backend-api'
import { servicioSupabase } from '@/lib/servicios/supabase'
import toast from 'react-hot-toast'

interface FormularioSubidaReporteProps {
  onSubidaExitosa: (reporte: ReporteVeterinario) => void
  onCancelar: () => void
}

export function FormularioSubidaReporte({
  onSubidaExitosa,
  onCancelar
}: FormularioSubidaReporteProps) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((archivosAceptados: File[]) => {
    const archivoSeleccionado = archivosAceptados[0]

    // Validar tipo de archivo
    if (!archivoSeleccionado.type.includes('pdf')) {
      setError('Solo se permiten archivos PDF')
      return
    }

    // Validar tamaño (10MB máximo)
    if (archivoSeleccionado.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB')
      return
    }

    setArchivo(archivoSeleccionado)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const procesarArchivo = async () => {
    if (!archivo) return

    try {
      setProcesando(true)
      setError(null)
      setProgreso(0)

      // Simular progreso
      const interval = setInterval(() => {
        setProgreso(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Procesar PDF
      const resultado = await backendAPI.procesarPDF(archivo)

      clearInterval(interval)
      setProgreso(100)

      if (!resultado.exito || !resultado.reporte) {
        throw new Error(resultado.error || 'Error al procesar el archivo')
      }

      // Guardar en base de datos
      const resultadoGuardado = await servicioSupabase.guardarReporte(resultado.reporte)

      if (!resultadoGuardado.exito || !resultadoGuardado.datos) {
        throw new Error(resultadoGuardado.error || 'Error al guardar el reporte')
      }

      toast.success('Reporte procesado exitosamente')
      onSubidaExitosa(resultadoGuardado.datos)

    } catch (err) {
      console.error('Error al procesar archivo:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast.error('Error al procesar el archivo')
    } finally {
      setProcesando(false)
    }
  }

  const limpiarArchivo = () => {
    setArchivo(null)
    setError(null)
    setProgreso(0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Subir Nuevo Reporte
          </h3>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Zona de Drop */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
              ${isDragActive
                ? 'border-primario-500 bg-primario-50'
                : 'border-gray-300 hover:border-primario-400'
              }
              ${archivo ? 'border-exito-500 bg-exito-50' : ''}
            `}
          >
            <input {...getInputProps()} />

            {archivo ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-exito-600 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-exito-600">
                    Archivo seleccionado
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
                <button
                  onClick={limpiarArchivo}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Seleccionar otro archivo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive
                      ? 'Suelta el archivo aquí'
                      : 'Arrastra un archivo PDF aquí o haz clic para seleccionar'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Máximo 10MB, solo archivos PDF
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-error-600 bg-error-50 border border-error-200 rounded-lg p-3">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Progreso */}
          {procesando && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Procesando archivo...</span>
                <span>{progreso}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primario-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          )}

          {/* Información del Procesamiento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">¿Qué hace el procesamiento?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Extrae texto del PDF usando OCR</li>
              <li>• Identifica información del paciente, tutor y veterinario</li>
              <li>• Analiza diagnósticos y recomendaciones</li>
              <li>• Extrae imágenes médicas si las hay</li>
              <li>• Estructura la información en formato estándar</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancelar}
            className="btn-secondary"
            disabled={procesando}
          >
            Cancelar
          </button>
          <button
            onClick={procesarArchivo}
            disabled={!archivo || procesando}
            className="btn-primary flex items-center space-x-2"
          >
            {procesando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Procesar Reporte</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
