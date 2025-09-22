'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { servicioSupabase } from '@/lib/servicios/supabase'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'

export function UltimosReportes() {
  const [reportes, setReportes] = useState<ReporteVeterinario[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarUltimosReportes()
  }, [])

  const cargarUltimosReportes = async () => {
    try {
      setCargando(true)
      const respuesta = await servicioSupabase.obtenerReportes({}, 1, 5)
      setReportes(respuesta.datos || [])
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setCargando(false)
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircleIcon className="w-5 h-5 text-exito-600" />
      case 'procesando':
        return <ClockIcon className="w-5 h-5 text-advertencia-600" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-error-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getEstadoColor = (estado: string) => {
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

  const getTipoEstudioColor = (tipo: string) => {
    switch (tipo) {
      case 'radiografia':
        return 'bg-blue-100 text-blue-800'
      case 'ecografia':
        return 'bg-green-100 text-green-800'
      case 'analisis':
        return 'bg-purple-100 text-purple-800'
      case 'consulta':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (cargando) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando reportes recientes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Últimos Reportes
            </h2>
            <p className="text-lg text-gray-600">
              Reportes procesados recientemente
            </p>
          </div>
          <Link
            href="/reportes"
            className="inline-flex items-center px-4 py-2 bg-primario-600 text-white rounded-lg hover:bg-primario-700 transition-colors"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            Ver Todos
          </Link>
        </div>

        {reportes.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay reportes aún
            </h3>
            <p className="text-gray-600 mb-6">
              Sube tu primer documento para comenzar a analizar
            </p>
            <Link
              href="/documentos"
              className="inline-flex items-center px-6 py-3 bg-primario-600 text-white rounded-lg hover:bg-primario-700 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Subir Documento
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reportes.map((reporte) => (
              <div
                key={reporte.id}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primario-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-primario-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reporte.paciente?.nombre || 'Paciente sin nombre'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoEstudioColor(reporte.tipoEstudio)}`}>
                          {reporte.tipoEstudio}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reporte.estado)}`}>
                          {reporte.estado}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          <strong>Especie:</strong> {reporte.paciente?.especie || 'N/A'}
                        </span>
                        <span>
                          <strong>Veterinario:</strong> {reporte.veterinario?.nombre || 'N/A'}
                        </span>
                        <span>
                          <strong>Fecha:</strong> {new Date(reporte.fechaCreacion).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {reporte.diagnostico?.principal && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Diagnóstico:</strong> {reporte.diagnostico.principal}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getEstadoIcon(reporte.estado)}
                    </div>

                    <Link
                      href={`/reportes/${reporte.id}`}
                      className="inline-flex items-center px-3 py-1 bg-white text-primario-600 rounded-lg border border-primario-200 hover:bg-primario-50 transition-colors text-sm"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
