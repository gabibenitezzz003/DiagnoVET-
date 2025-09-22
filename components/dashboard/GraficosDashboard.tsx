'use client'

import { useEffect, useState } from 'react'
import { servicioSupabase } from '@/lib/servicios/supabase'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'

interface DatosGrafico {
  mes: string
  reportes: number
  completados: number
}

export function GraficosDashboard() {
  const [datosGrafico, setDatosGrafico] = useState<DatosGrafico[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatosGrafico()
  }, [])

  const cargarDatosGrafico = async () => {
    try {
      setCargando(true)
      
      // Obtener reportes
      const respuesta = await servicioSupabase.obtenerReportes({}, 1, 1000)
      const reportes = respuesta.datos || []
      
      // Generar datos de los últimos 6 meses
      const meses = []
      const fechaActual = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1)
        const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'short' })
        
        const reportesMes = reportes.filter(r => {
          const fechaReporte = new Date(r.fechaCreacion)
          return fechaReporte.getMonth() === fecha.getMonth() && 
                 fechaReporte.getFullYear() === fecha.getFullYear()
        })
        
        meses.push({
          mes: mesNombre,
          reportes: reportesMes.length,
          completados: reportesMes.filter(r => r.estado === 'completado').length
        })
      }
      
      setDatosGrafico(meses)
    } catch (error) {
      console.error('Error al cargar datos del gráfico:', error)
    } finally {
      setCargando(false)
    }
  }

  const maxReportes = Math.max(...datosGrafico.map(d => d.reportes), 1)

  if (cargando) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reportes por Mes
        </h3>
        <p className="text-sm text-gray-600">
          Evolución de reportes procesados en los últimos 6 meses
        </p>
      </div>

      <div className="space-y-4">
        {datosGrafico.map((dato, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{dato.mes}</span>
              <span className="text-gray-500">{dato.reportes} reportes</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primario-500 to-primario-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(dato.reportes / maxReportes) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Completados: {dato.completados}</span>
              <span>
                {dato.reportes > 0 
                  ? `${Math.round((dato.completados / dato.reportes) * 100)}%`
                  : '0%'
                } éxito
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primario-600">
              {datosGrafico.reduce((sum, d) => sum + d.reportes, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Reportes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-exito-600">
              {datosGrafico.reduce((sum, d) => sum + d.completados, 0)}
            </p>
            <p className="text-sm text-gray-600">Completados</p>
          </div>
        </div>
      </div>
    </div>
  )
}
