"""
Controlador de archivos
Maneja la subida y gestión de archivos
"""

from typing import Dict, Any
from fastapi import UploadFile
import logging
import os
import uuid
from datetime import datetime

from servicios.archivos_servicio import ArchivosServicio
from utilidades.validadores import ValidadorArchivo

logger = logging.getLogger(__name__)

class ArchivosControlador:
    """Controlador para manejo de archivos"""
    
    def __init__(self):
        self.servicio_archivos = ArchivosServicio()
        self.validador = ValidadorArchivo()
    
    async def subir_archivo(self, archivo: UploadFile) -> Dict[str, Any]:
        """
        Sube un archivo al servidor
        
        Args:
            archivo: Archivo a subir
            
        Returns:
            Dict con el resultado de la subida
        """
        try:
            logger.info(f"Subiendo archivo: {archivo.filename}")
            
            # Validar archivo
            if not self.validador.validar_archivo(archivo):
                return {
                    "exito": False,
                    "error": "Archivo inválido",
                    "mensaje": "El archivo no cumple con los requisitos"
                }
            
            # Generar ID único para el archivo
            archivo_id = str(uuid.uuid4())
            
            # Subir archivo
            resultado = await self.servicio_archivos.subir_archivo(
                archivo, archivo_id
            )
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al subir archivo",
                    "mensaje": resultado["error"]
                }
            
            # Crear metadatos del archivo
            metadatos = {
                "id": archivo_id,
                "nombre_original": archivo.filename,
                "tipo_mime": archivo.content_type,
                "tamano": resultado["tamano"],
                "ruta": resultado["ruta"],
                "fecha_subida": datetime.now().isoformat(),
                "url": f"/api/archivos/{archivo_id}"
            }
            
            logger.info(f"Archivo subido exitosamente: {archivo_id}")
            
            return {
                "exito": True,
                "datos": metadatos,
                "mensaje": "Archivo subido exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al subir archivo: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def obtener_archivo(self, archivo_id: str) -> Dict[str, Any]:
        """
        Obtiene un archivo por ID
        
        Args:
            archivo_id: ID del archivo
            
        Returns:
            Dict con la información del archivo
        """
        try:
            logger.info(f"Obteniendo archivo: {archivo_id}")
            
            if not self.validador.validar_id(archivo_id):
                return {
                    "exito": False,
                    "error": "ID inválido",
                    "mensaje": "El ID del archivo no es válido"
                }
            
            resultado = await self.servicio_archivos.obtener_archivo(archivo_id)
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al obtener archivo",
                    "mensaje": resultado["error"]
                }
            
            return {
                "exito": True,
                "datos": resultado["datos"],
                "mensaje": "Archivo obtenido exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al obtener archivo {archivo_id}: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def eliminar_archivo(self, archivo_id: str) -> Dict[str, Any]:
        """
        Elimina un archivo
        
        Args:
            archivo_id: ID del archivo
            
        Returns:
            Dict con el resultado de la eliminación
        """
        try:
            logger.info(f"Eliminando archivo: {archivo_id}")
            
            if not self.validador.validar_id(archivo_id):
                return {
                    "exito": False,
                    "error": "ID inválido",
                    "mensaje": "El ID del archivo no es válido"
                }
            
            resultado = await self.servicio_archivos.eliminar_archivo(archivo_id)
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al eliminar archivo",
                    "mensaje": resultado["error"]
                }
            
            return {
                "exito": True,
                "mensaje": "Archivo eliminado exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al eliminar archivo {archivo_id}: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def listar_archivos(self, limite: int = 50) -> Dict[str, Any]:
        """
        Lista archivos disponibles
        
        Args:
            limite: Cantidad máxima de archivos a listar
            
        Returns:
            Dict con la lista de archivos
        """
        try:
            logger.info("Listando archivos")
            
            resultado = await self.servicio_archivos.listar_archivos(limite)
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al listar archivos",
                    "mensaje": resultado["error"]
                }
            
            return {
                "exito": True,
                "datos": resultado["datos"],
                "mensaje": f"Se encontraron {len(resultado['datos'])} archivos"
            }
            
        except Exception as e:
            logger.error(f"Error al listar archivos: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def obtener_estadisticas_archivos(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas de archivos
        
        Returns:
            Dict con las estadísticas
        """
        try:
            logger.info("Obteniendo estadísticas de archivos")
            
            resultado = await self.servicio_archivos.obtener_estadisticas()
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al obtener estadísticas",
                    "mensaje": resultado["error"]
                }
            
            return {
                "exito": True,
                "datos": resultado["datos"],
                "mensaje": "Estadísticas obtenidas exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
