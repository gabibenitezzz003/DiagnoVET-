'use client'

import { useState, useEffect } from 'react'
import { 
  CalendarDaysIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { Turno } from '@/lib/tipos/turno'
import { servicioSupabase } from '@/lib/servicios/supabase'
import { servicioN8nCalendario } from '@/lib/servicios/n8n-calendario'
import ModalTurno from '@/components/calendario/ModalTurno'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CalendarioPage() {
  const [fechaActual, setFechaActual] = useState(new Date())
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null)
  const [modoEdicion, setModoEdicion] = useState(false)

  const diasSemana = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
  const horas = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM a 7 PM

  useEffect(() => {
    cargarTurnos()
  }, [fechaActual])

  const cargarTurnos = async () => {
    try {
      setCargando(true)
      const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 })
      const finSemana = addDays(inicioSemana, 6)
      
      const respuesta = await servicioSupabase.obtenerTurnos({
        fecha_inicio: inicioSemana.toISOString(),
        fecha_fin: finSemana.toISOString()
      })
      
      setTurnos(respuesta.datos || [])
    } catch (error) {
      console.error('Error al cargar turnos:', error)
    } finally {
      setCargando(false)
    }
  }

  const obtenerTurnosDelDia = (fecha: Date) => {
    return turnos.filter(turno => isSameDay(new Date(turno.fecha_hora), fecha))
  }

  const obtenerColorTurno = (tipo: string) => {
    const colores = {
      'consulta_general': 'bg-blue-500',
      'cirugia': 'bg-red-500',
      'dermatologia': 'bg-green-500',
      'cardiologia': 'bg-purple-500',
      'neurologia': 'bg-orange-500',
      'oftalmologia': 'bg-pink-500',
      'urgencia': 'bg-yellow-500',
      'vacunacion': 'bg-indigo-500'
    }
    return colores[tipo as keyof typeof colores] || 'bg-gray-500'
  }

  const abrirModalCrear = () => {
    setTurnoSeleccionado(null)
    setModoEdicion(false)
    setMostrarModal(true)
  }

  const abrirModalEditar = (turno: Turno) => {
    setTurnoSeleccionado(turno)
    setModoEdicion(true)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setTurnoSeleccionado(null)
    setModoEdicion(false)
  }

  const cancelarTurno = async (turno: Turno) => {
    if (!confirm(`¿Estás seguro de que quieres cancelar el turno de ${turno.paciente_nombre}?`)) {
      return
    }

    try {
      // Cancelar en n8n (siguiendo la documentación)
      const datosN8n = {
        id: turno.id,
        fecha_hora: turno.fecha_hora,
        tutor: turno.tutor_nombre,
        email_tutor: turno.tutor_email,
        paciente: turno.paciente_nombre,
        tipo_consulta: turno.tipo_consulta
      }

      const respuestaN8n = await servicioN8nCalendario.cancelarTurno(datosN8n)

      if (!respuestaN8n.exito) {
        throw new Error(respuestaN8n.error || 'Error al cancelar turno en n8n')
      }

      // Actualizar estado en Supabase
      await servicioSupabase.actualizarTurno(turno.id, { estado: 'cancelado' })
      
      // Recargar turnos
      cargarTurnos()
    } catch (error) {
      console.error('Error al cancelar turno:', error)
      // Aquí podrías mostrar un toast de error
    }
  }

  const navegarSemana = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior') {
      setFechaActual(subWeeks(fechaActual, 1))
    } else {
      setFechaActual(addWeeks(fechaActual, 1))
    }
  }

  const irAHoy = () => {
    setFechaActual(new Date())
  }

  const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 })
  const diasSemanaArray = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Calendario Veterinario
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Gestiona turnos y citas con tus pacientes
              </p>
            </div>
            <button
              onClick={abrirModalCrear}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Turno
            </button>
          </div>
        </div>

        {/* Controles de navegación */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={irAHoy}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Hoy
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navegarSemana('anterior')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                  {format(inicioSemana, 'd MMM', { locale: es})} - {format(addDays(inicioSemana, 6), 'd MMM yyyy', { locale: es})}
                </h2>
                <button
                  onClick={() => navegarSemana('siguiente')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Semana
              </span>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header de días */}
          <div className="grid grid-cols-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="p-4 text-center font-semibold text-gray-500">
              Hora
            </div>
            {diasSemana.map((dia, index) => (
              <div key={dia} className="p-4 text-center border-l border-gray-200">
                <div className="text-sm font-semibold text-gray-500 mb-1">{dia}</div>
                <div className="text-lg font-bold text-gray-900">
                  {format(diasSemanaArray[index], 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Grid del calendario */}
          <div className="max-h-[600px] overflow-y-auto">
            {horas.map((hora) => (
              <div key={hora} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* Columna de hora */}
                <div className="p-4 text-center border-r border-gray-200 bg-gray-50">
                  <div className="text-sm font-medium text-gray-600">
                    {hora}:00
                  </div>
                </div>

                {/* Celdas de días */}
                {diasSemanaArray.map((fecha, diaIndex) => {
                  const turnosDelDia = obtenerTurnosDelDia(fecha)
                  const turnosEnEstaHora = turnosDelDia.filter(turno => {
                    const horaTurno = new Date(turno.fecha_hora).getHours()
                    return horaTurno === hora
                  })

                  return (
                    <div
                      key={`${fecha.getTime()}-${hora}`}
                      className="p-2 border-l border-gray-200 min-h-[60px] relative hover:bg-blue-50 transition-colors"
                    >
                      {turnosEnEstaHora.map((turno) => (
                        <div
                          key={turno.id}
                          className={`${obtenerColorTurno(turno.tipo_consulta)} text-white rounded-lg p-2 mb-1 shadow-sm group relative`}
                        >
                          <div 
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => abrirModalEditar(turno)}
                          >
                            <div className="text-xs font-medium truncate">
                              {turno.paciente_nombre}
                            </div>
                            <div className="text-xs opacity-90 truncate">
                              {turno.tipo_consulta.replace('_', ' ')}
                            </div>
                            <div className="text-xs opacity-75">
                              {format(new Date(turno.fecha_hora), 'HH:mm')}
                            </div>
                          </div>
                          
                          {/* Botones de acción */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  abrirModalEditar(turno)
                                }}
                                className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                title="Editar turno"
                              >
                                <PencilIcon className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cancelarTurno(turno)
                                }}
                                className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors"
                                title="Cancelar turno"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de turnos */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Turnos</p>
                <p className="text-2xl font-bold">{turnos.length}</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Confirmados</p>
                <p className="text-2xl font-bold">
                  {turnos.filter(t => t.estado === 'confirmado').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Programados</p>
                <p className="text-2xl font-bold">
                  {turnos.filter(t => t.estado === 'programado').length}
                </p>
              </div>
              <UserIcon className="w-8 h-8 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completados</p>
                <p className="text-2xl font-bold">
                  {turnos.filter(t => t.estado === 'completado').length}
                </p>
              </div>
              <HeartIcon className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Modal de turno */}
        {mostrarModal && (
          <ModalTurno
            turno={turnoSeleccionado}
            modoEdicion={modoEdicion}
            onClose={cerrarModal}
            onSave={cargarTurnos}
          />
        )}
      </div>
    </div>
  )
}
