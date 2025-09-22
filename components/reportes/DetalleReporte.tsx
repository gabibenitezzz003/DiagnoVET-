'use client'

import { useState } from 'react'
import { X, Edit, Download, Share, User, Calendar, Stethoscope, AlertCircle, CheckCircle, Clock, Image as ImageIcon, Eye, Heart, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import VisorMarkdown from '../VisorMarkdown'

interface DetalleReporteProps {
  reporte: ReporteVeterinario
  onCerrar: () => void
  onActualizar: (reporte: ReporteVeterinario) => void
  onEliminar: (reporteId: string) => void
}

export function DetalleReporte({
  reporte,
  onCerrar,
  onActualizar,
  onEliminar
}: DetalleReporteProps) {
  const [mostrarImagen, setMostrarImagen] = useState<string | null>(null)
  const [mostrarVisorImagenes, setMostrarVisorImagenes] = useState(false)
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0)
  const [mostrarMarkdown, setMostrarMarkdown] = useState(false)

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="h-5 w-5 text-exito-600" />
      case 'procesando':
        return <Clock className="h-5 w-5 text-advertencia-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-exito-100 text-exito-800 border-exito-200'
      case 'procesando':
        return 'bg-advertencia-100 text-advertencia-800 border-advertencia-200'
      case 'error':
        return 'bg-error-100 text-error-800 border-error-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const obtenerTipoEstudioIcono = (tipo: string) => {
    switch (tipo) {
      case 'radiografia':
        return '📷'
      case 'ecografia':
        return '🔍'
      case 'analisis':
        return '🧪'
      case 'consulta':
        return '🩺'
      default:
        return '📄'
    }
  }

  const obtenerIconoTipoImagen = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'radiografia':
      case 'radiografía':
        return <ImageIcon className="w-5 h-5" />
      case 'ecocardiografia':
      case 'ecocardiografía':
        return <Heart className="w-5 h-5" />
      case 'ecografia':
      case 'ecografía':
        return <Stethoscope className="w-5 h-5" />
      default:
        return <ImageIcon className="w-5 h-5" />
    }
  }

  const getColorTipoImagen = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'radiografia':
      case 'radiografía':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ecocardiografia':
      case 'ecocardiografía':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'ecografia':
      case 'ecografía':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const abrirVisorImagenes = (index: number) => {
    setImagenSeleccionada(index)
    setMostrarVisorImagenes(true)
  }

  const manejarEliminar = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      onEliminar(reporte.id)
      onCerrar()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">
              {obtenerTipoEstudioIcono(reporte.informacionEstudio?.tipo || 'otro')}
            </span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Reporte de {reporte.paciente.nombre}
              </h3>
              <p className="text-sm text-gray-500">
                {(reporte.informacionEstudio?.tipo || 'otro').charAt(0).toUpperCase() + (reporte.informacionEstudio?.tipo || 'otro').slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* TODO: Implementar edición */ }}
              className="p-2 text-gray-400 hover:text-advertencia-600 transition-colors duration-200"
              title="Editar"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => {/* TODO: Implementar descarga */ }}
              className="p-2 text-gray-400 hover:text-primario-600 transition-colors duration-200"
              title="Descargar"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => {/* TODO: Implementar compartir */ }}
              className="p-2 text-gray-400 hover:text-primario-600 transition-colors duration-200"
              title="Compartir"
            >
              <Share className="h-5 w-5" />
            </button>
            <button
              onClick={onCerrar}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Estado y Metadatos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {obtenerIconoEstado(reporte.estado)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${obtenerColorEstado(reporte.estado)}`}>
                {reporte.estado}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Confianza:</strong> {Math.round(reporte.confianzaExtraccion * 100)}%
            </div>
            <div className="text-sm text-gray-600">
              <strong>Archivo:</strong> {reporte.archivoOriginal}
            </div>
          </div>

          {/* Información del Paciente */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información del Paciente</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{reporte.paciente.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Especie</label>
                <p className="text-gray-900">{reporte.paciente.especie}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Raza</label>
                <p className="text-gray-900">{reporte.paciente.raza}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Edad</label>
                <p className="text-gray-900">{reporte.paciente.edad}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sexo</label>
                <p className="text-gray-900">{reporte.paciente.sexo}</p>
              </div>
              {reporte.paciente.peso && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Peso</label>
                  <p className="text-gray-900">{reporte.paciente.peso}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Tutor */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Tutor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{reporte.tutor.nombre}</p>
              </div>
              {reporte.tutor.telefono && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900">{reporte.tutor.telefono}</p>
                </div>
              )}
              {reporte.tutor.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{reporte.tutor.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Veterinario */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>Información del Veterinario</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{reporte.veterinarios?.[0]?.nombre || 'N/A'}</p>
              </div>
              {reporte.veterinarios?.[0]?.matricula && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Matrícula</label>
                  <p className="text-gray-900">{reporte.veterinarios[0].matricula}</p>
                </div>
              )}
              {reporte.veterinarios?.[0]?.clinica && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Clínica</label>
                  <p className="text-gray-900">{reporte.veterinarios[0].clinica}</p>
                </div>
              )}
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Diagnóstico
            </h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Diagnóstico Principal</label>
                <p className="text-gray-900 mt-1">{reporte.conclusion?.principales?.[0] || 'N/A'}</p>
              </div>

              {reporte.conclusion?.diferenciales && reporte.conclusion.diferenciales.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Diagnósticos Diferenciales</label>
                  <ul className="list-disc list-inside text-gray-900 mt-1 space-y-1">
                    {reporte.conclusion.diferenciales.map((diferencial, index) => (
                      <li key={index}>{diferencial}</li>
                    ))}
                  </ul>
                </div>
              )}

              {reporte.conclusion?.notasAdicionales && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observaciones</label>
                  <p className="text-gray-900 mt-1">{reporte.conclusion.notasAdicionales}</p>
                </div>
              )}

              {reporte.tratamiento?.recomendaciones && reporte.tratamiento.recomendaciones.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Recomendaciones</label>
                  <ul className="list-disc list-inside text-gray-900 mt-1 space-y-1">
                    {reporte.tratamiento.recomendaciones.map((recomendacion, index) => (
                      <li key={index}>{recomendacion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Imágenes Médicas */}
          {reporte.imagenes && reporte.imagenes.length > 0 ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Imágenes Médicas ({reporte.imagenes.length})</span>
                </h4>
                <button
                  onClick={() => abrirVisorImagenes(0)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todas
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reporte.imagenes.map((imagen, index) => (
                  <div
                    key={imagen.id || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => abrirVisorImagenes(index)}
                  >
                    {/* Header de la imagen */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorTipoImagen(imagen.tipo)}`}>
                        {obtenerIconoTipoImagen(imagen.tipo)}
                        <span className="ml-1 capitalize">{imagen.tipo || 'Imagen'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirVisorImagenes(index);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contenido de la imagen */}
                    <div className="space-y-2">
                      <div className="bg-gray-100 rounded-lg p-3 min-h-[120px] flex items-center justify-center">
                        <div className="text-center">
                          {obtenerIconoTipoImagen(imagen.tipo)}
                          <p className="text-sm text-gray-500 mt-1">Imagen {index + 1}</p>
                        </div>
                      </div>

                      {imagen.descripcion && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Descripción</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{imagen.descripcion}</p>
                        </div>
                      )}

                      {imagen.pagina && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Página</h4>
                          <p className="text-sm text-gray-600">{imagen.pagina}</p>
                        </div>
                      )}

                      {imagen.descripcion && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Hallazgos</h4>
                          <p className="text-sm text-gray-600 line-clamp-3">{imagen.descripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay imágenes médicas disponibles</p>
              </div>
            </div>
          )}

          {/* Contenido Extraído */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Contenido Extraído
              </h4>
              {reporte.markdownCompleto && (
                <button
                  onClick={() => setMostrarMarkdown(!mostrarMarkdown)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {mostrarMarkdown ? 'Ver Texto' : 'Ver Markdown'}
                </button>
              )}
            </div>

            {mostrarMarkdown && reporte.markdownCompleto ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <VisorMarkdown contenido={reporte.markdownCompleto} />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {reporte.contenidoExtraido}
                </pre>
              </div>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                <strong>Creado:</strong> {format(new Date(reporte.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                <strong>Creado:</strong> {format(new Date(reporte.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={manejarEliminar}
            className="btn-error flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Eliminar Reporte</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onCerrar}
              className="btn-secondary"
            >
              Cerrar
            </button>
            <button
              onClick={() => {/* TODO: Implementar edición */ }}
              className="btn-primary"
            >
              Editar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Imagen */}
      {mostrarImagen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setMostrarImagen(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={mostrarImagen}
              alt="Imagen médica"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Visor de Imágenes Médicas */}
      {mostrarVisorImagenes && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-95 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h3 className="text-white text-lg font-semibold">
                Visor de Imágenes Médicas
              </h3>
              <span className="text-gray-300">
                {imagenSeleccionada + 1} de {reporte.imagenes.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMostrarVisorImagenes(false)}
                className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Cerrar visor"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Controles laterales */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
            <button
              onClick={() => setImagenSeleccionada((prev) => (prev - 1 + reporte.imagenes.length) % reporte.imagenes.length)}
              disabled={reporte.imagenes.length <= 1}
              className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setImagenSeleccionada((prev) => (prev + 1) % reporte.imagenes.length)}
              disabled={reporte.imagenes.length <= 1}
              className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Área de imagen */}
          <div className="flex-1 flex items-center justify-center p-4 mt-16">
            <div className="relative max-w-full max-h-full">
              <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] min-w-[600px] flex items-center justify-center">
                <div className="text-center">
                  {obtenerIconoTipoImagen(reporte.imagenes[imagenSeleccionada]?.tipo)}
                  <p className="text-gray-500 mt-2">Imagen {imagenSeleccionada + 1}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {reporte.imagenes[imagenSeleccionada]?.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de información */}
          <div className="absolute top-16 right-4 bg-gray-900 bg-opacity-95 p-4 rounded-lg max-w-sm">
            <h4 className="text-white font-semibold mb-2">Información de la Imagen</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div>
                <span className="font-medium">Tipo:</span> {reporte.imagenes[imagenSeleccionada]?.tipo || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Descripción:</span> {reporte.imagenes[imagenSeleccionada]?.descripcion || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Hallazgos:</span> {reporte.imagenes[imagenSeleccionada]?.descripcion || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Página:</span> {reporte.imagenes[imagenSeleccionada]?.pagina || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
