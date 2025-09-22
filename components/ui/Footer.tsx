'use client'

import { Stethoscope, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primario-600 p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">DiagnoVET</h3>
                <p className="text-sm text-gray-400">Sistema de Reportes</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Transformamos la medicina veterinaria con inteligencia artificial. 
              Reduce el tiempo de redacción de informes y mejora la precisión diagnóstica.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#reportes" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Reportes
                </a>
              </li>
              <li>
                <a href="#chatbot" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Chatbot
                </a>
              </li>
              <li>
                <a href="#ayuda" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Ayuda
                </a>
              </li>
              <li>
                <a href="#documentacion" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Documentación
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primario-400" />
                <span className="text-gray-300">contacto@diagnovet.ai</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primario-400" />
                <span className="text-gray-300">+54 351 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primario-400" />
                <span className="text-gray-300">Córdoba, Argentina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea Separadora */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 DiagnoVET. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacidad" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Política de Privacidad
              </a>
              <a href="#terminos" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Términos de Uso
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
