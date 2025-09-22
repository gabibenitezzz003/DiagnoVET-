"""
Servicio de archivos
Implementa la lógica de gestión de archivos
"""

from typing import Dict, Any, List
import logging
import os
import uuid
import shutil
from datetime import datetime
from fastapi import UploadFile

logger = logging.getLogger(__name__)

class ArchivosServicio:
    """Servicio para gestión de archivos"""
    
    def __init__(self):
        self.directorio_uploads = "uploads"
        self.tamano_maximo = 10 * 1024 * 1024  # 10MB
        self.tipos_permitidos = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif'
        ]
        
        # Crear directorio de uploads si no existe
        os.makedirs(self.directorio_uploads, exist_ok=True)
    
    async def subir_archivo(self, archivo: UploadFile, archivo_id: str) -> Dict[str, Any]:
        """
        Sube un archivo al servidor
        
        Args:
            archivo: Archivo a subir
            archivo_id: ID único del archivo
            
        Returns:
            Dict con el resultado de la subida
        """
        try:
            logger.info(f"Subiendo archivo: {archivo.filename}")
            
            # Validar archivo
            if not self._validar_archivo(archivo):
                return {
                    "exito": False,
                    "error": "Archivo no válido"
                }
            
            # Generar nombre de archivo único
            extension = os.path.splitext(archivo.filename)[1]
            nombre_archivo = f"{archivo_id}{extension}"
            ruta_archivo = os.path.join(self.directorio_uploads, nombre_archivo)
            
            # Guardar archivo
            with open(ruta_archivo, "wb") as buffer:
                contenido = await archivo.read()
                buffer.write(contenido)
            
            logger.info(f"Archivo subido exitosamente: {ruta_archivo}")
            
            return {
                "exito": True,
                "ruta": ruta_archivo,
                "tamano": len(contenido),
                "mensaje": "Archivo subido exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al subir archivo: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al subir archivo: {str(e)}"
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
            
            # Buscar archivo en el directorio
            for archivo in os.listdir(self.directorio_uploads):
                if archivo.startswith(archivo_id):
                    ruta_archivo = os.path.join(self.directorio_uploads, archivo)
                    tamano = os.path.getsize(ruta_archivo)
                    fecha_modificacion = datetime.fromtimestamp(
                        os.path.getmtime(ruta_archivo)
                    )
                    
                    return {
                        "exito": True,
                        "datos": {
                            "id": archivo_id,
                            "nombre": archivo,
                            "ruta": ruta_archivo,
                            "tamano": tamano,
                            "fecha_modificacion": fecha_modificacion.isoformat(),
                            "url": f"/api/archivos/{archivo_id}"
                        }
                    }
            
            return {
                "exito": False,
                "error": "Archivo no encontrado"
            }
            
        except Exception as e:
            logger.error(f"Error al obtener archivo {archivo_id}: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al obtener archivo: {str(e)}"
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
            
            # Buscar y eliminar archivo
            for archivo in os.listdir(self.directorio_uploads):
                if archivo.startswith(archivo_id):
                    ruta_archivo = os.path.join(self.directorio_uploads, archivo)
                    os.remove(ruta_archivo)
                    
                    logger.info(f"Archivo eliminado: {ruta_archivo}")
                    return {
                        "exito": True,
                        "mensaje": "Archivo eliminado exitosamente"
                    }
            
            return {
                "exito": False,
                "error": "Archivo no encontrado"
            }
            
        except Exception as e:
            logger.error(f"Error al eliminar archivo {archivo_id}: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al eliminar archivo: {str(e)}"
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
            
            archivos = []
            for archivo in os.listdir(self.directorio_uploads):
                ruta_archivo = os.path.join(self.directorio_uploads, archivo)
                if os.path.isfile(ruta_archivo):
                    tamano = os.path.getsize(ruta_archivo)
                    fecha_modificacion = datetime.fromtimestamp(
                        os.path.getmtime(ruta_archivo)
                    )
                    
                    # Extraer ID del nombre del archivo
                    archivo_id = archivo.split('.')[0]
                    
                    archivos.append({
                        "id": archivo_id,
                        "nombre": archivo,
                        "tamano": tamano,
                        "fecha_modificacion": fecha_modificacion.isoformat(),
                        "url": f"/api/archivos/{archivo_id}"
                    })
            
            # Ordenar por fecha de modificación descendente
            archivos.sort(key=lambda x: x["fecha_modificacion"], reverse=True)
            
            # Limitar resultados
            archivos = archivos[:limite]
            
            return {
                "exito": True,
                "datos": archivos
            }
            
        except Exception as e:
            logger.error(f"Error al listar archivos: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al listar archivos: {str(e)}"
            }
    
    async def obtener_estadisticas(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas de archivos
        
        Returns:
            Dict con las estadísticas
        """
        try:
            logger.info("Obteniendo estadísticas de archivos")
            
            archivos = os.listdir(self.directorio_uploads)
            archivos_archivos = [f for f in archivos if os.path.isfile(
                os.path.join(self.directorio_uploads, f)
            )]
            
            tamano_total = sum(
                os.path.getsize(os.path.join(self.directorio_uploads, f))
                for f in archivos_archivos
            )
            
            # Contar por tipo
            tipos_archivo = {}
            for archivo in archivos_archivos:
                extension = os.path.splitext(archivo)[1].lower()
                tipos_archivo[extension] = tipos_archivo.get(extension, 0) + 1
            
            estadisticas = {
                "total_archivos": len(archivos_archivos),
                "tamano_total": tamano_total,
                "tamano_total_mb": round(tamano_total / (1024 * 1024), 2),
                "tipos_archivo": tipos_archivo,
                "directorio": self.directorio_uploads
            }
            
            return {
                "exito": True,
                "datos": estadisticas
            }
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al obtener estadísticas: {str(e)}"
            }
    
    def _validar_archivo(self, archivo: UploadFile) -> bool:
        """
        Valida un archivo subido
        
        Args:
            archivo: Archivo a validar
            
        Returns:
            True si es válido, False en caso contrario
        """
        if not archivo:
            return False
        
        # Validar tipo de archivo
        if archivo.content_type not in self.tipos_permitidos:
            return False
        
        # Validar tamaño
        if hasattr(archivo, 'size') and archivo.size > self.tamano_maximo:
            return False
        
        return True
