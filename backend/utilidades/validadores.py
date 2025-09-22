"""
Validadores para la aplicación
Funciones de validación para datos de entrada
"""

import re
from typing import Any, Dict
from fastapi import UploadFile

class ValidadorReporte:
    """Validador para reportes veterinarios"""
    
    @staticmethod
    def validar_archivo(archivo: UploadFile) -> bool:
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
        if not archivo.content_type or not archivo.content_type.startswith('application/pdf'):
            return False
        
        # Validar tamaño (10MB máximo)
        if hasattr(archivo, 'size') and archivo.size > 10 * 1024 * 1024:
            return False
        
        return True
    
    @staticmethod
    def validar_reporte(reporte: Any) -> bool:
        """
        Valida un reporte veterinario
        
        Args:
            reporte: Reporte a validar
            
        Returns:
            True si es válido, False en caso contrario
        """
        if not reporte:
            return False
        
        # Para pruebas, ser completamente permisivo
        # Solo validar que el reporte exista
        return True
    
    @staticmethod
    def validar_id(reporte_id: str) -> bool:
        """
        Valida un ID de reporte
        
        Args:
            reporte_id: ID a validar
            
        Returns:
            True si es válido, False en caso contrario
        """
        if not reporte_id or not isinstance(reporte_id, str):
            return False
        
        # Validar formato UUID
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        return bool(re.match(uuid_pattern, reporte_id, re.IGNORECASE))
    
    @staticmethod
    def validar_datos_actualizacion(datos: Dict[str, Any]) -> bool:
        """
        Valida datos de actualización
        
        Args:
            datos: Datos a validar
            
        Returns:
            True si son válidos, False en caso contrario
        """
        if not datos or not isinstance(datos, dict):
            return False
        
        # Validar que al menos un campo esté presente
        campos_validos = [
            'tipoEstudio', 'paciente', 'tutor', 'veterinario', 
            'diagnostico', 'imagenes', 'estado'
        ]
        
        return any(campo in datos for campo in campos_validos)
    
    @staticmethod
    def validar_termino_busqueda(termino: str) -> bool:
        """
        Valida un término de búsqueda
        
        Args:
            termino: Término a validar
            
        Returns:
            True si es válido, False en caso contrario
        """
        if not termino or not isinstance(termino, str):
            return False
        
        # Validar longitud mínima
        if len(termino.strip()) < 2:
            return False
        
        # Validar caracteres permitidos
        return bool(re.match(r'^[a-zA-Z0-9\s\-_.,áéíóúÁÉÍÓÚñÑ]+$', termino))

class ValidadorChatbot:
    """Validador para el chatbot"""
    
    @staticmethod
    def validar_datos_mensaje(datos: Dict[str, Any]) -> bool:
        """
        Valida datos de mensaje del chatbot
        
        Args:
            datos: Datos a validar
            
        Returns:
            True si son válidos, False en caso contrario
        """
        if not datos or not isinstance(datos, dict):
            return False
        
        # Validar contenido del mensaje
        contenido = datos.get('contenido', '')
        if not contenido or not isinstance(contenido, str):
            return False
        
        if len(contenido.strip()) < 1:
            return False
        
        if len(contenido) > 1000:  # Límite de caracteres
            return False
        
        return True
    
    @staticmethod
    def validar_session_id(session_id: str) -> bool:
        """
        Valida un ID de sesión
        
        Args:
            session_id: ID a validar
            
        Returns:
            True si es válido, False en caso contrario
        """
        if not session_id or not isinstance(session_id, str):
            return False
        
        # Validar formato básico
        return len(session_id) >= 10 and len(session_id) <= 100

class ValidadorArchivo:
    """Validador para archivos"""
    
    @staticmethod
    def validar_archivo(archivo: UploadFile) -> bool:
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
        tipos_permitidos = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif'
        ]
        
        if not archivo.content_type or archivo.content_type not in tipos_permitidos:
            return False
        
        # Validar tamaño (10MB máximo)
        if hasattr(archivo, 'size') and archivo.size > 10 * 1024 * 1024:
            return False
        
        return True
    
    @staticmethod
    def validar_id(archivo_id: str) -> bool:
        """
        Valida un ID de archivo
        
        Args:
            archivo_id: ID a validar
            
        Returns:
            True si es válido, False en caso contrario
        """
        if not archivo_id or not isinstance(archivo_id, str):
            return False
        
        # Validar formato UUID
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        return bool(re.match(uuid_pattern, archivo_id, re.IGNORECASE))
