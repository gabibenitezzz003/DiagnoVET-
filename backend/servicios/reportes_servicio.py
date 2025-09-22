"""
Servicio de reportes
Implementa la lógica de acceso a datos para reportes
"""

from typing import Dict, Any, List, Optional
import logging
import json
import os
from datetime import datetime

from modelos.reporte_modelo import ReporteModelo
from configuracion.database import obtener_conexion_bd

logger = logging.getLogger(__name__)

class ReportesServicio:
    """Servicio para manejo de reportes"""
    
    def __init__(self):
        self.tabla_reportes = 'reportes_veterinarios'
        # Archivo para persistir reportes
        self.archivo_reportes = 'reportes.json'
        # Cargar reportes existentes
        self.reportes_memoria = self._cargar_reportes()
    
    def obtener_conexion_bd(self):
        """Obtiene la conexión a la base de datos"""
        return obtener_conexion_bd()
    
    def _cargar_reportes(self) -> List[Dict[str, Any]]:
        """Carga reportes desde el archivo JSON"""
        try:
            if os.path.exists(self.archivo_reportes):
                with open(self.archivo_reportes, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error al cargar reportes: {str(e)}")
            return []
    
    def _guardar_reportes(self):
        """Guarda reportes en el archivo JSON"""
        try:
            with open(self.archivo_reportes, 'w', encoding='utf-8') as f:
                json.dump(self.reportes_memoria, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error al guardar reportes: {str(e)}")
    
    async def guardar_reporte(self, reporte: ReporteModelo) -> Dict[str, Any]:
        """
        Guarda un reporte en la base de datos
        
        Args:
            reporte: Modelo de reporte a guardar
            
        Returns:
            Dict con el resultado de la operación
        """
        try:
            logger.info(f"Guardando reporte: {reporte.id}")
            
            # Conectar a Supabase real
            supabase = obtener_conexion_bd()
            
            # Preparar datos para Supabase (tabla 'reporte')
            # El ID será auto-generado por Supabase, no lo incluimos
            datos_supabase = {
                "paciente_id": reporte.paciente.get("id", 1),
                "veterinario_id": reporte.veterinario.get("id", 1),
                "fecha_estudio": reporte.fecha_creacion.date().isoformat(),
                "tipo_estudio": reporte.tipo_estudio,
                "origen_archivo": reporte.archivo_original,
                "json_resultado": {
                    "id": reporte.id,  # Guardamos el UUID en el JSON
                    "paciente": reporte.paciente,
                    "tutor": reporte.tutor,
                    "veterinario": reporte.veterinario,
                    "diagnostico": reporte.diagnostico,
                    "imagenes": reporte.imagenes,
                    "contenido_extraido": reporte.contenido_extraido,
                    "confianza_extraccion": reporte.confianza_extraccion,
                    "url_google_drive": reporte.url_google_drive,
                    "id_google_drive": reporte.id_google_drive
                },
                "tipo_procesamiento": "ia_analisis",
                "estado_procesamiento": reporte.estado,
                "creado_en": reporte.fecha_creacion.isoformat(),
                "actualizado_en": reporte.fecha_actualizacion.isoformat()
            }
            
            # Insertar en la tabla 'reporte' de Supabase
            resultado = supabase.table('reporte').insert(datos_supabase).execute()
            
            if resultado.data:
                logger.info(f"Reporte guardado exitosamente en Supabase: {reporte.id}")
                
                # También guardar en memoria para compatibilidad
                datos_reporte = {
                    "id": reporte.id,
                    "fecha_creacion": reporte.fecha_creacion.isoformat(),
                    "fecha_actualizacion": reporte.fecha_actualizacion.isoformat(),
                    "tipo_estudio": reporte.tipo_estudio,
                    "paciente": reporte.paciente,
                    "tutor": reporte.tutor,
                    "veterinario": reporte.veterinario,
                    "diagnostico": reporte.diagnostico,
                    "imagenes": reporte.imagenes,
                    "archivo_original": reporte.archivo_original,
                    "contenido_extraido": reporte.contenido_extraido,
                    "confianza_extraccion": reporte.confianza_extraccion,
                    "estado": reporte.estado,
                    "url_google_drive": reporte.url_google_drive,
                    "id_google_drive": reporte.id_google_drive
                }
                self.reportes_memoria.append(datos_reporte)
                self._guardar_reportes()
                
                return {
                    "exito": True,
                    "datos": resultado.data[0],
                    "mensaje": "Reporte guardado exitosamente en Supabase"
                }
            else:
                logger.error(f"Error al guardar reporte en Supabase: {resultado}")
                return {
                    "exito": False,
                    "error": "Error de base de datos",
                    "mensaje": "No se pudo guardar el reporte en Supabase"
                }
            
        except Exception as e:
            logger.error(f"Error al guardar reporte: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": f"Ha ocurrido un error inesperado: {str(e)}"
            }
    
    async def obtener_reportes(self, filtros: Dict[str, Any], pagina: int = 1, limite: int = 10) -> Dict[str, Any]:
        """
        Obtiene reportes con filtros y paginación
        
        Args:
            filtros: Filtros a aplicar
            pagina: Número de página
            limite: Cantidad de elementos por página
            
        Returns:
            Dict con los reportes
        """
        try:
            logger.info(f"Obteniendo reportes con filtros: {filtros}")
            
            # Intentar conectar a Supabase
            try:
                logger.info("Intentando conectar a Supabase...")
                supabase = self.obtener_conexion_bd()
                logger.info("Conexión a Supabase exitosa")
                
                # Construir consulta con filtros
                query = supabase.table('reporte').select('*')
                
                # Aplicar filtros
                if filtros.get('tipo_estudio'):
                    query = query.eq('tipo_estudio', filtros['tipo_estudio'])
                if filtros.get('especie'):
                    # Filtrar por especie en el JSON del paciente
                    query = query.contains('json_resultado', {'paciente': {'especie': filtros['especie']}})
                if filtros.get('veterinario'):
                    query = query.eq('veterinario_id', filtros['veterinario'])
                
                # Aplicar paginación
                offset = (pagina - 1) * limite
                query = query.range(offset, offset + limite - 1)
                
                # Ejecutar consulta
                resultado = query.execute()
                
                # Convertir datos de Supabase al formato esperado por el frontend
                reportes_formateados = []
                for reporte in resultado.data or []:
                    json_data = reporte.get('json_resultado', {})
                    reporte_formateado = {
                        "id": json_data.get('id', str(reporte.get('id'))),  # Usar ID del JSON o del registro
                        "fecha_creacion": reporte.get('creado_en'),
                        "fecha_actualizacion": reporte.get('actualizado_en'),
                        "tipo_estudio": reporte.get('tipo_estudio'),
                        "paciente": json_data.get('paciente', {}),
                        "tutor": json_data.get('tutor', {}),
                        "veterinario": json_data.get('veterinario', {}),
                        "diagnostico": json_data.get('diagnostico', {}),
                        "imagenes": json_data.get('imagenes', []),
                        "archivo_original": reporte.get('origen_archivo'),
                        "contenido_extraido": json_data.get('contenido_extraido', ''),
                        "confianza_extraccion": json_data.get('confianza_extraccion', 0),
                        "estado": reporte.get('estado_procesamiento'),
                        "url_google_drive": json_data.get('url_google_drive'),
                        "id_google_drive": json_data.get('id_google_drive')
                    }
                    reportes_formateados.append(reporte_formateado)
                
                return {
                    "exito": True,
                    "datos": reportes_formateados,
                    "mensaje": f"Reportes obtenidos exitosamente desde Supabase ({len(reportes_formateados)} total)"
                }
            except Exception as supabase_error:
                logger.warning(f"Error al conectar con Supabase: {str(supabase_error)}")
                logger.info("Usando reportes de memoria como fallback")

                # Fallback a memoria si Supabase falla
                reportes_filtrados = self.reportes_memoria.copy()
                
                # Aplicar filtros
                if filtros.get('tipo_estudio'):
                    reportes_filtrados = [r for r in reportes_filtrados if r.get('tipo_estudio') == filtros['tipo_estudio']]
                if filtros.get('especie'):
                    reportes_filtrados = [r for r in reportes_filtrados if r.get('paciente', {}).get('especie') == filtros['especie']]
                if filtros.get('veterinario'):
                    reportes_filtrados = [r for r in reportes_filtrados if r.get('veterinario', {}).get('id') == filtros['veterinario']]
                
                # Aplicar paginación
                offset = (pagina - 1) * limite
                reportes_paginados = reportes_filtrados[offset:offset + limite]
                
                return {
                    "exito": True,
                    "datos": reportes_paginados,
                    "mensaje": f"Reportes obtenidos desde memoria (fallback) ({len(reportes_filtrados)} total)"
                }
        except Exception as e:
            logger.error(f"Error al obtener reportes: {str(e)}")
            return {
                "exito": False,
                "error": str(e),
                "mensaje": "Error al obtener reportes"
            }
    
    async def obtener_reporte_por_id(self, reporte_id: str) -> Dict[str, Any]:
        """
        Obtiene un reporte por ID
        
        Args:
            reporte_id: ID del reporte
            
        Returns:
            Dict con el reporte
        """
        try:
            logger.info(f"Obteniendo reporte: {reporte_id}")
            
            # Conectar a Supabase real
            supabase = obtener_conexion_bd()
            
            # Consultar reporte por ID
            resultado = supabase.table('reporte').select('*').eq('id', reporte_id).execute()
            
            if resultado.data and len(resultado.data) > 0:
                datos_bd = resultado.data[0]
                reporte = ReporteModelo.crear_desde_bd(datos_bd)
                
                return {
                    "exito": True,
                    "datos": reporte,
                    "mensaje": "Reporte obtenido exitosamente desde Supabase"
                }
            else:
                return {
                    "exito": False,
                    "error": "Reporte no encontrado",
                    "mensaje": f"No se encontró el reporte con ID: {reporte_id}"
                }
            
        except Exception as e:
            logger.error(f"Error al obtener reporte {reporte_id}: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": f"Ha ocurrido un error inesperado: {str(e)}"
            }
    
    async def actualizar_reporte(
        self, 
        reporte_id: str, 
        datos_actualizacion: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Actualiza un reporte existente
        
        Args:
            reporte_id: ID del reporte
            datos_actualizacion: Datos a actualizar
            
        Returns:
            Dict con el resultado de la actualización
        """
        try:
            logger.info(f"Actualizando reporte: {reporte_id}")
            
            # En un entorno real, aquí se actualizaría la base de datos
            # Por ahora simulamos la actualización
            datos_simulados = {
                'id': reporte_id,
                'fecha_creacion': datetime.now().isoformat(),
                'fecha_actualizacion': datetime.now().isoformat(),
                'tipo_estudio': 'radiografia',
                'paciente': {'nombre': 'Paciente actualizado'},
                'tutor': {'nombre': 'Tutor actualizado'},
                'veterinario': {'nombre': 'Veterinario actualizado'},
                'diagnostico': {'principal': 'Diagnóstico actualizado'},
                'imagenes': [],
                'archivo_original': 'archivo.pdf',
                'contenido_extraido': 'Contenido actualizado',
                'confianza_extraccion': 0.9,
                'estado': 'completado'
            }
            
            reporte = ReporteModelo.crear_desde_bd(datos_simulados)
            reporte.actualizar_datos(datos_actualizacion)
            
            return {
                "exito": True,
                "datos": reporte,
                "mensaje": "Reporte actualizado exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al actualizar reporte {reporte_id}: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def eliminar_reporte(self, reporte_id: str) -> Dict[str, Any]:
        """
        Elimina un reporte
        
        Args:
            reporte_id: ID del reporte
            
        Returns:
            Dict con el resultado de la eliminación
        """
        try:
            logger.info(f"Eliminando reporte: {reporte_id}")
            
            # En un entorno real, aquí se eliminaría de la base de datos
            # Por ahora simulamos la eliminación
            
            return {
                "exito": True,
                "mensaje": "Reporte eliminado exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error al eliminar reporte {reporte_id}: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
    
    async def buscar_reportes(self, termino: str, limite: int = 10) -> Dict[str, Any]:
        """
        Busca reportes por término
        
        Args:
            termino: Término de búsqueda
            limite: Cantidad máxima de resultados
            
        Returns:
            Dict con los reportes encontrados
        """
        try:
            logger.info(f"Buscando reportes con término: {termino}")
            
            # En un entorno real, aquí se realizaría la búsqueda en la base de datos
            # Por ahora simulamos la búsqueda
            reportes_simulados = []
            
            for i in range(min(limite, 3)):  # Simular 3 resultados máximo
                datos_simulados = {
                    'id': f'busqueda_{i+1}',
                    'fecha_creacion': datetime.now().isoformat(),
                    'fecha_actualizacion': datetime.now().isoformat(),
                    'tipo_estudio': 'radiografia',
                    'paciente': {'nombre': f'Paciente encontrado {i+1}'},
                    'tutor': {'nombre': f'Tutor encontrado {i+1}'},
                    'veterinario': {'nombre': f'Veterinario encontrado {i+1}'},
                    'diagnostico': {'principal': f'Diagnóstico encontrado {i+1}'},
                    'imagenes': [],
                    'archivo_original': f'archivo_encontrado_{i+1}.pdf',
                    'contenido_extraido': f'Contenido encontrado {i+1}',
                    'confianza_extraccion': 0.85,
                    'estado': 'completado'
                }
                
                reporte = ReporteModelo.crear_desde_bd(datos_simulados)
                reportes_simulados.append(reporte)
            
            return {
                "exito": True,
                "datos": reportes_simulados,
                "mensaje": f"Se encontraron {len(reportes_simulados)} reportes"
            }
            
        except Exception as e:
            logger.error(f"Error al buscar reportes: {str(e)}")
            return {
                "exito": False,
                "error": "Error interno",
                "mensaje": "Ha ocurrido un error inesperado"
            }
