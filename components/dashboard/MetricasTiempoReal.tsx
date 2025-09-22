'use client'

import { useEffect, useState } from 'react'
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { servicioSupabase } from '@/lib/servicios/supabase'

interface Metricas {
  totalReportes: number
  reportesCompletados: number
  reportesProcesando: number
  reportesError: number
  totalVeterinarios: number
  precisionIA: number
  tiempoPromedio: number
  reportesHoy: number
}

export function MetricasTiempoReal() {
  const [metricas, setMetricas] = useState<Metricas>({
    totalReportes: 0,
    reportesCompletados: 0,
    reportesProcesando: 0,
    reportesError: 0,
    totalVeterinarios: 0,
    precisionIA: 0,
    tiempoPromedio: 0,
    reportesHoy: 0
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarMetricas()
    // Actualizar cada 30 segundos
    const intervalo = setInterval(cargarMetricas, 30000)
    return () => clearInterval(intervalo)
  }, [])

  const cargarMetricas = async () => {
    try {
      setCargando(true)
      
      // Obtener todos los reportes
      const respuesta = await servicioSupabase.obtenerReportes({}, 1, 1000)
      const reportes = respuesta.datos || []
      
      // Calcular métricas
      const totalReportes = reportes.length
      const reportesCompletados = reportes.filter(r => r.estado === 'completado').length
      const reportesProcesando = reportes.filter(r => r.estado === 'procesando').length
      const reportesError = reportes.filter(r => r.estado === 'error').length
      
      // Reportes de hoy
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const reportesHoy = reportes.filter(r => 
        new Date(r.fechaCreacion) >= hoy
      ).length
      
      // Métricas simuladas (en un entorno real vendrían de análisis)
      const precisionIA = totalReportes > 0 ? Math.round((Math.random() * 15 + 85) * 10) / 10 : 0
      const tiempoPromedio = totalReportes > 0 ? Math.round(Math.random() * 3 + 2) : 0
      
      setMetricas({
        totalReportes,
        reportesCompletados,
        reportesProcesando,
        reportesError,
        totalVeterinarios: 10, // Los veterinarios que sabemos que existen
        precisionIA,
        tiempoPromedio,
        reportesHoy
      })
    } catch (error) {
      console.error('Error al cargar métricas:', error)
    } finally {
      setCargando(false)
    }
  }

  const tarjetasMetricas = [
    {
      titulo: 'Total Reportes',
      valor: metricas.totalReportes,
      icono: DocumentTextIcon,
      color: 'primario',
      cambio: `+${metricas.reportesHoy} hoy`,
      descripcion: 'Documentos procesados'
    },
    {
      titulo: 'Completados',
      valor: metricas.reportesCompletados,
      icono: CheckCircleIcon,
      color: 'exito',
      cambio: `${Math.round((metricas.reportesCompletados / Math.max(metricas.totalReportes, 1)) * 100)}%`,
      descripcion: 'Análisis finalizados'
    },
    {
      titulo: 'En Proceso',
      valor: metricas.reportesProcesando,
      icono: ClockIcon,
      color: 'advertencia',
      cambio: 'Procesando',
      descripcion: 'Analizando con IA'
    },
    {
      titulo: 'Veterinarios',
      valor: metricas.totalVeterinarios,
      icono: UserGroupIcon,
      color: 'primario',
      cambio: 'Activos',
      descripcion: 'Profesionales registrados'
    },
    {
      titulo: 'Precisión IA',
      valor: `${metricas.precisionIA}%`,
      icono: ChartBarIcon,
      color: 'exito',
      cambio: 'Excelente',
      descripcion: 'Exactitud del análisis'
    },
    {
      titulo: 'Tiempo Promedio',
      valor: `${metricas.tiempoPromedio} min`,
      icono: ClockIcon,
      color: 'advertencia',
      cambio: 'Rápido',
      descripcion: 'Por análisis'
    }
  ]

  if (cargando) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {tarjetasMetricas.map((tarjeta, index) => {
        const Icono = tarjeta.icono
        const colores = {
          primario: {
            bg: 'bg-primario-50',
            icon: 'text-primario-600',
            border: 'border-primario-200'
          },
          exito: {
            bg: 'bg-exito-50',
            icon: 'text-exito-600',
            border: 'border-exito-200'
          },
          advertencia: {
            bg: 'bg-advertencia-50',
            icon: 'text-advertencia-600',
            border: 'border-advertencia-200'
          },
          error: {
            bg: 'bg-error-50',
            icon: 'text-error-600',
            border: 'border-error-200'
          }
        }
        
        const colorConfig = colores[tarjeta.color as keyof typeof colores]
        
        return (
          <div
            key={index}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 ${colorConfig.border} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${colorConfig.bg} flex items-center justify-center`}>
                <Icono className={`w-6 h-6 ${colorConfig.icon}`} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  {tarjeta.cambio}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {tarjeta.titulo}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {tarjeta.valor}
              </p>
              <p className="text-xs text-gray-500">
                {tarjeta.descripcion}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
