'use client'

import { useEffect, useState } from 'react'
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { servicioSupabase } from '@/lib/servicios/supabase'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'

interface Actividad {
  id: string
  tipo: 'reporte' | 'completado' | 'error' | 'usuario'
  titulo: string
  descripcion: string
  timestamp: Date
  usuario?: string
  estado?: string
}

export function ActividadReciente() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarActividades()
  }, [])

  const cargarActividades = async () => {
    try {
      setCargando(true)
      
      // Obtener reportes recientes
      const respuesta = await servicioSupabase.obtenerReportes({}, 1, 10)
      const reportes = respuesta.datos || []
      
      // Convertir reportes a actividades
      const actividadesReportes: Actividad[] = reportes.map(reporte => ({
        id: reporte.id,
        tipo: reporte.estado === 'completado' ? 'completado' : 
              reporte.estado === 'error' ? 'error' : 'reporte',
        titulo: `Reporte ${reporte.informacionEstudio?.tipo || 'otro'}`,
        descripcion: `Paciente: ${reporte.paciente?.nombre || 'Sin nombre'} - ${reporte.veterinarios?.[0]?.nombre || 'Veterinario no asignado'}`,
        timestamp: new Date(reporte.fechaCreacion),
        usuario: reporte.veterinarios?.[0]?.nombre,
        estado: reporte.estado
      }))
      
      // Agregar actividades simuladas
      const actividadesSimuladas: Actividad[] = [
        {
          id: 'act_1',
          tipo: 'usuario',
          titulo: 'Nuevo veterinario registrado',
          descripcion: 'Dr. Carlos Ruiz se unió al equipo',
          timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
        },
        {
          id: 'act_2',
          tipo: 'completado',
          titulo: 'Análisis completado',
          descripcion: 'Radiografía de tórax procesada exitosamente',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          id: 'act_3',
          tipo: 'reporte',
          titulo: 'Nuevo reporte subido',
          descripcion: 'Ecocardiograma de paciente felino',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
        }
      ]
      
      // Combinar y ordenar por timestamp
      const todasActividades = [...actividadesReportes, ...actividadesSimuladas]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 8)
      
      setActividades(todasActividades)
    } catch (error) {
      console.error('Error al cargar actividades:', error)
    } finally {
      setCargando(false)
    }
  }

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'completado':
        return <CheckCircleIcon className="w-5 h-5 text-exito-600" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-error-600" />
      case 'usuario':
        return <UserIcon className="w-5 h-5 text-primario-600" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-advertencia-600" />
    }
  }

  const getColorFondo = (tipo: string) => {
    switch (tipo) {
      case 'completado':
        return 'bg-exito-50'
      case 'error':
        return 'bg-error-50'
      case 'usuario':
        return 'bg-primario-50'
      default:
        return 'bg-advertencia-50'
    }
  }

  const formatearTiempo = (timestamp: Date) => {
    const ahora = new Date()
    const diffMs = ahora.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `hace ${diffMins} min`
    } else if (diffHours < 24) {
      return `hace ${diffHours}h`
    } else {
      return `hace ${diffDays} días`
    }
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Actividad Reciente
        </h3>
        <span className="text-sm text-gray-500">
          Últimas 24 horas
        </span>
      </div>

      <div className="space-y-4">
        {actividades.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay actividad reciente</p>
          </div>
        ) : (
          actividades.map((actividad) => (
            <div key={actividad.id} className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorFondo(actividad.tipo)}`}>
                {getIcono(actividad.tipo)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {actividad.titulo}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {actividad.descripcion}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatearTiempo(actividad.timestamp)}
                  </span>
                  {actividad.usuario && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {actividad.usuario}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ver más */}
      {actividades.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-primario-600 hover:text-primario-700 font-medium">
            Ver toda la actividad
          </button>
        </div>
      )}
    </div>
  )
}
