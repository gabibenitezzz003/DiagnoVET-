'use client'

import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'
import { 
  UserIcon, 
  HeartIcon, 
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import VisorImagenes from './VisorImagenes'

interface ReporteFormateadoProps {
  reporte: ReporteVeterinario
  modo?: 'completo' | 'resumen'
}

export default function ReporteFormateado({ reporte, modo = 'completo' }: ReporteFormateadoProps) {
  const getTipoEstudioColor = (tipo: string) => {
    switch (tipo) {
      case 'radiografia': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ecografia': return 'bg-green-100 text-green-800 border-green-200'
      case 'ecocardiografia': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'analisis': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTipoEstudioIcon = (tipo: string) => {
    switch (tipo) {
      case 'radiografia': return '📷'
      case 'ecografia': return '🔍'
      case 'ecocardiografia': return '❤️'
      case 'analisis': return '🧪'
      default: return '📋'
    }
  }

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'grave': return 'bg-red-100 text-red-800 border-red-200'
      case 'moderado': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'leve': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header del reporte */}
      <div className="bg-gradient-to-r from-primario-600 to-primario-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {getTipoEstudioIcon(reporte.informacionEstudio?.tipo || 'consulta')}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Reporte {reporte.informacionEstudio?.tipo?.charAt(0).toUpperCase() + reporte.informacionEstudio?.tipo?.slice(1) || 'Médico'}
              </h2>
              <p className="text-primario-100">
                {reporte.fechaCreacion.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTipoEstudioColor(reporte.informacionEstudio?.tipo || 'consulta')}`}>
              {(reporte.informacionEstudio?.tipo || 'consulta').toUpperCase()}
            </span>
            <div className="mt-2 text-sm text-primario-100">
              Confianza: {(reporte.confianzaExtraccion * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Información del Paciente */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <UserIcon className="w-6 h-6 text-primario-600" />
            <h3 className="text-lg font-semibold text-gray-900">Información del Paciente</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Nombre</div>
              <div className="text-lg font-semibold text-gray-900">{reporte.paciente?.nombre || 'No especificado'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Especie</div>
              <div className="text-lg font-semibold text-gray-900">{reporte.paciente?.especie || 'No especificada'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Raza</div>
              <div className="text-lg font-semibold text-gray-900">{reporte.paciente?.raza || 'No especificada'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Edad</div>
              <div className="text-lg font-semibold text-gray-900">{reporte.paciente?.edad || 'No especificada'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Sexo</div>
              <div className="text-lg font-semibold text-gray-900">{reporte.paciente?.sexo || 'No especificado'}</div>
            </div>
          </div>
        </div>

        {/* Información del Tutor */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <HeartIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Información del Tutor</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Nombre</div>
              <div className="text-lg font-semibold text-gray-900">{reporte.tutor?.nombre || 'No especificado'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Teléfono</div>
              <div className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span>{reporte.tutor?.telefono || 'No especificado'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Email</div>
              <div className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <span>{reporte.tutor?.email || 'No especificado'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Veterinario */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <AcademicCapIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Información del Veterinario</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Veterinario Derivante</div>
              <div className="text-lg font-semibold text-gray-900">
                {reporte.informacionEstudio?.veterinarioDerivante || 'No especificado'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Veterinario Firmante</div>
              <div className="text-lg font-semibold text-gray-900">
                {reporte.veterinarios?.[0]?.nombre || 'No especificado'} {reporte.veterinarios?.[0]?.apellido || ''}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Matrícula</div>
              <div className="text-lg font-semibold text-gray-900">{reporte.veterinarios?.[0]?.matricula || 'No especificada'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Clínica</div>
              <div className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                <span>{reporte.veterinarios?.[0]?.clinica || 'No especificada'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico Principal */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Diagnóstico Principal</h3>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <p className="text-lg font-medium text-gray-900">{reporte.conclusion?.principales?.[0] || 'No especificado'}</p>
          </div>
        </div>

        {/* Diagnósticos Secundarios */}
        {reporte.conclusion?.diferenciales && reporte.conclusion.diferenciales.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <InformationCircleIcon className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Diagnósticos Secundarios</h3>
            </div>
            <div className="space-y-2">
              {reporte.conclusion.diferenciales.map((diagnostico, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                  <p className="text-gray-900">{diagnostico}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recomendaciones</h3>
          </div>
          <div className="space-y-3">
            {reporte.tratamiento?.recomendaciones?.map((recomendacion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200 flex-1">
                  <p className="text-gray-900">{recomendacion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informe Médico Estructurado */}
        {reporte.contenidoCompleto?.informe && (
          <div className="mt-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informe Médico</h3>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded border font-mono">
                  {reporte.contenidoCompleto.informe}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones Clínicas */}
        {reporte.hallazgos?.principales && reporte.hallazgos.principales.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <EyeIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Se observa:</h3>
              </div>
              <ul className="space-y-2">
                {reporte.hallazgos.principales.map((hallazgo, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{hallazgo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Diagnóstico Radiológico */}
        {reporte.conclusion?.principales && reporte.conclusion.principales.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">DIAGNÓSTICO RADIOGRÁFICO:</h3>
              </div>
              <ul className="space-y-2">
                {reporte.conclusion.principales.map((diagnostico, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span className="text-gray-700">{diagnostico}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Notas y Recomendaciones */}
        {reporte.conclusion?.notasAdicionales && (
          <div className="mt-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notas:</h3>
              </div>
              <p className="text-gray-700">{reporte.conclusion.notasAdicionales}</p>
            </div>
          </div>
        )}

        {/* Recomendaciones de Tratamiento */}
        {reporte.tratamiento?.recomendaciones && reporte.tratamiento.recomendaciones.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recomendaciones:</h3>
              </div>
              <ul className="space-y-2">
                {reporte.tratamiento.recomendaciones.map((recomendacion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{recomendacion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Imágenes del Estudio */}
        {reporte.imagenes && reporte.imagenes.length > 0 && (
          <div className="mt-6">
            <VisorImagenes 
              imagenes={reporte.imagenes} 
              titulo="Imágenes del Estudio" 
            />
          </div>
        )}

        {/* Información Técnica */}
        {modo === 'completo' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Información Técnica</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Archivo Original</div>
                <div className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                  {reporte.archivoOriginal}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Estado del Procesamiento</div>
                <div className="text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    reporte.estado === 'completado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reporte.estado.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Extraído (solo en modo completo) */}
        {modo === 'completo' && reporte.contenidoExtraido && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contenido Extraído</h3>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {reporte.contenidoExtraido}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
