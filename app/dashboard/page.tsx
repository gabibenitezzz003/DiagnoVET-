'use client'

import { useEffect, useState } from 'react'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { GraficosDashboard } from '@/components/dashboard/GraficosDashboard'
import { MetricasTiempoReal } from '@/components/dashboard/MetricasTiempoReal'
import { TopVeterinarios } from '@/components/dashboard/TopVeterinarios'
import { ActividadReciente } from '@/components/dashboard/ActividadReciente'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Analytics y métricas en tiempo real de DiagnoVET
          </p>
        </div>

        {/* Métricas en tiempo real */}
        <MetricasTiempoReal />

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GraficosDashboard />
        </div>

        {/* Sección inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ActividadReciente />
          </div>
          <div>
            <TopVeterinarios />
          </div>
        </div>
      </div>
    </div>
  )
}
