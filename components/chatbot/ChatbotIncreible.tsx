'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  PaperAirplaneIcon, 
  MicrophoneIcon, 
  StopIcon,
  PaperClipIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  SpeakerWaveIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { 
  MicrophoneIcon as MicrophoneSolidIcon,
  StopIcon as StopSolidIcon
} from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
  timestamp: Date
  archivos?: ArchivoAdjunto[]
  audio?: string
}

interface ArchivoAdjunto {
  id: string
  nombre: string
  tipo: string
  tamaño: number
  url: string
  preview?: string
}

interface ChatbotIncreibleProps {
  webhookUrl: string
}

export default function ChatbotIncreible({ webhookUrl }: ChatbotIncreibleProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      tipo: 'asistente',
      contenido: '¡Hola! Soy el Dr. VetAI, tu asistente médico veterinario especializado. Puedo ayudarte con análisis de documentos, interpretación de imágenes médicas, diagnósticos y recomendaciones. ¿En qué puedo asistirte hoy?',
      timestamp: new Date()
    }
  ])
  const [mensajeActual, setMensajeActual] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [grabando, setGrabando] = useState(false)
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<ArchivoAdjunto[]>([])
  const [mostrarAdjuntos, setMostrarAdjuntos] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  const mensajesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Configuración de dropzone para archivos
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const archivo: ArchivoAdjunto = {
        id: `archivo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size,
        url: URL.createObjectURL(file),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }
      
      setArchivosAdjuntos(prev => [...prev, archivo])
      toast.success(`Archivo ${file.name} agregado`)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  // Función para iniciar grabación de audio
  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Agregar audio como archivo adjunto
        const audioArchivo: ArchivoAdjunto = {
          id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nombre: `audio_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`,
          tipo: 'audio/wav',
          tamaño: audioBlob.size,
          url: audioUrl
        }
        
        setArchivosAdjuntos(prev => [...prev, audioArchivo])
        toast.success('Audio grabado exitosamente')
        
        // Detener el stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setGrabando(true)
      toast.success('Grabación iniciada')
    } catch (error) {
      console.error('Error al acceder al micrófono:', error)
      toast.error('No se pudo acceder al micrófono')
    }
  }

  // Función para detener grabación de audio
  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop()
      setGrabando(false)
      toast.success('Grabación detenida')
    }
  }

  // Función para eliminar archivo adjunto
  const eliminarArchivo = (id: string) => {
    setArchivosAdjuntos(prev => {
      const archivo = prev.find(a => a.id === id)
      if (archivo) {
        URL.revokeObjectURL(archivo.url)
        if (archivo.preview) {
          URL.revokeObjectURL(archivo.preview)
        }
      }
      return prev.filter(a => a.id !== id)
    })
  }

  // Función para enviar mensaje
  const enviarMensaje = async () => {
    if ((!mensajeActual.trim() && archivosAdjuntos.length === 0) || enviando) return

    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: mensajeActual,
      timestamp: new Date(),
      archivos: [...archivosAdjuntos]
    }

    setMensajes(prev => [...prev, nuevoMensaje])
    const mensajeParaEnviar = mensajeActual
    setMensajeActual('')
    setArchivosAdjuntos([])
    setMostrarAdjuntos(false)
    setEnviando(true)

    try {
      console.log('🤖 Enviando mensaje al chatbot...')
      
      // Preparar datos para enviar a n8n
      const datosEnvio = {
        chatInput: mensajeParaEnviar,
        sessionId: sessionId,
        archivos: archivosAdjuntos.map(archivo => ({
          nombre: archivo.nombre,
          tipo: archivo.tipo,
          tamaño: archivo.tamaño,
          url: archivo.url
        }))
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosEnvio)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Respuesta recibida del chatbot:', data)

      const respuestaAsistente: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: data.response || data.message || 'Respuesta recibida del asistente',
        timestamp: new Date()
      }

      setMensajes(prev => [...prev, respuestaAsistente])
      
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error)
      toast.error('Error al enviar mensaje al chatbot')
      
      const respuestaFallback: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }
      
      setMensajes(prev => [...prev, respuestaFallback])
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <PhotoIcon className="w-5 h-5" />
    if (tipo === 'application/pdf') return <DocumentIcon className="w-5 h-5" />
    if (tipo.startsWith('audio/')) return <SpeakerWaveIcon className="w-5 h-5" />
    return <DocumentIcon className="w-5 h-5" />
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-br from-primario-500 via-primario-600 to-primario-700 px-6 py-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Dr. VetAI</h2>
              <p className="text-primario-100 text-sm font-medium">Asistente Médico Veterinario Especializado</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-white text-sm font-medium">En línea</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-lg xl:max-w-xl ${
              mensaje.tipo === 'usuario' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                mensaje.tipo === 'usuario' 
                  ? 'bg-gradient-to-br from-primario-500 to-primario-600' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}>
                {mensaje.tipo === 'usuario' ? (
                  <span className="text-white text-sm font-bold">U</span>
                ) : (
                  <span className="text-primario-600 text-sm font-bold">AI</span>
                )}
              </div>
              
              <div className={`px-5 py-4 rounded-2xl shadow-sm ${
                mensaje.tipo === 'usuario'
                  ? 'bg-gradient-to-br from-primario-500 to-primario-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{mensaje.contenido}</p>
                
                {/* Mostrar archivos adjuntos */}
                {mensaje.archivos && mensaje.archivos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {mensaje.archivos.map((archivo) => (
                      <div key={archivo.id} className={`flex items-center space-x-3 rounded-xl p-3 ${
                        mensaje.tipo === 'usuario' 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : 'bg-gray-50'
                      }`}>
                        <div className={`p-2 rounded-lg ${
                          mensaje.tipo === 'usuario' ? 'bg-white/30' : 'bg-primario-50'
                        }`}>
                          {getFileIcon(archivo.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{archivo.nombre}</p>
                          <p className="text-xs opacity-75">{formatFileSize(archivo.tamaño)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className={`text-xs mt-2 font-medium ${
                  mensaje.tipo === 'usuario' ? 'text-primario-100' : 'text-gray-500'
                }`}>
                  {mensaje.timestamp.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {enviando && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                <span className="text-primario-600 text-sm font-bold">AI</span>
              </div>
              <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primario-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primario-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primario-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Dr. VetAI está escribiendo...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={mensajesEndRef} />
      </div>

      {/* Área de archivos adjuntos */}
      {archivosAdjuntos.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <PaperClipIcon className="w-4 h-4" />
              <span>Archivos adjuntos ({archivosAdjuntos.length})</span>
            </span>
            <button
              onClick={() => setArchivosAdjuntos([])}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {archivosAdjuntos.map((archivo) => (
              <div key={archivo.id} className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2 bg-primario-50 rounded-lg">
                  {getFileIcon(archivo.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">{archivo.nombre}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(archivo.tamaño)}</p>
                </div>
                <button
                  onClick={() => eliminarArchivo(archivo.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de input */}
      <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
        {/* Botones de acción */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMostrarAdjuntos(!mostrarAdjuntos)}
              className="p-3 text-gray-500 hover:text-primario-600 hover:bg-primario-50 rounded-xl transition-all duration-200 hover:scale-105"
              title="Adjuntar archivos"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={grabando ? detenerGrabacion : iniciarGrabacion}
              disabled={true}
              className={`p-3 rounded-xl transition-all duration-200 opacity-50 cursor-not-allowed ${
                grabando 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-gray-500 hover:text-primario-600 hover:bg-primario-50'
              }`}
              title="🚧 Grabación de audio en construcción"
            >
              {grabando ? (
                <StopSolidIcon className="w-5 h-5" />
              ) : (
                <MicrophoneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-500 font-medium">
            {grabando && '🎤 Grabando...'}
          </div>
        </div>

        {/* Área de dropzone para archivos */}
        {mostrarAdjuntos && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
              isDragActive 
                ? 'border-primario-400 bg-primario-50 scale-105' 
                : 'border-gray-300 hover:border-primario-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <div className="text-center">
              <div className="w-16 h-16 bg-primario-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CloudArrowUpIcon className="w-8 h-8 text-primario-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragActive 
                  ? '¡Suelta los archivos aquí! 🎯' 
                  : 'Arrastra archivos aquí o haz clic para seleccionar'
                }
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF, DOC, TXT (máx. 10MB)
              </p>
            </div>
          </div>
        )}

        {/* Input de mensaje */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={mensajeActual}
              onChange={(e) => setMensajeActual(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta veterinaria..."
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primario-500 focus:border-transparent resize-none shadow-sm transition-all duration-200 focus:shadow-md"
              disabled={enviando}
            />
          </div>
          <button
            onClick={enviarMensaje}
            disabled={(!mensajeActual.trim() && archivosAdjuntos.length === 0) || enviando}
            className="px-8 py-4 bg-gradient-to-r from-primario-500 to-primario-600 text-white rounded-2xl hover:from-primario-600 hover:to-primario-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

