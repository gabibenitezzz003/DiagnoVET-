'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navegacion = [
  { 
    nombre: 'Home', 
    href: '/', 
    icono: HomeIcon,
    descripcion: 'Página principal'
  },
  { 
    nombre: 'Dashboard', 
    href: '/dashboard', 
    icono: ChartBarIcon,
    descripcion: 'Analytics y métricas'
  },
  { 
    nombre: 'Documentos', 
    href: '/documentos', 
    icono: DocumentTextIcon,
    descripcion: 'Subir y analizar PDFs'
  },
  { 
    nombre: 'Reportes', 
    href: '/reportes', 
    icono: ClipboardDocumentListIcon,
    descripcion: 'Ver reportes detallados'
  },
  { 
    nombre: 'Chatbot', 
    href: '/chatbot', 
    icono: ChatBubbleLeftRightIcon,
    descripcion: 'Asistente médico'
  },
  { 
    nombre: 'Calendario', 
    href: '/calendario', 
    icono: CalendarDaysIcon,
    descripcion: 'Gestión de citas'
  },
]

export function NavegacionPrincipal() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primario-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DiagnoVET</span>
            </Link>
          </div>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navegacion.map((item) => {
              const Icono = item.icono
              const activo = pathname === item.href
              
              return (
                <Link
                  key={item.nombre}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activo
                      ? 'bg-primario-100 text-primario-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={item.descripcion}
                >
                  <Icono className="w-5 h-5 mr-2" />
                  <span>{item.nombre}</span>
                </Link>
              )
            })}
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {menuAbierto ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navegacion.map((item) => {
              const Icono = item.icono
              const activo = pathname === item.href
              
              return (
                <Link
                  key={item.nombre}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    activo
                      ? 'bg-primario-100 text-primario-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setMenuAbierto(false)}
                >
                  <Icono className="w-6 h-6 mr-3" />
                  <div>
                    <div>{item.nombre}</div>
                    <div className="text-xs text-gray-500">{item.descripcion}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
