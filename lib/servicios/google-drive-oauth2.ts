/**
 * Servicio para integración con Google Drive usando OAuth2
 * Maneja la autenticación y subida de archivos
 */

interface ArchivoDrive {
  id: string
  nombre: string
  url: string
  carpeta_id: string
  fecha_subida: string
}

interface RespuestaDrive {
  exito: boolean
  archivo?: ArchivoDrive
  error?: string
}

interface CredencialesOAuth2 {
  client_id: string
  client_secret: string
  redirect_uris: string[]
  auth_uri: string
  token_uri: string
}

export class ServicioGoogleDriveOAuth2 {
  private credenciales: CredencialesOAuth2
  private accessToken: string
  private carpetaId: string
  private baseUrl = 'https://www.googleapis.com/drive/v3'

  constructor() {
    // Cargar credenciales desde variables de entorno
    this.credenciales = {
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || "",
      redirect_uris: [
        "http://localhost:3000",
        "http://localhost:56579",
        "http://localhost:8000",
        "http://localhost:61565",
        "http://localhost:8080",
        "http://127.0.0.1:61565/",
        "http://127.0.0.1:8080/",
        "http://127.0.0.1:63023/",
        "http://localhost:63023/",
        "http://localhost:63215/",
        "http://localhost:64414/"
      ],
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token"
    }

    this.accessToken = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ACCESS_TOKEN || ''
    this.carpetaId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || ''
    
    if (!this.accessToken) {
      console.warn('⚠️ GOOGLE_DRIVE_ACCESS_TOKEN no configurada')
    }
    if (!this.carpetaId) {
      console.warn('⚠️ GOOGLE_DRIVE_FOLDER_ID no configurada')
    }
  }

  /**
   * Generar URL de autorización OAuth2
   */
  generarUrlAutorizacion(): string {
    const params = new URLSearchParams({
      client_id: this.credenciales.client_id,
      redirect_uri: this.credenciales.redirect_uris[0],
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file',
      access_type: 'offline',
      prompt: 'consent'
    })

    return `${this.credenciales.auth_uri}?${params.toString()}`
  }

  /**
   * Intercambiar código de autorización por access token
   */
  async intercambiarCodigoPorToken(codigo: string): Promise<{ access_token: string, refresh_token: string }> {
    try {
      const response = await fetch(this.credenciales.token_uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.credenciales.client_id,
          client_secret: this.credenciales.client_secret,
          code: codigo,
          grant_type: 'authorization_code',
          redirect_uri: this.credenciales.redirect_uris[0]
        })
      })

      if (!response.ok) {
        throw new Error(`Error al obtener token: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }
    } catch (error) {
      console.error('❌ Error al intercambiar código por token:', error)
      throw error
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  async renovarAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(this.credenciales.token_uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.credenciales.client_id,
          client_secret: this.credenciales.client_secret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!response.ok) {
        throw new Error(`Error al renovar token: ${response.statusText}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('❌ Error al renovar access token:', error)
      throw error
    }
  }

  /**
   * Subir PDF a Google Drive
   */
  async subirPDF(
    archivo: File,
    metadata: {
      paciente_nombre: string
      veterinario_nombre: string
      tipo_estudio: string
      fecha_estudio: string
    }
  ): Promise<RespuestaDrive> {
    if (!this.accessToken || !this.carpetaId) {
      return {
        exito: false,
        error: 'Google Drive no configurado correctamente'
      }
    }

    try {
      console.log('🔄 Subiendo PDF a Google Drive...')
      console.log('📁 Archivo:', archivo.name)
      console.log('📋 Metadata:', metadata)

      // Crear nombre descriptivo para el archivo
      const nombreArchivo = this.generarNombreArchivo(archivo.name, metadata)
      
      // Crear metadatos del archivo
      const metadatosArchivo = {
        name: nombreArchivo,
        parents: [this.carpetaId],
        description: `Paciente: ${metadata.paciente_nombre} | Veterinario: ${metadata.veterinario_nombre} | Tipo: ${metadata.tipo_estudio} | Fecha: ${metadata.fecha_estudio}`
      }

      // Crear FormData para la subida
      const formData = new FormData()
      formData.append('metadata', JSON.stringify(metadatosArchivo))
      formData.append('file', archivo)

      // Subir archivo usando la API de Google Drive con OAuth2
      const response = await fetch(`${this.baseUrl}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error al subir archivo: ${errorData.error?.message || response.statusText}`)
      }

      const archivoSubido = await response.json()
      
      console.log('✅ PDF subido exitosamente a Google Drive')
      console.log('📁 ID del archivo:', archivoSubido.id)
      console.log('🔗 URL del archivo:', `https://drive.google.com/file/d/${archivoSubido.id}/view`)

      return {
        exito: true,
        archivo: {
          id: archivoSubido.id,
          nombre: nombreArchivo,
          url: `https://drive.google.com/file/d/${archivoSubido.id}/view`,
          carpeta_id: this.carpetaId,
          fecha_subida: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('❌ Error al subir PDF a Google Drive:', error)
      return {
        exito: false,
        error: `Error al subir archivo: ${error}`
      }
    }
  }

  /**
   * Generar nombre descriptivo para el archivo
   */
  private generarNombreArchivo(nombreOriginal: string, metadata: any): string {
    const fecha = new Date(metadata.fecha_estudio).toISOString().split('T')[0]
    const extension = nombreOriginal.split('.').pop()
    const nombreBase = nombreOriginal.split('.')[0]
    
    return `${fecha}_${metadata.paciente_nombre}_${metadata.tipo_estudio}_${nombreBase}.${extension}`
  }

  /**
   * Obtener información de un archivo
   */
  async obtenerInformacionArchivo(archivoId: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Access token no configurado')
    }

    try {
      const response = await fetch(`${this.baseUrl}/files/${archivoId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error al obtener archivo: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Error al obtener información del archivo:', error)
      throw error
    }
  }

  /**
   * Listar archivos en la carpeta
   */
  async listarArchivos(): Promise<any[]> {
    if (!this.accessToken || !this.carpetaId) {
      throw new Error('Google Drive no configurado correctamente')
    }

    try {
      const response = await fetch(`${this.baseUrl}/files?q='${this.carpetaId}'+in+parents&fields=files(id,name,createdTime,size)`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error al listar archivos: ${response.statusText}`)
      }

      const data = await response.json()
      return data.files || []
    } catch (error) {
      console.error('❌ Error al listar archivos:', error)
      throw error
    }
  }

  /**
   * Verificar conexión con Google Drive
   */
  async verificarConexion(): Promise<boolean> {
    if (!this.accessToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/about?fields=user`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      return response.ok
    } catch (error) {
      console.error('❌ Error al verificar conexión:', error)
      return false
    }
  }
}

// Instancia singleton
export const servicioGoogleDriveOAuth2 = new ServicioGoogleDriveOAuth2()
