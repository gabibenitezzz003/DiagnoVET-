'use client'

import Link from 'next/link'
import {
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const accesosRapidos = [
  {
    titulo: 'Analizar Documento',
    descripcion: 'Sube un PDF y obtén análisis automático con IA',
    href: '/documentos',
    icono: DocumentTextIcon,
    color: 'primario',
    accion: 'Nuevo análisis'
  },
  {
    titulo: 'Ver Dashboard',
    descripcion: 'Métricas, gráficos y estadísticas en tiempo real',
    href: '/dashboard',
    icono: ChartBarIcon,
    color: 'exito',
    accion: 'Ver analytics'
  },
  {
    titulo: 'Gestionar Reportes',
    descripcion: 'Revisa y administra todos los reportes procesados',
    href: '/reportes',
    icono: ClipboardDocumentListIcon,
    color: 'advertencia',
    accion: 'Ver reportes'
  },
  {
    titulo: 'Chatbot Médico',
    descripcion: 'Asistente especializado en veterinaria',
    href: '/chatbot',
    icono: ChatBubbleLeftRightIcon,
    color: 'primario',
    accion: 'Iniciar chat'
  },
  {
    titulo: 'Programar Turno',
    descripcion: 'Gestiona citas con integración a Google Calendar',
    href: '/turnos',
    icono: CalendarDaysIcon,
    color: 'exito',
    accion: 'Nueva cita'
  }
]

export function AccesosRapidos() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Accesos Rápidos
          </h2>
          <p className="text-lg text-gray-600">
            Accede rápidamente a las funciones principales de la plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accesosRapidos.map((acceso, index) => {
            const Icono = acceso.icono
            const colores = {
              primario: {
                bg: 'bg-primario-50',
                border: 'border-primario-200',
                icon: 'text-primario-600',
                button: 'bg-primario-600 hover:bg-primario-700'
              },
              exito: {
                bg: 'bg-exito-50',
                border: 'border-exito-200',
                icon: 'text-exito-600',
                button: 'bg-exito-600 hover:bg-exito-700'
              },
              advertencia: {
                bg: 'bg-advertencia-50',
                border: 'border-advertencia-200',
                icon: 'text-advertencia-600',
                button: 'bg-advertencia-600 hover:bg-advertencia-700'
              }
            }

            const colorConfig = colores[acceso.color as keyof typeof colores]

            return (
              <Link
                key={index}
                href={acceso.href}
                className={`group block ${colorConfig.bg} rounded-xl p-6 border-2 ${colorConfig.border} hover:shadow-lg transition-all duration-200 hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${colorConfig.bg} flex items-center justify-center`}>
                    <Icono className={`w-6 h-6 ${colorConfig.icon}`} />
                  </div>
                  <PlusIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                  {acceso.titulo}
                </h3>

                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                  {acceso.descripcion}
                </p>

                <div className={`inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium ${colorConfig.button} transition-colors`}>
                  {acceso.accion}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Acción destacada */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primario-600 to-primario-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para comenzar?
            </h3>
            <p className="text-primario-100 mb-6 max-w-2xl mx-auto">
              Sube tu primer documento médico y experimenta el poder de la IA
              en el análisis veterinario automatizado.
            </p>
            <Link
              href="/documentos"
              className="inline-flex items-center px-8 py-3 bg-white text-primario-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Comenzar Análisis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
