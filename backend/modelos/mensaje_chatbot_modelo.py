"""
Modelo de mensaje de chatbot
Implementa la lógica de negocio para mensajes
"""

from typing import Dict, Any
from datetime import datetime
import uuid

class MensajeChatbotModelo:
    """Modelo para mensajes de chatbot"""
    
    def __init__(
        self,
        id: str,
        contenido: str,
        tipo: str,
        timestamp: datetime,
        session_id: str
    ):
        self.id = id
        self.contenido = contenido
        self.tipo = tipo
        self.timestamp = timestamp
        self.session_id = session_id
    
    @classmethod
    def crear_mensaje_usuario(cls, contenido: str, session_id: str) -> 'MensajeChatbotModelo':
        """
        Crea un mensaje de usuario
        
        Args:
            contenido: Contenido del mensaje
            session_id: ID de la sesión
            
        Returns:
            Instancia de MensajeChatbotModelo
        """
        return cls(
            id=str(uuid.uuid4()),
            contenido=contenido,
            tipo='usuario',
            timestamp=datetime.now(),
            session_id=session_id
        )
    
    @classmethod
    def crear_mensaje_asistente(cls, contenido: str, session_id: str) -> 'MensajeChatbotModelo':
        """
        Crea un mensaje de asistente
        
        Args:
            contenido: Contenido del mensaje
            session_id: ID de la sesión
            
        Returns:
            Instancia de MensajeChatbotModelo
        """
        return cls(
            id=str(uuid.uuid4()),
            contenido=contenido,
            tipo='asistente',
            timestamp=datetime.now(),
            session_id=session_id
        )
    
    @classmethod
    def crear_desde_datos(cls, datos: Dict[str, Any]) -> 'MensajeChatbotModelo':
        """
        Crea un mensaje desde datos
        
        Args:
            datos: Datos del mensaje
            
        Returns:
            Instancia de MensajeChatbotModelo
        """
        return cls(
            id=datos['id'],
            contenido=datos['contenido'],
            tipo=datos['tipo'],
            timestamp=datetime.fromisoformat(datos['timestamp']),
            session_id=datos['session_id']
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convierte el modelo a diccionario
        
        Returns:
            Dict con los datos del mensaje
        """
        return {
            'id': self.id,
            'contenido': self.contenido,
            'tipo': self.tipo,
            'timestamp': self.timestamp.isoformat(),
            'session_id': self.session_id
        }
    
    def es_valido(self) -> bool:
        """
        Valida si el mensaje es válido
        
        Returns:
            True si es válido, False en caso contrario
        """
        if not self.id or not self.contenido or not self.tipo or not self.session_id:
            return False
        
        if self.tipo not in ['usuario', 'asistente']:
            return False
        
        if len(self.contenido.strip()) == 0:
            return False
        
        return True
    
    def obtener_resumen(self) -> Dict[str, Any]:
        """
        Obtiene un resumen del mensaje
        
        Returns:
            Dict con el resumen
        """
        return {
            'id': self.id,
            'tipo': self.tipo,
            'contenido_preview': self.contenido[:100] + '...' if len(self.contenido) > 100 else self.contenido,
            'timestamp': self.timestamp.isoformat(),
            'session_id': self.session_id
        }
    
    def __str__(self) -> str:
        """Representación string del mensaje"""
        return f"MensajeChatbotModelo(id={self.id}, tipo={self.tipo}, session={self.session_id})"
    
    def __repr__(self) -> str:
        """Representación detallada del mensaje"""
        return self.__str__()
