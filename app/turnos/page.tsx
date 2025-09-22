'use client'

import { useState } from 'react'
import { 
  CalendarDaysIcon, 
  PlusIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

interface Turno {
  id: string
  paciente: string
  veterinario: string
  fecha: string
  hora: string
  tipo: string
  estado: string
}

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([
    {
      id: '1',
      paciente: 'Max (Labrador)',
      veterinario: 'Dr. Marina García',
      fecha: '2024-01-22',
      hora: '10:00',
      tipo: 'Consulta General',
      estado: 'confirmado'
    },
    {
      id: '2',
      paciente: 'Luna (Siamés)',
      veterinario: 'Dr. Lucía Rodríguez',
      fecha: '2024-01-22',
      hora: '14:30',
      tipo: 'Cirugía',
      estado: 'programado'
    },
    {
      id: '3',
      paciente: 'Rocky (Golden Retriever)',
      veterinario: 'Dr. Agustina Fernández',
      fecha: '2024-01-23',
      hora: '09:15',
      tipo: 'Dermatología',
      estado: 'completado'
    }
  ])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-exito-100 text-exito-800'
      case 'programado':
        return 'bg-advertencia-100 text-advertencia-800'
      case 'completado':
        return 'bg-primario-100 text-primario-800'
      case 'cancelado':
        return 'bg-error-100 text-error-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Consulta General':
        return 'bg-blue-100 text-blue-800'
      case 'Cirugía':
        return 'bg-red-100 text-red-800'
      case 'Dermatología':
        return 'bg-green-100 text-green-800'
      case 'Cardiología':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Turnos
          </h1>
          <p className="text-lg text-gray-600">
            Programa y gestiona citas con integración a Google Calendar
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-8 h-8 text-primario-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{turnos.length}</p>
                <p className="text-sm text-gray-600">Total Turnos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-exito-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {turnos.filter(t => t.estado === 'confirmado').length}
                </p>
                <p className="text-sm text-gray-600">Confirmados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-advertencia-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {turnos.filter(t => t.estado === 'programado').length}
                </p>
                <p className="text-sm text-gray-600">Programados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <MapPinIcon className="w-8 h-8 text-primario-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {turnos.filter(t => t.estado === 'completado').length}
                </p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón nuevo turno */}
        <div className="mb-8">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="inline-flex items-center px-6 py-3 bg-primario-600 text-white rounded-lg hover:bg-primario-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Turno
          </button>
        </div>

        {/* Formulario nuevo turno */}
        {mostrarFormulario && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Programar Nuevo Turno
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent"
                  placeholder="Nombre del paciente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veterinario
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent">
                  <option>Dr. Marina García - Medicina Interna</option>
                  <option>Dr. Lucía Rodríguez - Cirugía</option>
                  <option>Dr. Agustina Fernández - Dermatología</option>
                  <option>Dr. Sofía Gómez - Cardiología</option>
                  <option>Dr. Camila Torres - Neurología</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent">
                  <option>Consulta General</option>
                  <option>Cirugía</option>
                  <option>Dermatología</option>
                  <option>Cardiología</option>
                  <option>Neurología</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-exito-600 text-white rounded-lg hover:bg-exito-700 transition-colors">
                  Programar Turno
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de turnos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Próximos Turnos
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {turnos.map((turno) => (
              <div key={turno.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primario-100 rounded-lg flex items-center justify-center">
                      <CalendarDaysIcon className="w-6 h-6 text-primario-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {turno.paciente}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(turno.tipo)}`}>
                          {turno.tipo}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(turno.estado)}`}>
                          {turno.estado}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Veterinario:</span> {turno.veterinario}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span> {new Date(turno.fecha).toLocaleDateString('es-ES')}
                        </div>
                        <div>
                          <span className="font-medium">Hora:</span> {turno.hora}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-primario-600 text-white rounded-lg hover:bg-primario-700 transition-colors text-sm">
                      Ver Detalle
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integración Google Calendar */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Integración con Google Calendar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Funcionalidades:</h4>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• Sincronización automática de turnos</li>
                <li>• Recordatorios por email</li>
                <li>• Notificaciones push</li>
                <li>• Calendario compartido con veterinarios</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Estado:</h4>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-exito-500 rounded-full"></div>
                <span className="text-exito-700 font-medium">Conectado</span>
              </div>
              <p className="text-blue-700 text-sm mt-2">
                Los turnos se sincronizan automáticamente con tu calendario de Google.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
