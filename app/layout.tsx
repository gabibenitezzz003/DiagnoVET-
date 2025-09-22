import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavegacionPrincipal } from '@/components/navegacion/NavegacionPrincipal'
import ChatbotFlotante from '@/components/chatbot/ChatbotFlotante'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DiagnoVET - Sistema de Diagnóstico Veterinario',
  description: 'Plataforma completa de análisis de reportes veterinarios con IA',
  keywords: 'veterinaria, diagnóstico, IA, reportes, análisis',
  authors: [{ name: 'DiagnoVET Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <NavegacionPrincipal />
          <main className="pt-16">
            {children}
          </main>
          <ChatbotFlotante />
        </div>
      </body>
    </html>
  )
}