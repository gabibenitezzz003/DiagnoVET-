"""
Aplicación principal del backend de DiagnoVET
Implementa Clean Architecture con separación de responsabilidades
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List, Optional
import os
from dotenv import load_dotenv

from controladores.reportes_controlador import ReportesControlador
from controladores.chatbot_controlador import ChatbotControlador
from controladores.archivos_controlador import ArchivosControlador
from configuracion.database import inicializar_base_datos
from utilidades.logger import configurar_logger

# Cargar variables de entorno
load_dotenv()
load_dotenv('.env')  # Cargar específicamente el archivo .env  # Carga .env
load_dotenv('.env.local')  # Carga .env.local (sobrescribe .env)

# Configurar logger
logger = configurar_logger()

# Crear aplicación FastAPI
app = FastAPI(
    title="DiagnoVET API",
    description="API para procesamiento de reportes veterinarios con IA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS dinámicamente basado en el entorno
import os

# Obtener orígenes permitidos desde variables de entorno
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
if os.getenv("NODE_ENV") == "production":
    # En producción, solo permitir dominios específicos
    cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]
else:
    # En desarrollo, permitir localhost y archivos locales
    cors_origins.extend([
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:8000",
        "null"  # Para archivos HTML locales
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Inicializar controladores
reportes_controlador = ReportesControlador()
chatbot_controlador = ChatbotControlador()
archivos_controlador = ArchivosControlador()

@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación"""
    logger.info("Iniciando aplicación DiagnoVET...")
    await inicializar_base_datos()
    logger.info("Aplicación iniciada correctamente")

