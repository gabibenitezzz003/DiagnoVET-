'use client'

import { useState } from 'react'
import { X, Filter } from 'lucide-react'
import { TIPOS_ESTUDIO, ESPECIES, ESTADOS_REPORTE } from '@/lib/constantes/configuracion'

interface FiltrosReportesProps {
  filtros: {
    fechaInicio: string
    fechaFin: string
    tipoEstudio: string
    especie: string
    veterinario: string
    estado: string
  }
  onCambioFiltros: (filtros: { fechaInicio: string; fechaFin: string; tipoEstudio: string; especie: string; veterinario: string; estado: string }) => void
  onCerrar: () => void
}

export function FiltrosReportes({
  filtros,
  onCambioFiltros,
  onCerrar
}: FiltrosReportesProps) {
  const [filtrosLocales, setFiltrosLocales] = useState({
    fechaInicio: filtros.fechaInicio || '',
    fechaFin: filtros.fechaFin || '',
    tipoEstudio: filtros.tipoEstudio || '',
    especie: filtros.especie || '',
    veterinario: filtros.veterinario || '',
    estado: filtros.estado || ''
  })

  const manejarCambio = (campo: keyof typeof filtros, valor: string) => {
    const nuevosFiltros = { ...filtrosLocales, [campo]: valor }
    setFiltrosLocales(nuevosFiltros)
  }

  const aplicarFiltros = () => {
    onCambioFiltros(filtrosLocales)
    onCerrar()
  }

  const limpiarFiltros = () => {
    const filtrosLimpios = {
      fechaInicio: '',
      fechaFin: '',
      tipoEstudio: '',
      especie: '',
      veterinario: '',
      estado: ''
    }
    setFiltrosLocales(filtrosLimpios)
    onCambioFiltros(filtrosLimpios)
    onCerrar()
  }

  const contarFiltrosActivos = () => {
    return Object.values(filtrosLocales).filter(valor => valor !== '').length
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filtros de Búsqueda</span>
          {contarFiltrosActivos() > 0 && (
            <span className="bg-primario-100 text-primario-800 text-xs px-2 py-1 rounded-full">
              {contarFiltrosActivos()}
            </span>
          )}
        </h3>
        <button
          onClick={onCerrar}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Estudio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Estudio
          </label>
          <select
            value={filtrosLocales.tipoEstudio}
            onChange={(e) => manejarCambio('tipoEstudio', e.target.value)}
            className="select-field"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_ESTUDIO.map((tipo) => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {/* Especie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especie
          </label>
          <select
            value={filtrosLocales.especie}
            onChange={(e) => manejarCambio('especie', e.target.value)}
            className="select-field"
          >
            <option value="">Todas las especies</option>
            {ESPECIES.map((especie) => (
              <option key={especie.valor} value={especie.valor}>
                {especie.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {/* Veterinario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Veterinario
          </label>
          <input
            type="text"
            value={filtrosLocales.veterinario}
            onChange={(e) => manejarCambio('veterinario', e.target.value)}
            placeholder="Buscar por nombre de veterinario..."
            className="input-field"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filtrosLocales.estado}
            onChange={(e) => manejarCambio('estado', e.target.value)}
            className="select-field"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_REPORTE.map((estado) => (
              <option key={estado.valor} value={estado.valor}>
                {estado.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={limpiarFiltros}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          Limpiar todos los filtros
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onCerrar}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={aplicarFiltros}
            className="btn-primary"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  )
}
