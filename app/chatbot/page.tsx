'use client'

import { InformationCircleIcon, MicrophoneIcon, PhotoIcon, DocumentIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'
import ChatbotIncreible from '@/components/chatbot/ChatbotIncreible'

export default function ChatbotPage() {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''

  if (!webhookUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Webhook URL no configurada
          </h1>
          <p className="text-gray-600">
            Por favor, configura NEXT_PUBLIC_N8N_WEBHOOK_URL en tu archivo .env.local
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-primario-800 mb-3">
              Asistente Virtual DiagnoVET
            </h1>
            <p className="text-lg text-secundario-600">
              Tu compañero inteligente para consultas veterinarias con IA avanzada.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-exito-600">
              <div className="w-2 h-2 bg-exito-500 rounded-full animate-pulse"></div>
              <span>Conectado a n8n</span>
            </div>
          </div>
        </div>

        {/* Características del chatbot */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Imágenes</h3>
            </div>
            <p className="text-sm text-gray-600">
              Sube radiografías, ecografías y fotos médicas para análisis detallado.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DocumentIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Documentos</h3>
            </div>
            <p className="text-sm text-gray-600">
              Analiza PDFs, informes médicos y documentos clínicos.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MicrophoneIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Audio</h3>
            </div>
            <p className="text-sm text-gray-600">
              Graba audios con descripciones de síntomas o consultas.
            </p>
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🚧 En construcción
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <SpeakerWaveIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">IA Avanzada</h3>
            </div>
            <p className="text-sm text-gray-600">
              Respuestas inteligentes con análisis médico especializado.
            </p>
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🚧 En construcción
              </span>
            </div>
          </div>
        </div>

        {/* Información del chatbot */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Sobre el Asistente Médico Dr. VetAI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Capacidades Disponibles:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Análisis de imágenes médicas (radiografías, ecografías)</li>
                    <li>• Interpretación de reportes y documentos clínicos</li>
                    <li>• Diagnósticos diferenciales basados en síntomas</li>
                    <li>• Recomendaciones de tratamiento especializado</li>
                    <li>• Análisis de valores de laboratorio</li>
                    <li>• <span className="text-yellow-700">🚧 Procesamiento de audio (en desarrollo)</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Especialidades Médicas:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Medicina interna veterinaria</li>
                    <li>• Cirugía y traumatología</li>
                    <li>• Cardiología y neumología</li>
                    <li>• Neurología y oftalmología</li>
                    <li>• Dermatología y oncología</li>
                    <li>• Medicina de urgencias</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso de funcionalidades en construcción */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 text-yellow-600 mt-1">🚧</div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Funcionalidades en Desarrollo
              </h3>
              <p className="text-yellow-800 text-sm mb-3">
                Estamos trabajando en nuevas funcionalidades para mejorar tu experiencia:
              </p>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• <strong>Grabación de audio:</strong> Próximamente podrás grabar audios con descripciones de síntomas</li>
                <li>• <strong>IA Avanzada:</strong> Mejoras en el procesamiento y análisis de información médica</li>
                <li>• <strong>Transcripción automática:</strong> Los audios se convertirán automáticamente a texto</li>
                <li>• <strong>Análisis multimodal:</strong> Procesamiento simultáneo de texto, imágenes y audio</li>
              </ul>
              <p className="text-yellow-700 text-xs mt-3 font-medium">
                ¡Mantente atento a las actualizaciones!
              </p>
            </div>
          </div>
        </div>

        {/* Chatbot increíble */}
        <div className="h-[700px]">
          <ChatbotIncreible webhookUrl={webhookUrl} />
        </div>

      </div>
    </div>
  )
}