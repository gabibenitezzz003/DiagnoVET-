'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  SparklesIcon,
  CloudArrowUpIcon
} from 'lucide-react'
import { ReporteVeterinario, OpcionesProcesamiento, RespuestaProcesamiento } from '@/lib/tipos/reporte-veterinario'
import { backendAPI } from '@/lib/servicios/backend-api'
import OpcionesProcesamientoComponent from './OpcionesProcesamiento'

interface FormularioSubidaConOpcionesProps {
  onSubidaExitosa: (reporte: ReporteVeterinario) => void
  onCancelar: () => void
}

export function FormularioSubidaConOpciones({
  onSubidaExitosa,
  onCancelar
}: FormularioSubidaConOpcionesProps) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const [opciones, setOpciones] = useState<OpcionesProcesamiento>({
    soloAnalizar: true,
    analizarYSubir: false,
    extraerImagenes: true,
    usarIA: true
  })

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

  const handleProcesar = async () => {
    if (!archivo) return

    setProcesando(true)
    setProgreso(0)
    setError(null)

    try {
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

      // Procesar PDF enviándolo al backend
      const respuesta: RespuestaProcesamiento = await backendAPI.procesarPDF(archivo)

      clearInterval(interval)
      setProgreso(100)

      if (!respuesta.exito) {
        throw new Error(respuesta.error || 'Error al procesar PDF')
      }

      if (!respuesta.reporte) {
        throw new Error('No se generó el reporte')
      }

      // El backend ya guardó en Supabase, no necesitamos hacerlo aquí
      console.log('✅ Reporte guardado en Supabase por el backend')

      // Mostrar resultado
      if (opciones.analizarYSubir && respuesta.archivoDrive) {
        console.log('✅ PDF procesado y subido a Google Drive')
        console.log('📁 ID del archivo:', respuesta.archivoDrive.id)
        console.log('🔗 URL del archivo:', respuesta.archivoDrive.url)
      } else {
        console.log('✅ PDF procesado exitosamente')
      }

      onSubidaExitosa(respuesta.reporte)

    } catch (error) {
      console.error('❌ Error al procesar PDF:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setProcesando(false)
      setProgreso(0)
    }
  }

  const handleMostrarOpciones = () => {
    setMostrarOpciones(true)
  }

  const handleOpcionesChange = (nuevasOpciones: OpcionesProcesamiento) => {
    setOpciones(nuevasOpciones)
  }

  const handleConfirmarOpciones = () => {
    setMostrarOpciones(false)
    handleProcesar()
  }

  const handleCancelarOpciones = () => {
    setMostrarOpciones(false)
  }

  if (mostrarOpciones) {
    return (
      <OpcionesProcesamientoComponent
        opciones={opciones}
        onChange={handleOpcionesChange}
        onConfirm={handleConfirmarOpciones}
        onCancel={handleCancelarOpciones}
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="w-8 h-8 text-blue-500" />
          <span>Subir Documento PDF</span>
        </h2>
        <button
          onClick={onCancelar}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
          ? 'border-blue-500 bg-blue-50'
          : archivo
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input {...getInputProps()} />

        {archivo ? (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Archivo seleccionado</h3>
              <p className="text-gray-600">{archivo.name}</p>
              <p className="text-sm text-gray-500">
                {(archivo.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu PDF aquí'}
              </h3>
              <p className="text-gray-600">o haz clic para seleccionar</p>
              <p className="text-sm text-gray-500">Máximo 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Progreso */}
      {procesando && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Procesando...</span>
            <span className="text-sm text-gray-500">{progreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      )}

      {/* Opciones actuales */}
      {archivo && !procesando && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Opciones de procesamiento:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {opciones.soloAnalizar ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-medium">Solo Analizar</span>
              </div>
              <div className="flex items-center space-x-2">
                {opciones.analizarYSubir ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-medium">Analizar y Subir PDF ORIGINAL a Google Drive</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {opciones.extraerImagenes ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span>Extraer Imágenes</span>
              </div>
              <div className="flex items-center space-x-2">
                {opciones.usarIA ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span>Usar Inteligencia Artificial</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-end space-x-4 mt-8">
        <button
          onClick={onCancelar}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>

        {archivo && !procesando && (
          <button
            onClick={handleMostrarOpciones}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium transition-colors flex items-center space-x-2"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Configurar Opciones</span>
          </button>
        )}

        {archivo && !procesando && (
          <button
            onClick={handleProcesar}
            className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Procesar Documento</span>
          </button>
        )}
      </div>
    </div>
  )
}