@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre de la aplicación"""
    logger.info("Cerrando aplicación DiagnoVET...")

@app.get("/")
async def raiz():
    """Endpoint raíz de la API"""
    return {
        "mensaje": "DiagnoVET API - Sistema de Reportes Veterinarios",
        "version": "1.0.0",
        "estado": "activo"
    }

@app.get("/salud")
async def verificar_salud():
    """Endpoint para verificar el estado de la API"""
    return {
        "estado": "saludable",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Rutas de reportes
@app.post("/api/reportes/procesar")
async def procesar_reporte(archivo: UploadFile = File(...)):
    """Procesa un archivo PDF y extrae información estructurada"""
    try:
        resultado = await reportes_controlador.procesar_reporte(archivo)
        return resultado
    except Exception as e:
        logger.error(f"Error al procesar reporte: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reportes")
async def obtener_reportes(
    pagina: int = 1,
    limite: int = 10,
    tipo_estudio: Optional[str] = None,
    especie: Optional[str] = None,
    veterinario: Optional[str] = None
):
    """Obtiene reportes con filtros y paginación"""
    try:
        filtros = {
            "tipo_estudio": tipo_estudio,
            "especie": especie,
            "veterinario": veterinario
        }
        resultado = await reportes_controlador.obtener_reportes(filtros, pagina, limite)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener reportes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reportes/{reporte_id}")
async def obtener_reporte_por_id(reporte_id: str):
    """Obtiene un reporte específico por ID"""
    try:
        resultado = await reportes_controlador.obtener_reporte_por_id(reporte_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener reporte {reporte_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/reportes/{reporte_id}")
async def actualizar_reporte(reporte_id: str, datos_actualizacion: dict):
    """Actualiza un reporte existente"""
    try:
        resultado = await reportes_controlador.actualizar_reporte(reporte_id, datos_actualizacion)
        return resultado
    except Exception as e:
        logger.error(f"Error al actualizar reporte {reporte_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/reportes/{reporte_id}")
async def eliminar_reporte(reporte_id: str):
    """Elimina un reporte"""
    try:
        resultado = await reportes_controlador.eliminar_reporte(reporte_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al eliminar reporte {reporte_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reportes/buscar")
async def buscar_reportes(termino: str, limite: int = 10):
    """Busca reportes por término"""
    try:
        resultado = await reportes_controlador.buscar_reportes(termino, limite)
        return resultado
    except Exception as e:
        logger.error(f"Error al buscar reportes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de veterinarios
@app.get("/api/veterinarios")
async def obtener_veterinarios():
    """Obtiene la lista de veterinarios desde Supabase"""
    try:
        resultado = await reportes_controlador.obtener_veterinarios()
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener veterinarios: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/veterinarios/{veterinario_id}")
async def obtener_veterinario_por_id(veterinario_id: str):
    """Obtiene un veterinario específico por ID"""
    try:
        resultado = await reportes_controlador.obtener_veterinario_por_id(veterinario_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener veterinario: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de pacientes
@app.get("/api/pacientes")
async def obtener_pacientes():
    """Obtiene la lista de pacientes"""
    try:
        resultado = await reportes_controlador.obtener_pacientes()
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener pacientes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pacientes/{paciente_id}")
async def obtener_paciente_por_id(paciente_id: str):
    """Obtiene un paciente específico por ID"""
    try:
        resultado = await reportes_controlador.obtener_paciente_por_id(paciente_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener paciente: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de turnos
@app.get("/api/turnos")
async def obtener_turnos():
    """Obtiene la lista de turnos"""
    try:
        resultado = await reportes_controlador.obtener_turnos()
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener turnos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/turnos")
async def crear_turno(turno: dict):
    """Crea un nuevo turno"""
    try:
        resultado = await reportes_controlador.crear_turno(turno)
        return resultado
    except Exception as e:
        logger.error(f"Error al crear turno: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/turnos/{turno_id}")
async def obtener_turno_por_id(turno_id: str):
    """Obtiene un turno específico por ID"""
    try:
        resultado = await reportes_controlador.obtener_turno_por_id(turno_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener turno: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de imágenes médicas
@app.get("/api/imagenes/{reporte_id}")
async def obtener_imagenes_por_reporte(reporte_id: str):
    """Obtiene las imágenes de un reporte específico"""
    try:
        resultado = await reportes_controlador.obtener_imagenes_por_reporte(reporte_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener imágenes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de diagnósticos
@app.get("/api/diagnosticos/{reporte_id}")
async def obtener_diagnostico_por_reporte(reporte_id: str):
    """Obtiene el diagnóstico de un reporte específico"""
    try:
        resultado = await reportes_controlador.obtener_diagnostico_por_reporte(reporte_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener diagnóstico: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de estadísticas
@app.get("/api/estadisticas")
async def obtener_estadisticas():
    """Obtiene estadísticas del sistema"""
    try:
        resultado = await reportes_controlador.obtener_estadisticas()
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener estadísticas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de chatbot
@app.post("/api/chatbot/mensaje")
async def enviar_mensaje_chatbot(mensaje: dict):
    """Envía un mensaje al chatbot"""
    try:
        resultado = await chatbot_controlador.enviar_mensaje(mensaje)
        return resultado
    except Exception as e:
        logger.error(f"Error al enviar mensaje al chatbot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chatbot/sugerencias")
async def obtener_sugerencias_chatbot():
    """Obtiene sugerencias de preguntas para el chatbot"""
    try:
        resultado = await chatbot_controlador.obtener_sugerencias()
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener sugerencias: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chatbot/estado")
async def verificar_estado_chatbot():
    """Verifica el estado del chatbot"""
    try:
        resultado = await chatbot_controlador.verificar_estado()
        return resultado
    except Exception as e:
        logger.error(f"Error al verificar estado del chatbot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rutas de archivos
@app.post("/api/archivos/subir")
async def subir_archivo(archivo: UploadFile = File(...)):
    """Sube un archivo al servidor"""
    try:
        resultado = await archivos_controlador.subir_archivo(archivo)
        return resultado
    except Exception as e:
        logger.error(f"Error al subir archivo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/archivos/test-google-drive")
async def test_google_drive():
    """Verifica la conexión con Google Drive"""
    try:
        from servicios.google_drive_servicio import GoogleDriveServicio
        google_drive = GoogleDriveServicio()
        resultado = await google_drive.verificar_conexion()
        return resultado
    except Exception as e:
        logger.error(f"Error al verificar Google Drive: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-env")
async def test_env():
    """Verifica las variables de entorno"""
    try:
        import os
        return {
            "exito": True,
            "datos": {
                "SUPABASE_URL": os.getenv("SUPABASE_URL", "No configurado"),
                "SUPABASE_ANON_KEY": os.getenv("SUPABASE_ANON_KEY", "No configurado")[:20] + "..." if os.getenv("SUPABASE_ANON_KEY") else "No configurado",
                "GOOGLE_DRIVE_CLIENT_ID": os.getenv("GOOGLE_DRIVE_CLIENT_ID", "No configurado"),
                "GOOGLE_DRIVE_FOLDER_ID": os.getenv("GOOGLE_DRIVE_FOLDER_ID", "No configurado"),
                "NODE_ENV": os.getenv("NODE_ENV", "No configurado")
            },
            "mensaje": "Variables de entorno verificadas"
        }
    except Exception as e:
        logger.error(f"Error al verificar variables de entorno: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-supabase")
async def test_supabase():
    """Prueba la conexión con Supabase"""
    try:
        from configuracion.database import obtener_conexion_bd
        supabase = obtener_conexion_bd()
        resultado = supabase.table('reporte').select('*').limit(1).execute()
        return {
            "exito": True,
            "datos": {
                "conexion": "exitosa",
                "reportes_encontrados": len(resultado.data),
                "primer_reporte": resultado.data[0] if resultado.data else None
            },
            "mensaje": "Conexión con Supabase exitosa"
        }
    except Exception as e:
        logger.error(f"Error al conectar con Supabase: {str(e)}")
        return {
            "exito": False,
            "error": str(e),
            "mensaje": "Error al conectar con Supabase"
        }

@app.get("/api/test-gemini-env")
async def test_gemini_env():
    """Prueba las variables de entorno de Gemini"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
        
        return {
            "exito": True,
            "datos": {
                "api_key_configurada": bool(api_key),
                "api_key_preview": api_key[:10] + "..." if api_key else "No configurada",
                "variables_cargadas": True
            },
            "mensaje": "Variables de entorno verificadas"
        }
    except Exception as e:
        logger.error(f"Error al verificar variables de Gemini: {str(e)}")
        return {
            "exito": False,
            "error": str(e),
            "mensaje": "Error al verificar variables de Gemini"
        }

@app.post("/api/test-gemini-direct")
async def test_gemini_direct(archivo: UploadFile = File(...)):
    """Prueba Gemini directamente en el backend"""
    try:
        from servicios.procesador_pdf_servicio import ProcesadorPDFServicio
        
        procesador = ProcesadorPDFServicio()
        resultado = await procesador.procesar_pdf(archivo)
        
        return resultado
        
    except Exception as e:
        logger.error(f"Error al probar Gemini directamente: {str(e)}")
        return {
            "exito": False,
            "error": str(e),
            "mensaje": "Error al probar Gemini directamente"
        }

@app.get("/api/archivos/{archivo_id}")
async def obtener_archivo(archivo_id: str):
    """Obtiene un archivo por ID"""
    try:
        resultado = await archivos_controlador.obtener_archivo(archivo_id)
        return resultado
    except Exception as e:
        logger.error(f"Error al obtener archivo {archivo_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Manejo de errores global
@app.exception_handler(Exception)
async def manejar_error_global(request, exc):
    """Maneja errores globales de la aplicación"""
    logger.error(f"Error global: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "exito": False,
            "error": "Error interno del servidor",
            "mensaje": "Ha ocurrido un error inesperado"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
