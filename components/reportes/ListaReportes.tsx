'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, Calendar, User, Stethoscope, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ListaReportesProps {
  reportes: ReporteVeterinario[]
  onSeleccionarReporte: (reporte: ReporteVeterinario) => void
  onActualizarReporte: (reporte: ReporteVeterinario) => void
  onEliminarReporte: (reporteId: string) => void
}

export function ListaReportes({
  reportes,
  onSeleccionarReporte,
  onActualizarReporte,
  onEliminarReporte
}: ListaReportesProps) {
  const [reporteAEliminar, setReporteAEliminar] = useState<string | null>(null)

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="h-4 w-4 text-exito-600" />
      case 'procesando':
        return <Clock className="h-4 w-4 text-advertencia-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-exito-100 text-exito-800'
      case 'procesando':
        return 'bg-advertencia-100 text-advertencia-800'
      case 'error':
        return 'bg-error-100 text-error-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const obtenerTipoEstudioIcono = (tipo: string) => {
    switch (tipo) {
      case 'radiografia':
        return '📷'
      case 'ecografia':
        return '🔍'
      case 'analisis':
        return '🧪'
      case 'consulta':
        return '🩺'
      default:
        return '📄'
    }
  }

  const manejarEliminar = async (reporteId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      onEliminarReporte(reporteId)
      setReporteAEliminar(null)
    }
  }

  if (reportes.length === 0) {
    return (
      <div className="text-center py-12">
        <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay reportes disponibles
        </h3>
        <p className="text-gray-500 mb-6">
          Sube tu primer reporte PDF para comenzar
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reportes.map((reporte) => (
        <div
          key={reporte.id}
          className="card card-hover cursor-pointer"
          onClick={() => onSeleccionarReporte(reporte)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header del Reporte */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">
                  {obtenerTipoEstudioIcono(reporte.informacionEstudio?.tipo || 'otro')}
                </span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 truncate">
                    {reporte.paciente.nombre}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {reporte.paciente.especie} • {reporte.paciente.raza}
                  </p>
                </div>
              </div>

              {/* Información del Reporte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Dr. {reporte.veterinarios?.[0]?.nombre || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(reporte.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
              </div>

              {/* Diagnóstico */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Diagnóstico Principal:
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {reporte.conclusion?.principales?.[0] || 'N/A'}
                </p>
              </div>

              {/* Estado y Confianza */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {obtenerIconoEstado(reporte.estado)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(reporte.estado)}`}>
                    {reporte.estado}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Confianza: {Math.round(reporte.confianzaExtraccion * 100)}%
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSeleccionarReporte(reporte)
                }}
                className="p-2 text-gray-400 hover:text-primario-600 transition-colors duration-200"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implementar edición
                }}
                className="p-2 text-gray-400 hover:text-advertencia-600 transition-colors duration-200"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setReporteAEliminar(reporte.id)
                }}
                className="p-2 text-gray-400 hover:text-error-600 transition-colors duration-200"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Imágenes */}
          {reporte.imagenes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Imágenes ({reporte.imagenes.length}):
              </p>
              <div className="flex space-x-2 overflow-x-auto">
                {reporte.imagenes.slice(0, 3).map((imagen) => (
                  <div
                    key={imagen.id}
                    className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                  >
                    <span className="text-xs text-gray-500">
                      {imagen.tipo === 'radiografia' ? '📷' :
                        imagen.tipo === 'ecografia' ? '🔍' : '🖼️'}
                    </span>
                  </div>
                ))}
                {reporte.imagenes.length > 3 && (
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      +{reporte.imagenes.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Modal de Confirmación de Eliminación */}
      {reporteAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-error-100 p-2 rounded-full">
                  <AlertCircle className="h-6 w-6 text-error-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que quieres eliminar este reporte?
                Se perderán todos los datos asociados.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setReporteAEliminar(null)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => manejarEliminar(reporteAEliminar)}
                  className="btn-error flex-1"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
