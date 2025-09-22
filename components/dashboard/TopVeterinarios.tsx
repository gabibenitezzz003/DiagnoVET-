'use client'

import { useEffect, useState } from 'react'
import { UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { servicioSupabase } from '@/lib/servicios/supabase'

interface VeterinarioStats {
  id: number
  nombre: string
  apellido: string
  especializacion: string
  totalReportes: number
  reportesCompletados: number
  precision: number
}

export function TopVeterinarios() {
  const [veterinarios, setVeterinarios] = useState<VeterinarioStats[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarVeterinarios()
  }, [])

  const cargarVeterinarios = async () => {
    try {
      setCargando(true)
      
      // Obtener reportes
      const respuesta = await servicioSupabase.obtenerReportes({}, 1, 1000)
      const reportes = respuesta.datos || []
      
      // Simular datos de veterinarios (en un entorno real vendrían de la BD)
      const veterinariosSimulados: VeterinarioStats[] = [
        {
          id: 1,
          nombre: 'Marina',
          apellido: 'García',
          especializacion: 'Medicina Interna',
          totalReportes: Math.floor(Math.random() * 50) + 20,
          reportesCompletados: Math.floor(Math.random() * 40) + 15,
          precision: Math.round((Math.random() * 15 + 85) * 10) / 10
        },
        {
          id: 2,
          nombre: 'Lucía',
          apellido: 'Rodríguez',
          especializacion: 'Cirugía',
          totalReportes: Math.floor(Math.random() * 45) + 15,
          reportesCompletados: Math.floor(Math.random() * 35) + 12,
          precision: Math.round((Math.random() * 15 + 85) * 10) / 10
        },
        {
          id: 3,
          nombre: 'Agustina',
          apellido: 'Fernández',
          especializacion: 'Dermatología',
          totalReportes: Math.floor(Math.random() * 40) + 10,
          reportesCompletados: Math.floor(Math.random() * 30) + 8,
          precision: Math.round((Math.random() * 15 + 85) * 10) / 10
        },
        {
          id: 4,
          nombre: 'Sofía',
          apellido: 'Gómez',
          especializacion: 'Cardiología',
          totalReportes: Math.floor(Math.random() * 35) + 8,
          reportesCompletados: Math.floor(Math.random() * 25) + 6,
          precision: Math.round((Math.random() * 15 + 85) * 10) / 10
        },
        {
          id: 5,
          nombre: 'Camila',
          apellido: 'Torres',
          especializacion: 'Neurología',
          totalReportes: Math.floor(Math.random() * 30) + 5,
          reportesCompletados: Math.floor(Math.random() * 20) + 4,
          precision: Math.round((Math.random() * 15 + 85) * 10) / 10
        }
      ]
      
      // Ordenar por total de reportes
      veterinariosSimulados.sort((a, b) => b.totalReportes - a.totalReportes)
      
      setVeterinarios(veterinariosSimulados)
    } catch (error) {
      console.error('Error al cargar veterinarios:', error)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
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
      <div className="flex items-center mb-6">
        <UserGroupIcon className="w-6 h-6 text-primario-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Top Veterinarios
        </h3>
      </div>

      <div className="space-y-4">
        {veterinarios.map((vet, index) => (
          <div key={vet.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-500' :
                'bg-primario-500'
              }`}>
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {vet.nombre} {vet.apellido}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {vet.especializacion}
              </p>
            </div>
            
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <DocumentTextIcon className="w-3 h-3" />
                <span>{vet.totalReportes}</span>
              </div>
              <p className="text-xs text-exito-600 font-medium">
                {vet.precision}% precisión
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-primario-600">
              {veterinarios.reduce((sum, v) => sum + v.totalReportes, 0)}
            </p>
            <p className="text-xs text-gray-600">Total Reportes</p>
          </div>
          <div>
            <p className="text-lg font-bold text-exito-600">
              {Math.round(veterinarios.reduce((sum, v) => sum + v.precision, 0) / veterinarios.length)}%
            </p>
            <p className="text-xs text-gray-600">Precisión Promedio</p>
          </div>
        </div>
      </div>
    </div>
  )
}
