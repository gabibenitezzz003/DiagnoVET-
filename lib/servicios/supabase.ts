/**
 * Servicio de Supabase para manejo de base de datos
 * Implementa el patrón Repository para abstraer el acceso a datos
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIGURACION_SUPABASE } from '../constantes/configuracion';
import { ReporteVeterinario } from '../tipos/reporte-veterinario';
import { Turno, CrearTurnoRequest, ActualizarTurnoRequest, FiltrosTurno } from '../tipos/turno';

export class ServicioSupabase {
  private cliente: SupabaseClient | null = null;
  private modoDemo: boolean = true;

  constructor() {
    // Usar Supabase real si está configurado
    if (CONFIGURACION_SUPABASE.URL && CONFIGURACION_SUPABASE.CLAVE_ANONIMA) {
      this.cliente = createClient(
        CONFIGURACION_SUPABASE.URL,
        CONFIGURACION_SUPABASE.CLAVE_ANONIMA
      );
      this.modoDemo = false;
      console.log('✅ Conectado a Supabase real:', CONFIGURACION_SUPABASE.URL);
    } else {
      console.log('⚠️ Modo demo: Supabase no configurado, usando datos simulados');
    }
  }

  /**
   * Obtiene un reporte por ID
   */
  async obtenerReportePorId(id: string): Promise<{ exito: boolean; datos?: ReporteVeterinario; error?: string }> {
    if (this.modoDemo) {
      return this.obtenerReporteDemoPorId(id);
    }

    try {
      const { data, error } = await this.cliente!
        .from(CONFIGURACION_SUPABASE.TABLA_REPORTES)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          exito: false,
          error: `Error al obtener reporte: ${error.message}`,
        };
      }

      return {
        exito: true,
        datos: this.mapearReporteDesdeBD(data),
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`,
      };
    }
  }

  /**
   * Obtiene reportes con filtros y paginación
   */
  async obtenerReportes(
    filtros: any = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{ exito: boolean; datos?: ReporteVeterinario[]; error?: string; paginacion?: any }> {
    if (this.modoDemo) {
      return this.obtenerReportesDemoConFiltros(filtros, pagina, limite);
    }

    try {
      let consulta = this.cliente!
        .from('vista_reportes_completos')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filtros.tipoEstudio) {
        consulta = consulta.eq('tipo_estudio', filtros.tipoEstudio);
      }
      if (filtros.especie) {
        consulta = consulta.eq('paciente_especie', filtros.especie);
      }
      if (filtros.veterinario) {
        consulta = consulta.ilike('veterinario_nombre', `%${filtros.veterinario}%`);
      }
      if (filtros.fechaInicio) {
        consulta = consulta.gte('creado_en', filtros.fechaInicio.toISOString());
      }
      if (filtros.fechaFin) {
        consulta = consulta.lte('creado_en', filtros.fechaFin.toISOString());
      }
      if (filtros.estado) {
        consulta = consulta.eq('estado', filtros.estado);
      }

      // Aplicar paginación
      const offset = (pagina - 1) * limite;
      consulta = consulta.range(offset, offset + limite - 1);

      // Ordenar por fecha de creación descendente
      consulta = consulta.order('creado_en', { ascending: false });

      const { data, error, count } = await consulta;

      if (error) {
        return {
          exito: false,
          error: `Error al obtener reportes: ${error.message}`,
          paginacion: this.crearPaginacionVacia(),
        };
      }

      const reportes = data?.map(reporte => this.mapearReporteDesdeBD(reporte)) || [];
      const totalPaginas = Math.ceil((count || 0) / limite);

      return {
        exito: true,
        datos: reportes,
        paginacion: {
          pagina,
          limite,
          total: count || 0,
          totalPaginas,
        },
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`,
        paginacion: this.crearPaginacionVacia(),
      };
    }
  }

  /**
   * Guarda un nuevo reporte
   */
  async guardarReporte(reporte: ReporteVeterinario): Promise<{ exito: boolean; datos?: ReporteVeterinario; error?: string }> {
    try {
      // Verificar si el reporte ya existe para evitar duplicados
      const reporteExistente = await this.verificarReporteExistente(reporte);
      if (reporteExistente) {
        console.log(`✅ Reporte existente encontrado: ${reporteExistente.archivo_original}`);
        return {
          exito: true,
          datos: this.mapearReporteDesdeBD(reporteExistente),
        };
      }

      const datosBD = await this.mapearReporteParaBD(reporte);

      const { data, error } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_REPORTES)
        .insert([datosBD])
        .select()
        .single();

      if (error) {
        return {
          exito: false,
          error: `Error al guardar reporte: ${error.message}`,
        };
      }

      console.log(`✅ Nuevo reporte guardado: ${data.archivo_original}`);
        return {
          exito: true,
          datos: this.mapearReporteDesdeBD(data),
        };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`,
      };
    }
  }

  /**
   * Actualiza un reporte existente
   */
  async actualizarReporte(id: string, reporte: Partial<ReporteVeterinario>): Promise<{ exito: boolean; datos?: ReporteVeterinario; error?: string }> {
    try {
      const datosBD = await this.mapearReporteParaBD(reporte as ReporteVeterinario);
      datosBD.fecha_actualizacion = new Date().toISOString();

      const { data, error } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_REPORTES)
        .update(datosBD)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          exito: false,
          error: `Error al actualizar reporte: ${error.message}`,
        };
      }

        return {
          exito: true,
          datos: this.mapearReporteDesdeBD(data),
        };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`,
      };
    }
  }

  /**
   * Elimina un reporte
   */
  async eliminarReporte(id: string): Promise<{ exito: boolean; error?: string }> {
    try {
      const { error } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_REPORTES)
        .delete()
        .eq('id', id);

      if (error) {
        return {
          exito: false,
          error: `Error al eliminar reporte: ${error.message}`,
        };
      }

      return {
        exito: true,
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`,
      };
    }
  }

  /**
   * Busca reportes por texto
   */
  async buscarReportes(termino: string, limite: number = 10): Promise<{ exito: boolean; datos?: ReporteVeterinario[]; error?: string }> {
    try {
      const { data, error } = await this.cliente
        .from('vista_reportes_completos')
        .select('*')
        .or(`paciente_nombre.ilike.%${termino}%,veterinario_nombre.ilike.%${termino}%,diagnostico_principal.ilike.%${termino}%`)
        .limit(limite);

      if (error) {
        return {
          exito: false,
          error: `Error al buscar reportes: ${error.message}`,
        };
      }

      const reportes = data?.map(reporte => this.mapearReporteDesdeBD(reporte)) || [];

      return {
        exito: true,
        datos: reportes,
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`,
      };
    }
  }

  /**
   * Mapea un reporte desde la base de datos
   */
  private mapearReporteDesdeBD(datos: any): ReporteVeterinario {
    return {
      id: datos.id || '',
      fechaCreacion: datos.creado_en ? new Date(datos.creado_en) : new Date(),
      informacionEstudio: {
        tipo: datos.tipo_estudio || 'otro',
        fecha: datos.fecha_estudio || new Date().toISOString().split('T')[0],
        solicitud: datos.solicitud_estudio || ''
      },
      paciente: {
        nombre: datos.paciente_nombre || 'No especificado',
        especie: datos.paciente_especie || 'No especificada',
        raza: datos.paciente_raza || 'No especificada',
        edad: datos.paciente_edad || 'No especificada',
        sexo: datos.paciente_sexo || 'desconocido'
      },
      tutor: {
        nombre: datos.tutor_nombre || 'No especificado',
        telefono: datos.tutor_telefono || 'No especificado',
        email: datos.tutor_email || 'No especificado'
      },
      veterinarios: [{
        nombre: datos.veterinario_nombre || 'No especificado',
        clinica: datos.veterinario_clinica || 'No especificada',
        matricula: datos.veterinario_matricula || 'No especificada'
      }],
      hallazgos: {
        resumen: datos.hallazgos_resumen || 'No especificado',
        principales: datos.hallazgos_principales || ['No especificado']
      },
      conclusion: {
        principales: datos.conclusion_principales || ['No especificado'],
        diferenciales: datos.conclusion_diferenciales || [],
        notasAdicionales: datos.conclusion_notas || 'No especificado'
      },
      tratamiento: {
        recomendaciones: datos.tratamiento_recomendaciones || ['No especificado']
      },
      imagenes: datos.imagenes || [],
      archivoOriginal: datos.archivo_original || 'No especificado',
      contenidoExtraido: datos.contenido_extraido || 'No especificado',
      confianzaExtraccion: datos.confianza_extraccion || 0,
      estado: datos.estado || 'completado',
    };
  }

  /**
   * Mapea un reporte para la base de datos
   */
  private async mapearReporteParaBD(reporte: ReporteVeterinario): Promise<any> {
    // Obtener o crear IDs válidos para paciente y veterinario
    const pacienteId = await this.obtenerOcrearPaciente(reporte.paciente);
    const veterinarioId = await this.obtenerOcrearVeterinario(reporte.veterinarios[0] || {});

    return {
      paciente_id: pacienteId,
      veterinario_id: veterinarioId,
      tipo_estudio: reporte.informacionEstudio.tipo,
      fecha_estudio: reporte.fechaCreacion.toISOString().split('T')[0],
      archivo_original: reporte.archivoOriginal,
      contenido_extraido: reporte.contenidoExtraido,
      confianza_extraccion: reporte.confianzaExtraccion,
      estado: reporte.estado,
      tipo_procesamiento: 'gemini'
    };
  }

  /**
   * Obtiene o crea un paciente en la base de datos
   */
  private async obtenerOcrearPaciente(paciente: any): Promise<string> {
    try {
      // Buscar paciente existente por múltiples criterios para evitar duplicados
      const { data: pacienteExistente } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_PACIENTES)
        .select('id, nombre, especie, raza, tutor_nombre')
        .eq('nombre', paciente.nombre)
        .eq('especie', paciente.especie)
        .eq('tutor_nombre', paciente.tutor?.nombre || 'No especificado')
        .single();

      if (pacienteExistente) {
        console.log(`✅ Paciente existente encontrado: ${pacienteExistente.nombre} (${pacienteExistente.especie})`);
        return pacienteExistente.id;
      }

      // Si no se encuentra exacto, buscar por nombre y especie (más flexible)
      const { data: pacienteSimilar } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_PACIENTES)
        .select('id, nombre, especie, raza, tutor_nombre')
        .eq('nombre', paciente.nombre)
        .eq('especie', paciente.especie)
        .single();

      if (pacienteSimilar) {
        console.log(`✅ Paciente similar encontrado: ${pacienteSimilar.nombre} (${pacienteSimilar.especie})`);
        return pacienteSimilar.id;
      }

      // Crear nuevo paciente
      const { data: nuevoPaciente, error } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_PACIENTES)
        .insert([{
          nombre: paciente.nombre,
          especie: paciente.especie,
          raza: paciente.raza,
          edad: paciente.edad,
          sexo: paciente.sexo,
          tutor_nombre: paciente.tutor?.nombre || 'No especificado',
          tutor_telefono: paciente.tutor?.telefono || 'No especificado',
          tutor_email: paciente.tutor?.email || 'No especificado'
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creando paciente:', error);
        // Crear un paciente por defecto si falla
        return await this.crearPacientePorDefecto();
      }

      return nuevoPaciente.id;
    } catch (error) {
      console.error('Error en obtenerOcrearPaciente:', error);
      return await this.crearPacientePorDefecto();
    }
  }

  /**
   * Obtiene o crea un veterinario en la base de datos
   */
  private async obtenerOcrearVeterinario(veterinario: any): Promise<string> {
    try {
      // Verificar que el veterinario tenga datos válidos
      if (!veterinario || !veterinario.nombre) {
        console.log('⚠️ Veterinario sin datos válidos, creando por defecto');
        return await this.crearVeterinarioPorDefecto();
      }

      // Buscar veterinario existente por matrícula (único)
      if (veterinario.matricula) {
        const { data: veterinarioExistente } = await this.cliente
          .from(CONFIGURACION_SUPABASE.TABLA_VETERINARIOS)
          .select('id, nombre, apellido, matricula, especializacion')
          .eq('matricula', veterinario.matricula)
          .single();

        if (veterinarioExistente) {
          console.log(`✅ Veterinario existente encontrado: ${veterinarioExistente.nombre} ${veterinarioExistente.apellido} (${veterinarioExistente.matricula})`);
          return veterinarioExistente.id;
        }
      }

      // Si no se encuentra por matrícula, buscar por nombre
      const { data: veterinarioSimilar } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_VETERINARIOS)
        .select('id, nombre, apellido, matricula, especializacion')
        .eq('nombre', veterinario.nombre)
        .single();

      if (veterinarioSimilar) {
        console.log(`✅ Veterinario similar encontrado: ${veterinarioSimilar.nombre} ${veterinarioSimilar.apellido} (${veterinarioSimilar.matricula})`);
        return veterinarioSimilar.id;
      }

      // Crear nuevo veterinario
      const { data: nuevoVeterinario, error } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_VETERINARIOS)
        .insert([{
          nombre: veterinario.nombre,
          apellido: veterinario.apellido || '',
          matricula: veterinario.matricula || 'MP-00000',
          especializacion: veterinario.especializacion || 'General',
          clinica: veterinario.clinica || 'Clínica General',
          email: veterinario.email || 'veterinario@clinica.com',
          telefono: veterinario.telefono || 'No especificado',
          direccion: veterinario.direccion || 'No especificada',
          horario: veterinario.horario || 'Lunes a Viernes 9:00-18:00',
          activo: true
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creando veterinario:', error);
        // Crear un veterinario por defecto si falla
        return await this.crearVeterinarioPorDefecto();
      }

      return nuevoVeterinario.id;
    } catch (error) {
      console.error('Error en obtenerOcrearVeterinario:', error);
      return await this.crearVeterinarioPorDefecto();
    }
  }

  /**
   * Verifica si un reporte ya existe para evitar duplicados
   */
  private async verificarReporteExistente(reporte: ReporteVeterinario): Promise<any | null> {
    try {
      // Buscar por nombre de archivo y tipo de estudio
      const { data: reporteExistente } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_REPORTES)
        .select('*')
        .eq('archivo_original', reporte.archivoOriginal)
        .eq('tipo_estudio', reporte.informacionEstudio.tipo)
        .single();

      return reporteExistente;
    } catch (error) {
      // Si no se encuentra, retornar null
      return null;
    }
  }

  /**
   * Crea un paciente por defecto si falla la creación normal
   */
  private async crearPacientePorDefecto(): Promise<string> {
    try {
      const { data: paciente, error } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_PACIENTES)
        .insert([{
          nombre: 'Paciente por Defecto',
          especie: 'canino',
          raza: 'No especificada',
          edad: 'No especificada',
          sexo: 'desconocido',
          tutor_nombre: 'No especificado',
          tutor_telefono: 'No especificado',
          tutor_email: 'No especificado'
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creando paciente por defecto:', error);
        // Si falla, usar el primer paciente existente
        const { data: pacienteExistente } = await this.cliente
          .from(CONFIGURACION_SUPABASE.TABLA_PACIENTES)
          .select('id')
          .limit(1)
          .single();

        return pacienteExistente?.id || '00000000-0000-0000-0000-000000000001';
      }

      return paciente.id;
    } catch (error) {
      console.error('Error en crearPacientePorDefecto:', error);
      return '00000000-0000-0000-0000-000000000001';
    }
  }

  /**
   * Crea un veterinario por defecto si falla la creación normal
   */
  private async crearVeterinarioPorDefecto(): Promise<string> {
    try {
      const { data: veterinario, error } = await this.cliente
        .from(CONFIGURACION_SUPABASE.TABLA_VETERINARIOS)
        .insert([{
          nombre: 'Veterinario',
          apellido: 'Por Defecto',
          matricula: 'MP-DEFAULT',
          especializacion: 'General',
          clinica: 'Clínica por Defecto',
          email: 'veterinario@default.com',
          telefono: 'No especificado',
          direccion: 'No especificada',
          horario: 'Lunes a Viernes 9:00-18:00',
          activo: true
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creando veterinario por defecto:', error);
        // Si falla, usar el primer veterinario existente
        const { data: veterinarioExistente } = await this.cliente
          .from(CONFIGURACION_SUPABASE.TABLA_VETERINARIOS)
          .select('id')
          .limit(1)
          .single();

        return veterinarioExistente?.id || '00000000-0000-0000-0000-000000000002';
      }

      return veterinario.id;
    } catch (error) {
      console.error('Error en crearVeterinarioPorDefecto:', error);
      return '00000000-0000-0000-0000-000000000002';
    }
  }

  /**
   * Crea una paginación vacía
   */
  private crearPaginacionVacia(): any {
    return {
      pagina: 1,
      limite: 10,
      total: 0,
      totalPaginas: 0,
    };
  }

  // ===== MÉTODOS DE MODO DEMO =====

  /**
   * Obtiene un reporte demo por ID
   */
  private async obtenerReporteDemoPorId(id: string): Promise<{ exito: boolean; datos?: ReporteVeterinario; error?: string }> {
    const reportes = await this.obtenerReportesDemo();
    const reporte = reportes.find(r => r.id === id);

    if (!reporte) {
      return {
        exito: false,
        error: 'Reporte no encontrado',
      };
    }

    return {
      exito: true,
      datos: reporte,
    };
  }

  /**
   * Obtiene reportes demo con filtros
   */
  private async obtenerReportesDemoConFiltros(
    filtros: any = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{ exito: boolean; datos?: ReporteVeterinario[]; error?: string; paginacion?: any }> {
    let reportes = this.obtenerReportesDemo();

    // Aplicar filtros
    if (filtros.tipoEstudio) {
      reportes = reportes.filter(r => r.informacionEstudio?.tipo === filtros.tipoEstudio);
    }
    if (filtros.especie) {
      reportes = reportes.filter(r => r.paciente.especie === filtros.especie);
    }
    if (filtros.veterinario) {
      reportes = reportes.filter(r =>
        r.veterinarios?.some(vet => vet.nombre.toLowerCase().includes(filtros.veterinario!.toLowerCase()))
      );
    }
    if (filtros.estado) {
      reportes = reportes.filter(r => r.estado === filtros.estado);
    }

    // Aplicar paginación
    const total = reportes.length;
    const offset = (pagina - 1) * limite;
    const datos = reportes.slice(offset, offset + limite);
    const totalPaginas = Math.ceil(total / limite);

    return {
      exito: true,
      datos,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas,
      },
    };
  }

  /**
   * Genera datos demo de reportes
   */
  private obtenerReportesDemo(): ReporteVeterinario[] {
    return [
      {
        id: '1',
        fechaCreacion: new Date('2024-01-15'),
        informacionEstudio: {
          tipo: 'radiografia',
          fecha: '2024-01-15',
          solicitud: 'Fractura de fémur'
        },
        paciente: {
          nombre: 'Max',
          especie: 'canino',
          raza: 'Labrador',
          edad: '3 años',
          sexo: 'macho',
        },
        tutor: {
          nombre: 'Juan Pérez',
          telefono: '+1234567890',
          email: 'juan@email.com',
        },
        veterinarios: [{
          nombre: 'Dr. María García',
          clinica: 'VetCenter',
          matricula: 'VET12345'
        }],
        hallazgos: {
          resumen: 'Fractura completa del fémur derecho con desplazamiento',
          principales: ['Fractura de fémur', 'Inflamación localizada']
        },
        conclusion: {
          principales: ['Fractura de fémur'],
          diferenciales: ['Inflamación localizada'],
          notasAdicionales: 'Requiere tratamiento quirúrgico'
        },
        tratamiento: {
          recomendaciones: ['Reposo absoluto', 'Medicación antiinflamatoria']
        },
        imagenes: [
          {
            id: 'img1',
            nombre: 'radiografia-max.jpg',
            url: '/demo/radiografia-max.jpg',
            descripcion: 'Radiografía lateral del fémur',
            tipo: 'radiografia',
            pagina: 1
          },
        ],
        archivoOriginal: 'radiografia-max.pdf',
        contenidoExtraido: 'Paciente canino de 3 años con fractura completa del fémur derecho...',
        confianzaExtraccion: 0.95,
        estado: 'completado',
      },
      {
        id: '2',
        fechaCreacion: new Date('2024-01-14'),
        informacionEstudio: {
          tipo: 'ecografia',
          fecha: '2024-01-14',
          solicitud: 'Soplo cardíaco'
        },
        paciente: {
          nombre: 'Luna',
          especie: 'felino',
          raza: 'Siamés',
          edad: '2 años',
          sexo: 'hembra',
        },
        tutor: {
          nombre: 'Ana López',
          telefono: '+0987654321',
          email: 'ana@email.com',
        },
        veterinarios: [{
          nombre: 'Dr. Carlos Ruiz',
          clinica: 'PetCare',
          matricula: 'VET67890'
        }],
        hallazgos: {
          resumen: 'Soplo cardíaco grado II con hipertrofia ventricular',
          principales: ['Soplo cardíaco grado II', 'Hipertrofia ventricular']
        },
        conclusion: {
          principales: ['Soplo cardíaco grado II'],
          diferenciales: ['Hipertrofia ventricular'],
          notasAdicionales: 'Requiere seguimiento cardiológico'
        },
        tratamiento: {
          recomendaciones: ['Control cardiológico cada 6 meses', 'Ejercicio moderado']
        },
        imagenes: [
          {
            id: 'img2',
            nombre: 'ecocardio-luna.jpg',
            url: '/demo/ecocardio-luna.jpg',
            descripcion: 'Ecocardiograma 2D',
            tipo: 'ecografia',
            pagina: 1
          },
        ],
        archivoOriginal: 'ecocardio-luna.pdf',
        contenidoExtraido: 'Ecocardiograma de paciente felino de 2 años...',
        confianzaExtraccion: 0.88,
        estado: 'completado',
      },
    ];
  }

  // ========================================
  // MÉTODOS PARA TURNOS
  // ========================================

  /**
   * Obtiene turnos con filtros opcionales
   */
  async obtenerTurnos(filtros: any = {}): Promise<{ exito: boolean; datos?: any[]; error?: string }> {
    if (this.modoDemo) {
      return this.obtenerTurnosDemo(filtros);
    }

    try {
      let query = this.cliente!
        .from('turnos')
        .select(`
          *,
          veterinarios (
            id,
            nombre,
            apellido,
            especializacion
          )
        `)
        .order('fecha_hora', { ascending: true });

      // Aplicar filtros
      if (filtros.fecha_inicio) {
        query = query.gte('fecha_hora', filtros.fecha_inicio);
      }
      if (filtros.fecha_fin) {
        query = query.lte('fecha_hora', filtros.fecha_fin);
      }
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros.veterinario_id) {
        query = query.eq('veterinario_id', filtros.veterinario_id);
      }

      const { data, error } = await query;

      if (error) {
        return {
          exito: false,
          error: `Error al obtener turnos: ${error.message}`,
        };
      }

      // Mapear datos para incluir nombre del veterinario
      const turnosMapeados = data?.map(turno => ({
        ...turno,
        veterinario_nombre: turno.veterinarios?.nombre ?
          `${turno.veterinarios.nombre} ${turno.veterinarios.apellido}` :
          'Veterinario no especificado'
      })) || [];

      return {
        exito: true,
        datos: turnosMapeados,
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado al obtener turnos: ${error}`,
      };
    }
  }

  /**
   * Crea un nuevo turno
   */
  async crearTurno(turno: any): Promise<{ exito: boolean; datos?: any; error?: string }> {
    if (this.modoDemo) {
      return this.crearTurnoDemo(turno);
    }

    try {
      // Crear paciente si se proporcionan datos del paciente
      let pacienteId: string | null = null;
      if (turno.paciente_nombre && turno.paciente_especie) {
        const pacienteData = {
          nombre: turno.paciente_nombre,
          especie: turno.paciente_especie,
          raza: turno.paciente_raza || null,
          tutor_nombre: turno.tutor_nombre || null,
          tutor_telefono: turno.tutor_telefono || null,
          tutor_email: turno.tutor_email || null,
        };

        const { data: paciente, error: errorPaciente } = await this.cliente!
          .from('pacientes')
          .insert([pacienteData])
          .select('id')
          .single();

        if (errorPaciente) {
          console.warn('Error al crear paciente:', errorPaciente.message);
        } else {
          pacienteId = paciente.id;
        }
      }

      // Preparar datos del turno para la base de datos
      const turnoParaBD = {
        veterinario_id: turno.veterinario_id,
        paciente_id: pacienteId,
        tipo_consulta: turno.tipo_consulta,
        fecha_hora: turno.fecha_hora,
        duracion_minutos: turno.duracion_minutos,
        urgencia: turno.urgencia || 'medio',
        lugar: turno.lugar || null,
        mensaje: turno.mensaje || null,
        notas_internas: turno.notas_internas || null,
        estado: 'programado' as const,
        confirmado: false,
        recordatorio_enviado: false,
      };

      const { data, error } = await this.cliente!
        .from('turnos')
        .insert([turnoParaBD])
        .select(`
          *,
          veterinarios:veterinario_id(nombre, apellido, especializacion),
          pacientes:paciente_id(nombre, especie, raza, tutor_nombre, tutor_email, tutor_telefono)
        `)
        .single();

      if (error) {
        return {
          exito: false,
          error: `Error al crear turno: ${error.message}`,
        };
      }

      // Mapear datos para la respuesta
      const turnoMapeado: Turno = {
        id: data.id,
        reporte_id: data.reporte_id,
        veterinario_id: data.veterinario_id,
        paciente_id: data.paciente_id,
        fecha_hora: data.fecha_hora,
        duracion_minutos: data.duracion_minutos,
        urgencia: data.urgencia,
        lugar: data.lugar,
        tipo_consulta: data.tipo_consulta,
        mensaje: data.mensaje,
        estado: data.estado,
        confirmado: data.confirmado,
        recordatorio_enviado: data.recordatorio_enviado,
        notas_internas: data.notas_internas,
        creado_en: data.creado_en,
        actualizado_en: data.actualizado_en,
        // Campos calculados
        veterinario_nombre: data.veterinarios ? `${data.veterinarios.nombre} ${data.veterinarios.apellido}` : null,
        paciente_nombre: data.pacientes?.nombre || turno.paciente_nombre,
        paciente_especie: data.pacientes?.especie || turno.paciente_especie,
        paciente_raza: data.pacientes?.raza || turno.paciente_raza,
        tutor_nombre: data.pacientes?.tutor_nombre || turno.tutor_nombre,
        tutor_email: data.pacientes?.tutor_email || turno.tutor_email,
        tutor_telefono: data.pacientes?.tutor_telefono || turno.tutor_telefono,
        precio: turno.precio,
      };

      return {
        exito: true,
        datos: turnoMapeado,
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error al crear turno: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }
  }

  /**
   * Actualiza un turno existente
   */
  async actualizarTurno(id: string, turno: any): Promise<{ exito: boolean; datos?: any; error?: string }> {
    if (this.modoDemo) {
      return this.actualizarTurnoDemo(id, turno);
    }

    try {
      // Mapear 'notas' a 'notas_internas' para la base de datos
      const turnoParaBD = {
        ...turno,
        notas_internas: turno.notas || null
      };

      // Remover 'notas' del objeto para evitar conflictos
      delete turnoParaBD.notas;

      const { data, error } = await this.cliente!
        .from('turnos')
        .update(turnoParaBD)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          exito: false,
          error: `Error al actualizar turno: ${error.message}`,
        };
      }

      return {
        exito: true,
        datos: data,
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado al actualizar turno: ${error}`,
      };
    }
  }

  /**
   * Elimina un turno
   */
  async eliminarTurno(id: string): Promise<{ exito: boolean; datos?: boolean; error?: string }> {
    if (this.modoDemo) {
      return this.eliminarTurnoDemo(id);
    }

    try {
      const { error } = await this.cliente!
        .from('turnos')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          exito: false,
          error: `Error al eliminar turno: ${error.message}`,
        };
      }

      return {
        exito: true,
        datos: true,
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado al eliminar turno: ${error}`,
      };
    }
  }

  // ========================================
  // MÉTODOS DEMO PARA TURNOS
  // ========================================

  private async obtenerTurnosDemo(filtros: any = {}): Promise<{ exito: boolean; datos?: any[]; error?: string }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const turnosDemo: Turno[] = [
      {
        id: '1',
        paciente_nombre: 'Max',
        paciente_especie: 'canino',
        paciente_raza: 'Labrador',
        tutor_nombre: 'Juan Pérez',
        tutor_email: 'juan@email.com',
        tutor_telefono: '+54 9 11 1234-5678',
        veterinario_id: '1',
        veterinario_nombre: 'Dr. Marina García',
        tipo_consulta: 'consulta_general',
        fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        duracion_minutos: 30,
        estado: 'confirmado',
        notas_internas: 'Primera consulta de rutina',
        precio: 5000,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: '2',
        paciente_nombre: 'Luna',
        paciente_especie: 'felino',
        paciente_raza: 'Siamés',
        tutor_nombre: 'María González',
        tutor_email: 'maria@email.com',
        tutor_telefono: '+54 9 11 2345-6789',
        veterinario_id: '2',
        veterinario_nombre: 'Dr. Lucía Rodríguez',
        tipo_consulta: 'cirugia',
        fecha_hora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Pasado mañana
        duracion_minutos: 120,
        estado: 'programado',
        notas_internas: 'Cirugía de esterilización',
        precio: 15000,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: '3',
        paciente_nombre: 'Rocky',
        paciente_especie: 'canino',
        paciente_raza: 'Golden Retriever',
        tutor_nombre: 'Carlos López',
        tutor_email: 'carlos@email.com',
        tutor_telefono: '+54 9 11 3456-7890',
        veterinario_id: '3',
        veterinario_nombre: 'Dr. Agustina Fernández',
        tipo_consulta: 'dermatologia',
        fecha_hora: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // En 3 días
        duracion_minutos: 45,
        estado: 'completado',
        notas_internas: 'Consulta por problemas de piel',
        precio: 8000,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      }
    ];

    // Aplicar filtros demo
    let turnosFiltrados = turnosDemo;

    if (filtros.estado) {
      turnosFiltrados = turnosFiltrados.filter(t => t.estado === filtros.estado);
    }

    if (filtros.veterinario_id) {
      turnosFiltrados = turnosFiltrados.filter(t => t.veterinario_id === filtros.veterinario_id);
    }

    return {
      exito: true,
      datos: turnosFiltrados,
    };
  }

  private async crearTurnoDemo(turno: any): Promise<{ exito: boolean; datos?: any; error?: string }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      ...turno,
      veterinario_nombre: 'Dr. Veterinario Demo',
      estado: 'programado',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      exito: true,
      datos: nuevoTurno,
    };
  }

  private async actualizarTurnoDemo(id: string, turno: any): Promise<{ exito: boolean; datos?: any; error?: string }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 600));

    const turnoActualizado: Turno = {
      id,
      paciente_nombre: 'Paciente Actualizado',
      paciente_especie: 'canino',
      paciente_raza: 'Mestizo',
      tutor_nombre: 'Tutor Actualizado',
      tutor_email: 'tutor@email.com',
      tutor_telefono: '+54 9 11 0000-0000',
      veterinario_id: '1',
      veterinario_nombre: 'Dr. Veterinario Demo',
      tipo_consulta: 'consulta_general',
      fecha_hora: new Date().toISOString(),
      duracion_minutos: 30,
      estado: 'programado',
      notas: 'Turno actualizado',
      precio: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...turno
    };

    return {
      exito: true,
      datos: turnoActualizado,
    };
  }

  private async eliminarTurnoDemo(id: string): Promise<{ exito: boolean; datos?: boolean; error?: string }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      exito: true,
      datos: true,
    };
  }

  // ========================================
  // MÉTODOS PARA VETERINARIOS
  // ========================================

  /**
   * Obtiene todos los veterinarios
   */
  async obtenerVeterinarios(): Promise<{ exito: boolean; datos?: any[]; error?: string }> {
    if (this.modoDemo) {
      return this.obtenerVeterinariosDemo();
    }

    try {
      const { data, error } = await this.cliente!
        .from('veterinarios')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) {
        return {
          exito: false,
          error: `Error al obtener veterinarios: ${error.message}`,
        };
      }

      return {
        exito: true,
        datos: data || [],
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error inesperado al obtener veterinarios: ${error}`,
      };
    }
  }

  // ========================================
  // MÉTODOS DEMO PARA VETERINARIOS
  // ========================================

  private async obtenerVeterinariosDemo(): Promise<{ exito: boolean; datos?: any[]; error?: string }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const veterinariosDemo = [
      {
        id: '1',
        nombre: 'Marina',
        apellido: 'García',
        matricula: 'MP-10001',
        especializacion: 'Medicina Interna',
        clinica: 'Clínica DiagnoVET',
        email: 'marina@diagnovet.com',
        telefono: '+54 9 11 1234-5678',
        direccion: 'Av. Corrientes 1234, CABA',
        horario: 'Lunes a Viernes 9:00-18:00',
        activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: '2',
        nombre: 'Lucía',
        apellido: 'Rodríguez',
        matricula: 'MP-10002',
        especializacion: 'Cirugía',
        clinica: 'Clínica DiagnoVET',
        email: 'lucia@diagnovet.com',
        telefono: '+54 9 11 2345-6789',
        direccion: 'Av. Corrientes 1234, CABA',
        horario: 'Lunes a Viernes 9:00-18:00',
        activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: '3',
        nombre: 'Agustina',
        apellido: 'Fernández',
        matricula: 'MP-10003',
        especializacion: 'Dermatología',
        clinica: 'Clínica DiagnoVET',
        email: 'agustina@diagnovet.com',
        telefono: '+54 9 11 3456-7890',
        direccion: 'Av. Corrientes 1234, CABA',
        horario: 'Lunes a Viernes 9:00-18:00',
        activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: '4',
        nombre: 'Carlos',
        apellido: 'Martínez',
        matricula: 'MP-10004',
        especializacion: 'Cardiología',
        clinica: 'Clínica DiagnoVET',
        email: 'carlos@diagnovet.com',
        telefono: '+54 9 11 4567-8901',
        direccion: 'Av. Corrientes 1234, CABA',
        horario: 'Lunes a Viernes 9:00-18:00',
        activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      },
      {
        id: '5',
        nombre: 'Ana',
        apellido: 'López',
        matricula: 'MP-10005',
        especializacion: 'Neurología',
        clinica: 'Clínica DiagnoVET',
        email: 'ana@diagnovet.com',
        telefono: '+54 9 11 5678-9012',
        direccion: 'Av. Corrientes 1234, CABA',
        horario: 'Lunes a Viernes 9:00-18:00',
        activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      }
    ];

    return {
      exito: true,
      datos: veterinariosDemo,
    };
  }
}

// Instancia singleton del servicio
export const servicioSupabase = new ServicioSupabase();
