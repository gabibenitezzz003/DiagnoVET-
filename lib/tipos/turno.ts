export interface Turno {
  id: string
  reporte_id?: string
  veterinario_id: string
  paciente_id?: string
  fecha_hora: string
  duracion_minutos: number
  urgencia?: 'bajo' | 'medio' | 'alto'
  lugar?: string
  tipo_consulta: string
  mensaje?: string
  estado: 'programado' | 'confirmado' | 'en_progreso' | 'completado' | 'cancelado'
  confirmado?: boolean
  recordatorio_enviado?: boolean
  notas_internas?: string
  creado_en: string
  actualizado_en: string
  // Campos calculados para la UI
  veterinario_nombre?: string
  paciente_nombre?: string
  paciente_especie?: string
  paciente_raza?: string
  tutor_nombre?: string
  tutor_email?: string
  tutor_telefono?: string
  precio?: number
}

export interface CrearTurnoRequest {
  veterinario_id: string
  tipo_consulta: string
  fecha_hora: string
  duracion_minutos: number
  urgencia?: 'bajo' | 'medio' | 'alto'
  lugar?: string
  mensaje?: string
  notas_internas?: string
  // Campos opcionales para crear paciente si no existe
  paciente_nombre?: string
  paciente_especie?: string
  paciente_raza?: string
  tutor_nombre?: string
  tutor_email?: string
  tutor_telefono?: string
  precio?: number
}

export interface ActualizarTurnoRequest {
  veterinario_id?: string
  tipo_consulta?: string
  fecha_hora?: string
  duracion_minutos?: number
  urgencia?: 'bajo' | 'medio' | 'alto'
  lugar?: string
  mensaje?: string
  estado?: 'programado' | 'confirmado' | 'en_progreso' | 'completado' | 'cancelado'
  confirmado?: boolean
  recordatorio_enviado?: boolean
  notas_internas?: string
  // Campos opcionales para actualizar paciente
  paciente_nombre?: string
  paciente_especie?: string
  paciente_raza?: string
  tutor_nombre?: string
  tutor_email?: string
  tutor_telefono?: string
  precio?: number
}

export const TIPOS_CONSULTA = [
  { value: 'presencial', label: 'Consulta Presencial', color: 'bg-blue-500' },
  { value: 'virtual', label: 'Consulta Virtual', color: 'bg-green-500' },
  { value: 'domicilio', label: 'Consulta a Domicilio', color: 'bg-purple-500' }
] as const

export const ESPECIALIDADES_CONSULTA = [
  { value: 'consulta_general', label: 'Consulta General', color: 'bg-blue-500' },
  { value: 'cirugia', label: 'Cirugía', color: 'bg-red-500' },
  { value: 'dermatologia', label: 'Dermatología', color: 'bg-green-500' },
  { value: 'cardiologia', label: 'Cardiología', color: 'bg-purple-500' },
  { value: 'neurologia', label: 'Neurología', color: 'bg-orange-500' },
  { value: 'oftalmologia', label: 'Oftalmología', color: 'bg-pink-500' },
  { value: 'urgencia', label: 'Urgencia', color: 'bg-yellow-500' },
  { value: 'vacunacion', label: 'Vacunación', color: 'bg-indigo-500' }
] as const

export const ESTADOS_TURNO = [
  { value: 'programado', label: 'Programado', color: 'bg-gray-500' },
  { value: 'confirmado', label: 'Confirmado', color: 'bg-green-500' },
  { value: 'completado', label: 'Completado', color: 'bg-blue-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' }
] as const

export interface FiltrosTurno {
  fecha_inicio?: string
  fecha_fin?: string
  estado?: 'programado' | 'confirmado' | 'completado' | 'cancelado'
  veterinario_id?: string
  tipo_consulta?: string
}
