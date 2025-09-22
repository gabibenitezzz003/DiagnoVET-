'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Turno, CrearTurnoRequest, ActualizarTurnoRequest, TIPOS_CONSULTA, ESTADOS_TURNO } from '@/lib/tipos/turno'
import { servicioSupabase } from '@/lib/servicios/supabase'
import { servicioN8nCalendario } from '@/lib/servicios/n8n-calendario'

interface ModalTurnoProps {
  turno: Turno | null
  modoEdicion: boolean
  onClose: () => void
  onSave: () => void
}

export default function ModalTurno({ turno, modoEdicion, onClose, onSave }: ModalTurnoProps) {
  const [formData, setFormData] = useState<CrearTurnoRequest>({
    veterinario_id: '',
    tipo_consulta: 'presencial',
    fecha_hora: '',
    duracion_minutos: 30,
    urgencia: 'medio',
    lugar: '',
    mensaje: '',
    notas_internas: '',
    // Campos opcionales para paciente
    paciente_nombre: '',
    paciente_especie: '',
    paciente_raza: '',
    tutor_nombre: '',
    tutor_email: '',
    tutor_telefono: '',
    precio: 0
  })

  const [veterinarios, setVeterinarios] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (modoEdicion && turno) {
      setFormData({
        veterinario_id: turno.veterinario_id,
        tipo_consulta: turno.tipo_consulta,
        fecha_hora: turno.fecha_hora,
        duracion_minutos: turno.duracion_minutos,
        urgencia: turno.urgencia || 'medio',
        lugar: turno.lugar || '',
        mensaje: turno.mensaje || '',
        notas_internas: turno.notas_internas || '',
        // Campos opcionales para paciente
        paciente_nombre: turno.paciente_nombre || '',
        paciente_especie: turno.paciente_especie || '',
        paciente_raza: turno.paciente_raza || '',
        tutor_nombre: turno.tutor_nombre || '',
        tutor_email: turno.tutor_email || '',
        tutor_telefono: turno.tutor_telefono || '',
        precio: turno.precio || 0
      })
    } else {
      // Establecer fecha y hora por defecto
      const ahora = new Date()
      ahora.setMinutes(ahora.getMinutes() + 30) // 30 minutos en el futuro
      setFormData(prev => ({
        ...prev,
        fecha_hora: ahora.toISOString().slice(0, 16)
      }))
    }
  }, [turno, modoEdicion])

  useEffect(() => {
    cargarVeterinarios()
  }, [])

  const cargarVeterinarios = async () => {
    try {
      const respuesta = await servicioSupabase.obtenerVeterinarios()
      setVeterinarios(respuesta.datos || [])
    } catch (error) {
      console.error('Error al cargar veterinarios:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      console.log('🔄 Iniciando creación de turno...')
      console.log('📋 Datos del formulario:', formData)

      // Validar campos requeridos
      if (!formData.paciente_nombre || !formData.tutor_nombre || !formData.tutor_email || !formData.veterinario_id || !formData.fecha_hora) {
        throw new Error('Por favor completa todos los campos requeridos')
      }

      // Preparar datos para n8n
      const datosN8n = {
        id: modoEdicion && turno ? turno.id : `turno_${Date.now()}`,
        fecha_hora: formData.fecha_hora,
        tutor: formData.tutor_nombre,
        email_tutor: formData.tutor_email,
        paciente: formData.paciente_nombre,
        tipo_consulta: formData.tipo_consulta,
        veterinario: formData.veterinario_id,
        notas: formData.notas,
        precio: formData.precio
      }

      let respuestaN8n

      if (modoEdicion && turno) {
        console.log('✏️ Modificando turno en n8n...')
        respuestaN8n = await servicioN8nCalendario.modificarTurno(datosN8n)
      } else {
        console.log('➕ Creando turno en n8n...')
        respuestaN8n = await servicioN8nCalendario.crearTurno(datosN8n)
      }

      if (!respuestaN8n.exito) {
        throw new Error(respuestaN8n.error || 'Error desconocido en n8n')
      }

      console.log('✅ n8n procesó exitosamente:', respuestaN8n.mensaje)

      // Crear o actualizar turno en Supabase
      if (modoEdicion && turno) {
        console.log('✏️ Actualizando turno en Supabase...')
        const datosActualizacion: ActualizarTurnoRequest = { ...formData }
        const respuesta = await servicioSupabase.actualizarTurno(turno.id, datosActualizacion)
        
        if (!respuesta.exito) {
          throw new Error(respuesta.error || 'Error al actualizar turno en Supabase')
        }
        
        console.log('✅ Turno actualizado exitosamente en Supabase')
      } else {
        console.log('➕ Creando turno en Supabase...')
        const respuesta = await servicioSupabase.crearTurno(formData)
        
        if (!respuesta.exito) {
          throw new Error(respuesta.error || 'Error al crear turno en Supabase')
        }
        
        console.log('✅ Turno creado exitosamente en Supabase')
      }
      
      // Recargar turnos y cerrar modal
      onSave()
      onClose()
      
      // Mostrar mensaje de éxito
      alert(modoEdicion ? 'Turno actualizado exitosamente' : 'Turno creado exitosamente')
      
    } catch (error) {
      console.error('❌ Error al guardar turno:', error)
      alert(`Error: ${error.message || 'Error desconocido'}`)
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`🔄 Campo ${name} cambiado a:`, value)
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duracion_minutos' || name === 'precio' ? Number(value) : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {modoEdicion ? 'Editar Turno' : 'Nuevo Turno'}
              </h2>
              <p className="text-blue-100 text-sm">
                {modoEdicion ? 'Modifica los datos del turno' : 'Programa una nueva cita'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-white/20"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Información del Paciente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-pink-500" />
              <span>Información del Paciente</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Paciente *
                </label>
                <input
                  type="text"
                  name="paciente_nombre"
                  value={formData.paciente_nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ej: Max, Luna, Rocky"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especie *
                </label>
                <select
                  name="paciente_especie"
                  value={formData.paciente_especie}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar especie</option>
                  <option value="canino">Canino</option>
                  <option value="felino">Felino</option>
                  <option value="ave">Ave</option>
                  <option value="roedor">Roedor</option>
                  <option value="reptil">Reptil</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raza
                </label>
                <input
                  type="text"
                  name="paciente_raza"
                  value={formData.paciente_raza}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ej: Labrador, Persa, Canario"
                />
              </div>
            </div>
          </div>

          {/* Información del Tutor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-blue-500" />
              <span>Información del Tutor</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Tutor *
                </label>
                <input
                  type="text"
                  name="tutor_nombre"
                  value={formData.tutor_nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="tutor_email"
                    value={formData.tutor_email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <PhoneIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="tutor_telefono"
                    value={formData.tutor_telefono}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información de la Cita */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-green-500" />
              <span>Información de la Cita</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veterinario *
                </label>
                <select
                  name="veterinario_id"
                  value={formData.veterinario_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar veterinario</option>
                  {veterinarios.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.nombre} {vet.apellido} - {vet.especializacion}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta *
                </label>
                <select
                  name="tipo_consulta"
                  value={formData.tipo_consulta}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {TIPOS_CONSULTA.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  name="fecha_hora"
                  value={formData.fecha_hora}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos) *
                </label>
                <select
                  name="duracion_minutos"
                  value={formData.duracion_minutos}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1.5 horas</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (opcional)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <div className="relative">
                <DocumentTextIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Información adicional sobre la consulta..."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              onClick={() => console.log('🖱️ Click en botón Crear Turno')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Guardando...' : (modoEdicion ? 'Actualizar Turno' : 'Crear Turno')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
