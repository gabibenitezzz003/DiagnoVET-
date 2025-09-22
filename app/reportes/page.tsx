'use client'

import { useEffect, useState } from 'react'
import { 
  ClipboardDocumentListIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { servicioSupabase } from '@/lib/servicios/supabase'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'
import ReporteFormateado from '@/components/reportes/ReporteFormateado'

export default function ReportesPage() {
  const [reportes, setReportes] = useState<ReporteVeterinario[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteVeterinario | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    cargarReportes()
  }, [])

  const cargarReportes = async () => {
    try {
      setCargando(true)
      const respuesta = await servicioSupabase.obtenerReportes({}, 1, 100)
      setReportes(respuesta.datos || [])
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setCargando(false)
    }
  }

  const abrirModal = (reporte: ReporteVeterinario) => {
    setReporteSeleccionado(reporte)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setReporteSeleccionado(null)
  }

  const reportesFiltrados = reportes.filter(reporte => {
    const coincideBusqueda = busqueda === '' || 
      reporte.paciente?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      reporte.veterinarios?.some(vet => vet.nombre?.toLowerCase().includes(busqueda.toLowerCase())) ||
      reporte.conclusion?.principales?.some(diag => diag.toLowerCase().includes(busqueda.toLowerCase()))
    
    const coincideEstado = filtroEstado === 'todos' || reporte.estado === filtroEstado
    
    return coincideBusqueda && coincideEstado
  })

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-exito-100 text-exito-800'
      case 'procesando':
        return 'bg-advertencia-100 text-advertencia-800'
      case 'error':
        return 'bg-error-100 text-error-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoEstudioColor = (tipo: string) => {
    switch (tipo) {
      case 'radiografia':
        return 'bg-blue-100 text-blue-800'
      case 'ecografia':
        return 'bg-green-100 text-green-800'
      case 'analisis':
        return 'bg-purple-100 text-purple-800'
      case 'consulta':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando reportes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes Veterinarios
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona y revisa todos los reportes procesados
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, veterinario o diagnóstico..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de estado */}
            <div className="md:w-48">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primario-500 focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="completado">Completados</option>
                <option value="procesando">En proceso</option>
                <option value="error">Con error</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="space-y-4">
          {reportesFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron reportes
              </h3>
              <p className="text-gray-600">
                {busqueda || filtroEstado !== 'todos' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay reportes procesados aún'
                }
              </p>
            </div>
          ) : (
            reportesFiltrados.map((reporte) => (
              <div
                key={reporte.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primario-100 rounded-lg flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-6 h-6 text-primario-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reporte.paciente?.nombre || 'Paciente sin nombre'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoEstudioColor(reporte.tipoEstudio)}`}>
                          {reporte.tipoEstudio}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reporte.estado)}`}>
                          {reporte.estado}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Especie:</span> {reporte.paciente?.especie || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Veterinario:</span> {reporte.veterinarios?.[0]?.nombre || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span> {new Date(reporte.fechaCreacion).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      
                      {reporte.conclusion?.principales?.[0] && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Diagnóstico:</span> {reporte.conclusion.principales[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => abrirModal(reporte)}
                      className="inline-flex items-center px-4 py-2 bg-primario-600 text-white rounded-lg hover:bg-primario-700 transition-colors text-sm font-medium"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen */}
        {reportesFiltrados.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primario-600">
                  {reportesFiltrados.length}
                </p>
                <p className="text-sm text-gray-600">Total Reportes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-exito-600">
                  {reportesFiltrados.filter(r => r.estado === 'completado').length}
                </p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-advertencia-600">
                  {reportesFiltrados.filter(r => r.estado === 'procesando').length}
                </p>
                <p className="text-sm text-gray-600">En Proceso</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-error-600">
                  {reportesFiltrados.filter(r => r.estado === 'error').length}
                </p>
                <p className="text-sm text-gray-600">Con Error</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal de visualización de reporte */}
        {mostrarModal && reporteSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-primario-600 to-primario-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Reporte Veterinario - {reporteSeleccionado.paciente?.nombre || 'Sin nombre'}
                  </h2>
                  <p className="text-primario-100 text-sm">
                    {reporteSeleccionado.informacionEstudio?.tipo || 'Sin tipo'} - {new Date(reporteSeleccionado.fechaCreacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="text-white hover:text-primario-200 transition-colors p-2 rounded-lg hover:bg-white/20"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <ReporteFormateado reporte={reporteSeleccionado} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
