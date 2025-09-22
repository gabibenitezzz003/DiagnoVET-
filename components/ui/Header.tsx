'use client'

import { useState } from 'react'
import { Menu, X, Stethoscope, User, Settings, LogOut } from 'lucide-react'

export function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primario-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DiagnoVET</h1>
              <p className="text-xs text-gray-500">Sistema de Reportes</p>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#reportes" 
              className="text-gray-700 hover:text-primario-600 transition-colors duration-200"
            >
              Reportes
            </a>
            <a 
              href="#chatbot" 
              className="text-gray-700 hover:text-primario-600 transition-colors duration-200"
            >
              Chatbot
            </a>
            <a 
              href="#ayuda" 
              className="text-gray-700 hover:text-primario-600 transition-colors duration-200"
            >
              Ayuda
            </a>
          </nav>

          {/* Usuario y Configuración */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <Settings className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primario-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primario-600" />
              </div>
              <span className="text-sm text-gray-700">Dr. Veterinario</span>
            </div>
            <button className="p-2 text-gray-500 hover:text-red-600 transition-colors duration-200">
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menú Móvil */}
        {menuAbierto && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a 
                href="#reportes" 
                className="text-gray-700 hover:text-primario-600 transition-colors duration-200"
                onClick={() => setMenuAbierto(false)}
              >
                Reportes
              </a>
              <a 
                href="#chatbot" 
                className="text-gray-700 hover:text-primario-600 transition-colors duration-200"
                onClick={() => setMenuAbierto(false)}
              >
                Chatbot
              </a>
              <a 
                href="#ayuda" 
                className="text-gray-700 hover:text-primario-600 transition-colors duration-200"
                onClick={() => setMenuAbierto(false)}
              >
                Ayuda
              </a>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primario-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primario-600" />
                  </div>
                  <span className="text-sm text-gray-700">Dr. Veterinario</span>
                </div>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Configuración</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors duration-200">
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
