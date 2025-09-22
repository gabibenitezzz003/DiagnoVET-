'use client'

import { Upload, FileText, Brain, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="text-center py-16">
      <div className="max-w-4xl mx-auto">
        {/* Título Principal */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Transforma la{' '}
          <span className="text-primario-600">Medicina Veterinaria</span>
          {' '}con IA
        </h1>
        
        {/* Subtítulo */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Reduce el tiempo de redacción de informes de 45 minutos a solo 5 minutos. 
          Procesa reportes veterinarios con inteligencia artificial y obtén diagnósticos 
          precisos al instante.
        </p>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-primario-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primario-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">5 min</h3>
            <p className="text-gray-600">Tiempo promedio de procesamiento</p>
          </div>
          
          <div className="text-center">
            <div className="bg-exito-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-exito-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">95%</h3>
            <p className="text-gray-600">Precisión en extracción de datos</p>
          </div>
          
          <div className="text-center">
            <div className="bg-advertencia-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-advertencia-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">IA</h3>
            <p className="text-gray-600">Tecnología de vanguardia</p>
          </div>
        </div>

        {/* Características Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card card-hover">
            <div className="bg-primario-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primario-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Subida Rápida</h3>
            <p className="text-sm text-gray-600">
              Sube reportes PDF y obtén resultados instantáneos
            </p>
          </div>
          
          <div className="card card-hover">
            <div className="bg-exito-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-exito-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Extracción Inteligente</h3>
            <p className="text-sm text-gray-600">
              IA extrae automáticamente información clave
            </p>
          </div>
          
          <div className="card card-hover">
            <div className="bg-advertencia-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-advertencia-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Chatbot Especializado</h3>
            <p className="text-sm text-gray-600">
              Consulta con IA especializada en veterinaria
            </p>
          </div>
          
          <div className="card card-hover">
            <div className="bg-primario-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primario-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Procesamiento Rápido</h3>
            <p className="text-sm text-gray-600">
              Resultados en segundos, no en minutos
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primario-600 to-primario-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            ¿Listo para revolucionar tu práctica veterinaria?
          </h2>
          <p className="text-primario-100 mb-6">
            Únete a cientos de veterinarios que ya están ahorrando horas cada semana
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primario-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Probar Gratis
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primario-600 transition-colors duration-200">
              Ver Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
