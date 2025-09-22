'use client'

import { useEffect, useRef } from 'react'
import '@n8n/chat/style.css'
import { createChat } from '@n8n/chat'

interface ChatbotN8nProps {
  webhookUrl: string
  mode?: 'window' | 'fullscreen'
  target?: string
  showWelcomeScreen?: boolean
  enableStreaming?: boolean
  allowFileUploads?: boolean
  allowedFilesMimeTypes?: string
}

export default function ChatbotN8n({
  webhookUrl,
  mode = 'fullscreen',
  target = '#n8n-chat',
  showWelcomeScreen = true,
  enableStreaming = true,
  allowFileUploads = true,
  allowedFilesMimeTypes = 'application/pdf,image/*'
}: ChatbotN8nProps) {
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!webhookUrl) {
      console.error('❌ Webhook URL no configurada para n8n chat')
      return
    }

    console.log('🤖 Inicializando chatbot oficial de n8n...')
    console.log('🔗 Webhook URL:', webhookUrl)

    try {
      // Crear el chatbot oficial de n8n
      createChat({
        webhookUrl: webhookUrl,
        webhookConfig: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        },
        target: target,
        mode: mode,
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId',
        loadPreviousSession: true,
        metadata: {
          source: 'diagnovet-web',
          version: '1.0.0'
        },
        showWelcomeScreen: showWelcomeScreen,
        defaultLanguage: 'en',
        initialMessages: [
          '¡Hola! 👋',
          'Soy el asistente médico de DiagnoVET. ¿En qué puedo ayudarte hoy?'
        ],
        i18n: {
          es: {
            title: '¡Hola! 👋',
            subtitle: 'Soy tu asistente médico veterinario. Estoy aquí para ayudarte 24/7.',
            footer: 'DiagnoVET - Asistente Médico Inteligente',
            getStarted: 'Nueva Conversación',
            inputPlaceholder: 'Escribe tu pregunta veterinaria...',
            closeButtonTooltip: 'Cerrar chat',
          },
        },
        enableStreaming: enableStreaming,
        allowFileUploads: allowFileUploads,
        allowedFilesMimeTypes: allowedFilesMimeTypes
      })

      console.log('✅ Chatbot n8n inicializado exitosamente')
    } catch (error) {
      console.error('❌ Error al inicializar chatbot n8n:', error)
    }
  }, [webhookUrl, mode, target, showWelcomeScreen, enableStreaming, allowFileUploads, allowedFilesMimeTypes])

  return (
    <div className="w-full h-full">
      <div
        id="n8n-chat"
        ref={chatRef}
        className="w-full h-full"
        style={{
          width: mode === 'fullscreen' ? '100%' : '400px',
          height: mode === 'fullscreen' ? '100%' : '600px'
        }}
      />
    </div>
  )
}
