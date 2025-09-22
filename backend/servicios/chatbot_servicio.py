"""
Servicio de chatbot
Implementa la lógica de comunicación con el workflow de n8n
"""

from typing import Dict, Any, List
import logging
import httpx
import json
from datetime import datetime

from modelos.mensaje_chatbot_modelo import MensajeChatbotModelo
from typing import List

logger = logging.getLogger(__name__)

class ChatbotServicio:
    """Servicio para comunicación con el chatbot"""
    
    def __init__(self):
        self.webhook_url = "https://tu-webhook-n8n.com/webhook/chatbot"
        self.timeout = 30
        self.max_reintentos = 3
    
    async def enviar_mensaje(
        self, 
        mensaje: str, 
        session_id: str, 
        historial: List[MensajeChatbotModelo] = None
    ) -> Dict[str, Any]:
        """
        Envía un mensaje al chatbot
        
        Args:
            mensaje: Contenido del mensaje
            session_id: ID de la sesión
            historial: Historial de mensajes
            
        Returns:
            Dict con la respuesta del chatbot
        """
        try:
            logger.info(f"Enviando mensaje al chatbot: {session_id}")
            
            if not self.webhook_url:
                return {
                    "exito": False,
                    "error": "URL del webhook no configurada"
                }
            
            # Preparar payload
            payload = {
                "chatInput": mensaje,
                "sessionId": session_id,
                "chatHistory": self._formatear_historial(historial or [])
            }
            
            # Enviar request
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code != 200:
                    return {
                        "exito": False,
                        "error": f"Error HTTP: {response.status_code}"
                    }
                
                data = response.json()
                
                if data.get("status") != "success":
                    return {
                        "exito": False,
                        "error": "El chatbot no pudo procesar la solicitud"
                    }
                
                logger.info("Mensaje enviado exitosamente al chatbot")
                
                return {
                    "exito": True,
                    "datos": data.get("response", "Sin respuesta del chatbot")
                }
                
        except httpx.TimeoutException:
            logger.error("Timeout al enviar mensaje al chatbot")
            return {
                "exito": False,
                "error": "Timeout: El chatbot tardó demasiado en responder"
            }
        except Exception as e:
            logger.error(f"Error al enviar mensaje al chatbot: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al comunicarse con el chatbot: {str(e)}"
            }
    
    async def obtener_sugerencias(self) -> Dict[str, Any]:
        """
        Obtiene sugerencias de preguntas para el chatbot
        
        Returns:
            Dict con las sugerencias
        """
        try:
            logger.info("Obteniendo sugerencias del chatbot")
            
            sugerencias = [
                "¿Cómo interpretar una radiografía de tórax?",
                "¿Cuáles son los valores normales de laboratorio en caninos?",
                "¿Cómo diagnosticar una insuficiencia renal en felinos?",
                "¿Qué protocolo seguir para una cirugía de esterilización?",
                "¿Cómo manejar un caso de intoxicación?",
                "¿Cuáles son las vacunas obligatorias por especie?",
                "¿Cómo interpretar un electrocardiograma?",
                "¿Qué hacer en caso de emergencia respiratoria?"
            ]
            
            return {
                "exito": True,
                "datos": sugerencias
            }
            
        except Exception as e:
            logger.error(f"Error al obtener sugerencias: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al obtener sugerencias: {str(e)}"
            }
    
    async def verificar_disponibilidad(self) -> Dict[str, Any]:
        """
        Verifica si el chatbot está disponible
        
        Returns:
            Dict con el estado del chatbot
        """
        try:
            logger.info("Verificando disponibilidad del chatbot")
            
            if not self.webhook_url:
                return {
                    "exito": False,
                    "error": "URL del webhook no configurada"
                }
            
            # En un entorno real, aquí se haría una petición HEAD o GET
            # Por ahora simulamos que está disponible
            return {
                "exito": True,
                "datos": True,
                "mensaje": "Chatbot disponible"
            }
            
        except Exception as e:
            logger.error(f"Error al verificar disponibilidad: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al verificar disponibilidad: {str(e)}"
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
            
            # En un entorno real, aquí se consultaría la base de datos
            # Por ahora devolvemos una lista vacía
            return {
                "exito": True,
                "datos": []
            }
            
        except Exception as e:
            logger.error(f"Error al obtener historial {session_id}: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al obtener historial: {str(e)}"
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
            
            # En un entorno real, aquí se eliminarían los mensajes de la base de datos
            # Por ahora simulamos la limpieza
            return {
                "exito": True,
                "mensaje": f"Historial limpiado para sesión {session_id}"
            }
            
        except Exception as e:
            logger.error(f"Error al limpiar historial {session_id}: {str(e)}")
            return {
                "exito": False,
                "error": f"Error al limpiar historial: {str(e)}"
            }
    
    def _formatear_historial(self, historial: List[MensajeChatbotModelo]) -> str:
        """
        Formatea el historial de mensajes para el chatbot
        
        Args:
            historial: Lista de mensajes
            
        Returns:
            Historial formateado como string
        """
        if not historial:
            return ""
        
        return "\n".join([
            f"{mensaje.tipo}: {mensaje.contenido}"
            for mensaje in historial
        ])
    
    def procesar_respuesta(self, respuesta: str) -> Dict[str, Any]:
        """
        Procesa una respuesta del chatbot
        
        Args:
            respuesta: Respuesta del chatbot
            
        Returns:
            Dict con la respuesta procesada
        """
        try:
            # Analizar la respuesta para extraer información relevante
            tiene_imagenes = any(palabra in respuesta.lower() for palabra in [
                'imagen', 'radiografía', 'ecografía', 'análisis'
            ])
            
            tiene_recomendaciones = any(palabra in respuesta.lower() for palabra in [
                'recomend', 'suger', 'protocolo', 'tratamiento'
            ])
            
            # Determinar urgencia
            urgencia = 'baja'
            if any(palabra in respuesta.lower() for palabra in [
                'urgente', 'emergencia', 'crítico', 'grave'
            ]):
                urgencia = 'alta'
            elif any(palabra in respuesta.lower() for palabra in [
                'importante', 'atención', 'cuidado'
            ]):
                urgencia = 'media'
            
            return {
                'contenido': respuesta,
                'tiene_imagenes': tiene_imagenes,
                'tiene_recomendaciones': tiene_recomendaciones,
                'urgencia': urgencia
            }
            
        except Exception as e:
            logger.error(f"Error al procesar respuesta: {str(e)}")
            return {
                'contenido': respuesta,
                'tiene_imagenes': False,
                'tiene_recomendaciones': False,
                'urgencia': 'baja'
            }
