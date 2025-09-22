'use client'

import { useState } from 'react'
import { ImagenMedica } from '@/lib/tipos/reporte-veterinario'
import {
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface VisorImagenesProps {
  imagenes: ImagenMedica[]
  titulo?: string
}

export default function VisorImagenes({ imagenes, titulo = "Imágenes del Estudio" }: VisorImagenesProps) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState<ImagenMedica | null>(null)
  const [indiceActual, setIndiceActual] = useState(0)
  const [zoom, setZoom] = useState(100)

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay imágenes disponibles</h3>
        <p className="text-gray-500">Este estudio no contiene imágenes médicas.</p>
      </div>
    )
  }

  const abrirVisor = (imagen: ImagenMedica, indice: number) => {
    setImagenSeleccionada(imagen)
    setIndiceActual(indice)
    setZoom(100)
  }

  const cerrarVisor = () => {
    setImagenSeleccionada(null)
  }

  const imagenAnterior = () => {
    const nuevoIndice = indiceActual > 0 ? indiceActual - 1 : imagenes.length - 1
    setIndiceActual(nuevoIndice)
    setImagenSeleccionada(imagenes[nuevoIndice])
  }

  const imagenSiguiente = () => {
    const nuevoIndice = indiceActual < imagenes.length - 1 ? indiceActual + 1 : 0
    setIndiceActual(nuevoIndice)
    setImagenSeleccionada(imagenes[nuevoIndice])
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'radiografia': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ecografia': return 'bg-green-100 text-green-800 border-green-200'
      case 'ecocardiografia': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'analisis': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTipoIcono = (tipo: string) => {
    switch (tipo) {
      case 'radiografia': return '📷'
      case 'ecografia': return '🔍'
      case 'ecocardiografia': return '❤️'
      case 'analisis': return '🧪'
      default: return '📋'
    }
  }

  return (
    <>
      {/* Galería de imágenes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <span className="text-sm text-gray-500">
            {imagenes.length} imagen{imagenes.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imagenes.map((imagen, index) => (
            <div
              key={imagen.id}
              className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
              onClick={() => abrirVisor(imagen, index)}
            >
              {/* Imagen */}
              <div className="aspect-video relative">
                <img
                  src={imagen.url}
                  alt={imagen.descripcion}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/400x300/F3F4F6/9CA3AF?text=Imagen+no+disponible'
                  }}
                />

                {/* Overlay con información */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <EyeIcon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Badge de tipo */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${getTipoColor(imagen.tipo)}`}>
                  {getTipoIcono(imagen.tipo)} {imagen.tipo.toUpperCase()}
                </div>

                {/* Número de página */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Pág. {imagen.pagina}
                </div>
              </div>

              {/* Información de la imagen */}
              <div className="p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {imagen.nombre}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {imagen.descripcion}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  Imagen médica
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visor modal */}
      {imagenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col">
            {/* Header del visor */}
            <div className="flex items-center justify-between mb-4 text-white">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-semibold">
                  {imagenSeleccionada.nombre}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTipoColor(imagenSeleccionada.tipo)}`}>
                  {getTipoIcono(imagenSeleccionada.tipo)} {imagenSeleccionada.tipo.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Controles de zoom */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(300, zoom + 25))}
                    className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 rotate-180" />
                  </button>
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={cerrarVisor}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Imagen principal */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div
                className="relative max-w-full max-h-full"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <img
                  src={imagenSeleccionada.url}
                  alt={imagenSeleccionada.descripcion}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/800x600/F3F4F6/9CA3AF?text=Imagen+no+disponible'
                  }}
                />
              </div>
            </div>

            {/* Navegación */}
            {imagenes.length > 1 && (
              <div className="flex items-center justify-between mt-4 text-white">
                <button
                  onClick={imagenAnterior}
                  className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Anterior</span>
                </button>

                <div className="text-sm">
                  {indiceActual + 1} de {imagenes.length}
                </div>

                <button
                  onClick={imagenSiguiente}
                  className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <span>Siguiente</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Descripción */}
            <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-lg">
              <p className="text-white text-sm">
                {imagenSeleccionada.descripcion}
              </p>
              <div className="mt-2 text-xs text-gray-300">
                Página {imagenSeleccionada.pagina}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
