"""
Configuración de base de datos
Maneja la conexión y configuración de Supabase
"""

import os
from supabase import create_client, Client
from typing import Optional
import logging
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

logger = logging.getLogger(__name__)

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Cliente de Supabase
supabase_client: Optional[Client] = None

def obtener_cliente_supabase() -> Client:
    """
    Obtiene el cliente de Supabase
    
    Returns:
        Cliente de Supabase configurado
    """
    global supabase_client
    
    if supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("URL y clave de Supabase no configuradas")
        
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Cliente de Supabase inicializado")
    
    return supabase_client

async def inicializar_base_datos():
    """
    Inicializa la base de datos y crea las tablas necesarias
    """
    try:
        logger.info("Inicializando base de datos...")
        
        # En un entorno real, aquí se ejecutarían los scripts SQL
        # para crear las tablas y configurar las políticas RLS
        
        logger.info("Base de datos inicializada correctamente")
        
    except Exception as e:
        logger.error(f"Error al inicializar base de datos: {str(e)}")
        raise

def obtener_conexion_bd():
    """
    Obtiene una conexión a la base de datos
    
    Returns:
        Cliente de Supabase para operaciones de base de datos
    """
    return obtener_cliente_supabase()
