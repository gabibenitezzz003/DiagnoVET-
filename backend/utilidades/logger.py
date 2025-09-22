"""
Configuración de logging
Sistema de logging estructurado para la aplicación
"""

import logging
import sys
from datetime import datetime
from typing import Optional

def configurar_logger(
    nivel: str = "INFO",
    formato: Optional[str] = None,
    archivo_log: Optional[str] = None
) -> logging.Logger:
    """
    Configura el sistema de logging
    
    Args:
        nivel: Nivel de logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        formato: Formato personalizado para los logs
        archivo_log: Archivo donde guardar los logs
        
    Returns:
        Logger configurado
    """
    # Configurar nivel de logging
    nivel_logging = getattr(logging, nivel.upper(), logging.INFO)
    
    # Formato por defecto
    if formato is None:
        formato = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configurar logger principal
    logger = logging.getLogger("diagnovet")
    logger.setLevel(nivel_logging)
    
    # Evitar duplicación de handlers
    if logger.handlers:
        return logger
    
    # Handler para consola
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(nivel_logging)
    console_formatter = logging.Formatter(formato)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # Handler para archivo (si se especifica)
    if archivo_log:
        file_handler = logging.FileHandler(archivo_log)
        file_handler.setLevel(nivel_logging)
        file_formatter = logging.Formatter(formato)
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    
    return logger

def obtener_logger(nombre: str) -> logging.Logger:
    """
    Obtiene un logger específico
    
    Args:
        nombre: Nombre del logger
        
    Returns:
        Logger configurado
    """
    return logging.getLogger(f"diagnovet.{nombre}")

# Logger principal
logger_principal = configurar_logger()
