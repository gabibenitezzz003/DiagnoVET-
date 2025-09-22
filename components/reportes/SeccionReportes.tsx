'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react'
import { ReporteVeterinario } from '@/lib/tipos/reporte-veterinario'
import { FormularioSubidaReporte } from './FormularioSubidaReporte'
import { ListaReportes } from './ListaReportes'
import { FiltrosReportes } from './FiltrosReportes'
import { DetalleReporte } from './DetalleReporte'
import { backendAPI } from '@/lib/servicios/backend-api'

interface SeccionReportesProps {
  reportes: ReporteVeterinario[]
  onReporteProcesado: (reporte: ReporteVeterinario) => void
  onReporteActualizado: (reporte: ReporteVeterinario) => void
  onReporteEliminado: (reporteId: string) => void
}

export function SeccionReportes({
  reportes: reportesIniciales,
  onReporteProcesado,
  onReporteActualizado,
  onReporteEliminado
}: SeccionReportesProps) {
  const [reportes, setReportes] = useState<ReporteVeterinario[]>(reportesIniciales)
  const [cargando, setCargando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteVeterinario | null>(null)
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoEstudio: '',
    especie: '',
    veterinario: '',
    estado: ''
  })

  // Cargar reportes desde el backend
  useEffect(() => {
    cargarReportes()
  }, [])

  const cargarReportes = async () => {
    try {
      setCargando(true)
      const reportesBackend = await backendAPI.obtenerReportes(filtros)
      setReportes(reportesBackend)
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setCargando(false)
    }
  }

  // Recargar reportes cuando cambien los filtros
  useEffect(() => {
    cargarReportes()
  }, [filtros])

  const manejarSubidaExitosa = (reporte: ReporteVeterinario) => {
    onReporteProcesado(reporte)
    setMostrarFormulario(false)
    // Recargar la lista de reportes
    cargarReportes()
  }

  const manejarSeleccionReporte = (reporte: ReporteVeterinario) => {
    setReporteSeleccionado(reporte)
  }

  const manejarCerrarDetalle = () => {
    setReporteSeleccionado(null)
  }

  const manejarActualizacionReporte = (reporte: ReporteVeterinario) => {
    onReporteActualizado(reporte)
    setReporteSeleccionado(reporte)
    // Recargar la lista de reportes
    cargarReportes()
  }

  const manejarEliminacionReporte = (reporteId: string) => {
    onReporteEliminado(reporteId)
    setReporteSeleccionado(null)
    // Recargar la lista de reportes
    cargarReportes()
  }

  const manejarCambioFiltros = (nuevosFiltros: typeof filtros) => {
    setFiltros(nuevosFiltros)
  }

  const manejarBusqueda = async (termino: string) => {
    setTerminoBusqueda(termino)
    if (termino.trim()) {
      try {
        setCargando(true)
        const reportesEncontrados = await backendAPI.buscarReportes(termino)
        setReportes(reportesEncontrados)
      } catch (error) {
        console.error('Error al buscar reportes:', error)
      } finally {
        setCargando(false)
      }
    } else {
      cargarReportes()
    }
  }

  const reportesFiltrados = reportes

  return (
    <div className="space-y-6">
      {/* Header de la Sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes Veterinarios</h2>
          <p className="text-gray-600">
            Gestiona y procesa reportes con inteligencia artificial
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMostrarFormulario(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Reporte</span>
          </button>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar reportes por paciente, veterinario o diagnóstico..."
          value={terminoBusqueda}
          onChange={(e) => manejarBusqueda(e.target.value)}
          className="input-field pl-10"
        />
        {cargando && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <FiltrosReportes
          filtros={filtros}
          onCambioFiltros={manejarCambioFiltros}
          onCerrar={() => setMostrarFiltros(false)}
        />
      )}

      {/* Lista de Reportes */}
      {cargando ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando reportes...</span>
        </div>
      ) : (
        <ListaReportes
          reportes={reportesFiltrados}
          onSeleccionarReporte={manejarSeleccionReporte}
          onActualizarReporte={manejarActualizacionReporte}
          onEliminarReporte={manejarEliminacionReporte}
        />
      )}

      {/* Formulario de Subida */}
      {mostrarFormulario && (
        <FormularioSubidaReporte
          onSubidaExitosa={manejarSubidaExitosa}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {/* Detalle del Reporte */}
      {reporteSeleccionado && (
        <DetalleReporte
          reporte={reporteSeleccionado}
          onCerrar={manejarCerrarDetalle}
          onActualizar={manejarActualizacionReporte}
          onEliminar={manejarEliminacionReporte}
        />
      )}
    </div>
  )
}
