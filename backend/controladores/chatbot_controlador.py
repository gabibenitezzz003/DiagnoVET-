"""
Controlador de chatbot
Maneja la comunicación con el workflow de n8n
"""

from typing import Dict, Any, List
import logging
import json
from datetime import datetime

from servicios.chatbot_servicio import ChatbotServicio
from modelos.mensaje_chatbot_modelo import MensajeChatbotModelo
from utilidades.validadores import ValidadorChatbot

logger = logging.getLogger(__name__)

class ChatbotControlador:
    """Controlador para manejo del chatbot"""
    
    def __init__(self):
        self.servicio_chatbot = ChatbotServicio()
        self.validador = ValidadorChatbot()
    
    async def enviar_mensaje(self, datos_mensaje: Dict[str, Any]) -> Dict[str, Any]:
        """
        Envía un mensaje al chatbot
        
        Args:
            datos_mensaje: Datos del mensaje a enviar
            
        Returns:
            Dict con la respuesta del chatbot
        """
        try:
            logger.info("Enviando mensaje al chatbot")
            
            # Validar datos del mensaje
            if not self.validador.validar_datos_mensaje(datos_mensaje):
                return {
                    "exito": False,
                    "error": "Datos inválidos",
                    "mensaje": "Los datos del mensaje no son válidos"
                }
            
            # Extraer datos del mensaje
            contenido = datos_mensaje.get("contenido", "")
            session_id = datos_mensaje.get("sessionId", "default")
            historial = datos_mensaje.get("historial", [])
            
            # Crear modelo de mensaje
            mensaje_usuario = MensajeChatbotModelo.crear_mensaje_usuario(
                contenido, session_id
            )
            
            # Enviar mensaje al chatbot
            resultado = await self.servicio_chatbot.enviar_mensaje(
                contenido, session_id, historial
            )
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error del chatbot",
                    "mensaje": resultado["error"]
                }
            
            # Crear modelo de respuesta
            mensaje_respuesta = MensajeChatbotModelo.crear_mensaje_asistente(
                resultado["datos"], session_id
            )
            
            # Procesar respuesta
            respuesta_procesada = self.servicio_chatbot.procesar_respuesta(
                resultado["datos"]
            )
            
            logger.info("Mensaje enviado exitosamente al chatbot")
            
            return {
                "exito": True,
                "datos": {
                    "mensaje_usuario": mensaje_usuario.to_dict(),
                    "mensaje_respuesta": mensaje_respuesta.to_dict(),
                    "respuesta_procesada": respuesta_procesada,
                    "timestamp": datetime.now().isoformat()
                },
                "mensaje": "Mensaje enviado exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al enviar mensaje al chatbot: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def obtener_sugerencias(self) -> Dict[str, Any]:
        """
        Obtiene sugerencias de preguntas para el chatbot
        
        Returns:
            Dict con las sugerencias
        """
        try:
            logger.info("Obteniendo sugerencias del chatbot")
            
            resultado = await self.servicio_chatbot.obtener_sugerencias()
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al obtener sugerencias",
                    "mensaje": resultado["error"]
                }
            
            return {
                "exito": True,
                "datos": resultado["datos"],
                "mensaje": "Sugerencias obtenidas exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al obtener sugerencias: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def verificar_estado(self) -> Dict[str, Any]:
        """
        Verifica el estado del chatbot
        
        Returns:
            Dict con el estado del chatbot
        """
        try:
            logger.info("Verificando estado del chatbot")
            
            resultado = await self.servicio_chatbot.verificar_disponibilidad()
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al verificar estado",
                    "mensaje": resultado["error"]
                }
            
            estado = {
                "disponible": resultado["datos"],
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0"
            }
            
            return {
                "exito": True,
                "datos": estado,
                "mensaje": "Estado verificado exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al verificar estado del chatbot: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def obtener_historial(self, session_id: str) -> Dict[str, Any]:
        """
        Obtiene el historial de mensajes de una sesión
        
        Args:
            session_id: ID de la sesión
            
        Returns:
            Dict con el historial de mensajes
        """
        try:
            logger.info(f"Obteniendo historial para sesión: {session_id}")
            
            if not self.validador.validar_session_id(session_id):
                return {
                    "exito": False,
                    "error": "Session ID inválido",
                    "mensaje": "El ID de sesión no es válido"
                }
            
            resultado = await self.servicio_chatbot.obtener_historial(session_id)
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al obtener historial",
                    "mensaje": resultado["error"]
                }
            
            # Convertir mensajes a diccionarios
            mensajes_dict = [mensaje.to_dict() for mensaje in resultado["datos"]]
            
            return {
                "exito": True,
                "datos": mensajes_dict,
                "mensaje": f"Historial obtenido para sesión {session_id}"
            }
            
        except Exception as e:
            logger.error(f"Error al obtener historial {session_id}: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def limpiar_historial(self, session_id: str) -> Dict[str, Any]:
        """
        Limpia el historial de mensajes de una sesión
        
        Args:
            session_id: ID de la sesión
            
        Returns:
            Dict con el resultado de la limpieza
        """
        try:
            logger.info(f"Limpiando historial para sesión: {session_id}")
            
            if not self.validador.validar_session_id(session_id):
                return {
                    "exito": False,
                    "error": "Session ID inválido",
                    "mensaje": "El ID de sesión no es válido"
                }
            
            resultado = await self.servicio_chatbot.limpiar_historial(session_id)
            
            if not resultado["exito"]:
                return {
                    "exito": False,
                    "error": "Error al limpiar historial",
                    "mensaje": resultado["error"]
                }
            
            return {
                "exito": True,
                "mensaje": f"Historial limpiado para sesión {session_id}"
            }
            
        except Exception as e:
            logger.error(f"Error al limpiar historial {session_id}: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
