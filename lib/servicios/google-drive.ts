/**
 * Servicio para integración con Google Drive
 * Sube automáticamente los PDFs procesados a una carpeta específica
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

export class ServicioGoogleDrive {
  private accessToken: string
  private carpetaId: string
  private baseUrl = 'https://www.googleapis.com/drive/v3'

  constructor() {
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
    const paciente = metadata.paciente_nombre.replace(/[^a-zA-Z0-9]/g, '_')
    const tipo = metadata.tipo_estudio.replace(/[^a-zA-Z0-9]/g, '_')
    
    return `${fecha}_${paciente}_${tipo}.${extension}`
  }

  /**
   * Obtener información de un archivo
   */
  async obtenerInformacionArchivo(archivoId: string): Promise<RespuestaDrive> {
    if (!this.accessToken) {
      return {
        exito: false,
        error: 'Google Drive no configurado'
      }
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

      const archivo = await response.json()
      
      return {
        exito: true,
        archivo: {
          id: archivo.id,
          nombre: archivo.name,
          url: `https://drive.google.com/file/d/${archivo.id}/view`,
          carpeta_id: archivo.parents?.[0] || '',
          fecha_subida: archivo.createdTime
        }
      }

    } catch (error) {
      console.error('❌ Error al obtener información del archivo:', error)
      return {
        exito: false,
        error: `Error al obtener archivo: ${error}`
      }
    }
  }

  /**
   * Listar archivos en la carpeta
   */
  async listarArchivos(): Promise<{ exito: boolean; archivos?: ArchivoDrive[]; error?: string }> {
    if (!this.accessToken || !this.carpetaId) {
      return {
        exito: false,
        error: 'Google Drive no configurado'
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/files?q='${this.carpetaId}'+in+parents`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Error al listar archivos: ${response.statusText}`)
      }

      const data = await response.json()
      
      const archivos: ArchivoDrive[] = data.files.map((file: any) => ({
        id: file.id,
        nombre: file.name,
        url: `https://drive.google.com/file/d/${file.id}/view`,
        carpeta_id: this.carpetaId,
        fecha_subida: file.createdTime
      }))

      return {
        exito: true,
        archivos
      }

    } catch (error) {
      console.error('❌ Error al listar archivos:', error)
      return {
        exito: false,
        error: `Error al listar archivos: ${error}`
      }
    }
  }

  /**
   * Verificar conexión con Google Drive
   */
  async verificarConexion(): Promise<boolean> {
    if (!this.accessToken || !this.carpetaId) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/files/${this.carpetaId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      return response.ok
    } catch (error) {
      console.error('❌ Error al verificar conexión con Google Drive:', error)
      return false
    }
  }
}

// Instancia singleton
export const servicioGoogleDrive = new ServicioGoogleDrive()
