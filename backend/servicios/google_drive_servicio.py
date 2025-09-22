"""
Servicio de Google Drive
Implementa la integración con Google Drive API
"""

from typing import Dict, Any, Optional
import logging
import os
import io
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import pickle

logger = logging.getLogger(__name__)

class GoogleDriveServicio:
    """Servicio para integración con Google Drive"""
    
    # Scopes necesarios para Google Drive
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    
    def __init__(self):
        self.credenciales = None
        self.servicio = None
        self.folder_id = os.getenv('GOOGLE_DRIVE_FOLDER_ID')
        self._inicializar_servicio()
    
    def _inicializar_servicio(self):
        """Inicializa el servicio de Google Drive"""
        try:
            # Intentar cargar credenciales desde variables de entorno
            client_id = os.getenv('GOOGLE_DRIVE_CLIENT_ID')
            client_secret = os.getenv('GOOGLE_DRIVE_CLIENT_SECRET')
            access_token = os.getenv('GOOGLE_DRIVE_ACCESS_TOKEN')
            refresh_token = os.getenv('GOOGLE_DRIVE_REFRESH_TOKEN')
            
            if client_id and client_secret and access_token and refresh_token:
                # Crear credenciales desde variables de entorno
                self.credenciales = Credentials(
                    token=access_token,
                    refresh_token=refresh_token,
                    token_uri='https://oauth2.googleapis.com/token',
                    client_id=client_id,
                    client_secret=client_secret
                )
                
                # Construir servicio
                self.servicio = build('drive', 'v3', credentials=self.credenciales)
                logger.info("Servicio de Google Drive inicializado desde variables de entorno")
            else:
                logger.warning("Variables de entorno de Google Drive no configuradas")
                self.servicio = None
                
        except Exception as e:
            logger.error(f"Error al inicializar Google Drive: {str(e)}")
            self.servicio = None
    
    async def subir_archivo(self, archivo_path: str, nombre_archivo: str, 
                          descripcion: str = "Documento veterinario") -> Dict[str, Any]:
        """
        Sube un archivo a Google Drive
        
        Args:
            archivo_path: Ruta del archivo local
            nombre_archivo: Nombre del archivo en Drive
            descripcion: Descripción del archivo
            
        Returns:
            Dict con el resultado de la subida
        """
        try:
            if not self.servicio:
                return {
                    "exito": False,
                    "error": "Google Drive no configurado",
                    "mensaje": "Las credenciales de Google Drive no están configuradas"
                }
            
            logger.info(f"Subiendo archivo a Google Drive: {nombre_archivo}")
            
            # Leer archivo
            with open(archivo_path, 'rb') as archivo:
                contenido = archivo.read()
            
            # Crear metadata del archivo
            metadata = {
                'name': nombre_archivo,
                'description': descripcion,
                'parents': [self.folder_id] if self.folder_id else None
            }
            
            # Crear media upload
            media = MediaIoBaseUpload(
                io.BytesIO(contenido),
                mimetype='application/pdf',
                resumable=True
            )
            
            # Subir archivo
            archivo_drive = self.servicio.files().create(
                body=metadata,
                media_body=media,
                fields='id,name,webViewLink,webContentLink'
            ).execute()
            
            logger.info(f"Archivo subido exitosamente a Google Drive: {archivo_drive['id']}")
            
            return {
                "exito": True,
                "datos": {
                    "id": archivo_drive['id'],
                    "nombre": archivo_drive['name'],
                    "url": archivo_drive['webViewLink'],
                    "url_descarga": archivo_drive['webContentLink'],
                    "tamano": len(contenido)
                },
                "mensaje": "Archivo subido exitosamente a Google Drive"
            }
            
        except Exception as e:
            logger.error(f"Error al subir archivo a Google Drive: {str(e)}")
            return {
                "exito": False,
                "error": "Error de subida",
                "mensaje": f"Error al subir archivo a Google Drive: {str(e)}"
            }
    
    async def subir_archivo_directo(self, archivo, descripcion: str = "Documento veterinario") -> Dict[str, Any]:
        """
        Sube un archivo directamente a Google Drive desde un objeto UploadFile
        
        Args:
            archivo: Objeto UploadFile de FastAPI
            descripcion: Descripción del archivo
            
        Returns:
            Dict con el resultado de la subida
        """
        try:
            if not self.servicio:
                return {
                    "exito": False,
                    "error": "Google Drive no configurado"
                }
            
            logger.info(f"Subiendo archivo directo: {archivo.filename}")
            
            # Leer contenido del archivo
            contenido = await archivo.read()
            await archivo.seek(0)  # Resetear posición para futuras lecturas
            
            # Crear metadata
            metadata = {
                'name': archivo.filename,
                'description': descripcion,
                'parents': [self.folder_id] if self.folder_id else []
            }
            
            # Crear media
            media = MediaIoBaseUpload(
                io.BytesIO(contenido),
                mimetype=archivo.content_type or 'application/pdf',
                resumable=True
            )
            
            # Subir archivo
            archivo_drive = self.servicio.files().create(
                body=metadata,
                media_body=media,
                fields='id,name,webViewLink,webContentLink'
            ).execute()
            
            logger.info(f"Archivo subido exitosamente a Google Drive: {archivo_drive['id']}")
            
            return {
                "exito": True,
                "datos": {
                    "id": archivo_drive['id'],
                    "nombre": archivo_drive['name'],
                    "url": archivo_drive['webViewLink'],
                    "url_descarga": archivo_drive['webContentLink'],
                    "tamano": len(contenido)
                },
                "mensaje": "Archivo subido exitosamente a Google Drive"
            }
            
        except Exception as e:
            logger.error(f"Error al subir archivo directo a Google Drive: {str(e)}")
            return {
                "exito": False,
                "error": "Error de subida",
                "mensaje": f"Error al subir archivo directo a Google Drive: {str(e)}"
            }
    
    async def crear_carpeta(self, nombre_carpeta: str, 
                          descripcion: str = "Carpeta de documentos veterinarios") -> Dict[str, Any]:
        """
        Crea una carpeta en Google Drive
        
        Args:
            nombre_carpeta: Nombre de la carpeta
            descripcion: Descripción de la carpeta
            
        Returns:
            Dict con el resultado de la creación
        """
        try:
            if not self.servicio:
                return {
                    "exito": False,
                    "error": "Google Drive no configurado"
                }
            
            logger.info(f"Creando carpeta en Google Drive: {nombre_carpeta}")
            
            # Crear metadata de la carpeta
            metadata = {
                'name': nombre_carpeta,
                'description': descripcion,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [self.folder_id] if self.folder_id else None
            }
            
            # Crear carpeta
            carpeta = self.servicio.files().create(
                body=metadata,
                fields='id,name,webViewLink'
            ).execute()
            
            logger.info(f"Carpeta creada exitosamente: {carpeta['id']}")
            
            return {
                "exito": True,
                "datos": {
                    "id": carpeta['id'],
                    "nombre": carpeta['name'],
                    "url": carpeta['webViewLink']
                },
                "mensaje": "Carpeta creada exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al crear carpeta: {str(e)}")
            return {
                "exito": False,
                "error": "Error de creación",
                "mensaje": f"Error al crear carpeta: {str(e)}"
            }
    
    async def listar_archivos(self, limite: int = 50) -> Dict[str, Any]:
        """
        Lista archivos en Google Drive
        
        Args:
            limite: Cantidad máxima de archivos
            
        Returns:
            Dict con la lista de archivos
        """
        try:
            if not self.servicio:
                return {
                    "exito": False,
                    "error": "Google Drive no configurado"
                }
            
            logger.info("Listando archivos de Google Drive")
            
            # Construir query
            query = f"'{self.folder_id}' in parents" if self.folder_id else None
            
            # Obtener archivos
            resultados = self.servicio.files().list(
                q=query,
                pageSize=limite,
                fields="nextPageToken, files(id, name, size, createdTime, webViewLink)"
            ).execute()
            
            archivos = resultados.get('files', [])
            
            # Formatear datos
            archivos_formateados = []
            for archivo in archivos:
                archivos_formateados.append({
                    "id": archivo['id'],
                    "nombre": archivo['name'],
                    "tamano": int(archivo.get('size', 0)),
                    "fecha_creacion": archivo['createdTime'],
                    "url": archivo['webViewLink']
                })
            
            return {
                "exito": True,
                "datos": archivos_formateados,
                "mensaje": f"Se encontraron {len(archivos_formateados)} archivos"
            }
            
        except Exception as e:
            logger.error(f"Error al listar archivos: {str(e)}")
            return {
                "exito": False,
                "error": "Error de listado",
                "mensaje": f"Error al listar archivos: {str(e)}"
            }
    
    async def eliminar_archivo(self, archivo_id: str) -> Dict[str, Any]:
        """
        Elimina un archivo de Google Drive
        
        Args:
            archivo_id: ID del archivo a eliminar
            
        Returns:
            Dict con el resultado de la eliminación
        """
        try:
            if not self.servicio:
                return {
                    "exito": False,
                    "error": "Google Drive no configurado"
                }
            
            logger.info(f"Eliminando archivo de Google Drive: {archivo_id}")
            
            # Eliminar archivo
            self.servicio.files().delete(fileId=archivo_id).execute()
            
            logger.info(f"Archivo eliminado exitosamente: {archivo_id}")
            
            return {
                "exito": True,
                "mensaje": "Archivo eliminado exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al eliminar archivo: {str(e)}")
            return {
                "exito": False,
                "error": "Error de eliminación",
                "mensaje": f"Error al eliminar archivo: {str(e)}"
            }
    
    async def verificar_conexion(self) -> Dict[str, Any]:
        """
        Verifica la conexión con Google Drive
        
        Returns:
            Dict con el estado de la conexión
        """
        try:
            if not self.servicio:
                return {
                    "exito": False,
                    "error": "Google Drive no configurado",
                    "mensaje": "Las credenciales de Google Drive no están configuradas"
                }
            
            # Intentar obtener información del usuario
            about = self.servicio.about().get(fields='user').execute()
            usuario = about.get('user', {})
            
            return {
                "exito": True,
                "datos": {
                    "usuario": usuario.get('displayName', 'Usuario'),
                    "email": usuario.get('emailAddress', ''),
                    "folder_id": self.folder_id
                },
                "mensaje": "Conexión con Google Drive exitosa"
            }
            
        except Exception as e:
            logger.error(f"Error al verificar conexión con Google Drive: {str(e)}")
            return {
                "exito": False,
                "error": "Error de conexión",
                "mensaje": f"Error al verificar conexión: {str(e)}"
            }
