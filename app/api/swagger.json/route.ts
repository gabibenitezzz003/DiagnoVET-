import { NextRequest, NextResponse } from 'next/server';

// Especificación de Swagger simplificada
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DiagnoVET API',
    version: '1.0.0',
    description: 'API completa para el sistema veterinario DiagnoVET con integración a Supabase, Google Drive, Gemini AI y N8N',
    contact: {
      name: 'DiagnoVET Team',
      email: 'support@diagnovet.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo'
    },
    {
      url: 'https://diagnovet.vercel.app',
      description: 'Servidor de producción'
    }
  ],
  components: {
    securitySchemes: {
      SupabaseAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de autenticación de Supabase'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          exito: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Mensaje de error descriptivo'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          exito: {
            type: 'boolean',
            example: true
          },
          datos: {
            type: 'object',
            description: 'Datos de respuesta'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Veterinarios',
      description: 'Gestión de veterinarios'
    },
    {
      name: 'Pacientes',
      description: 'Gestión de pacientes'
    },
    {
      name: 'Reportes',
      description: 'Gestión de reportes veterinarios'
    },
    {
      name: 'Turnos',
      description: 'Gestión de turnos y citas'
    },
    {
      name: 'Integraciones',
      description: 'Integraciones con servicios externos'
    }
  ],
  paths: {
    '/api/veterinarios': {
      get: {
        tags: ['Veterinarios'],
        summary: 'Obtener lista de veterinarios',
        description: 'Obtiene la lista completa de veterinarios registrados',
        responses: {
          '200': {
            description: 'Lista de veterinarios obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    exito: { type: 'boolean', example: true },
                    datos: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'uuid' },
                          nombre: { type: 'string', example: 'Dr. Juan Pérez' },
                          especializacion: { type: 'string', example: 'Neurología' },
                          clinica: { type: 'string', example: 'Clínica Veterinaria Central' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/pacientes': {
      get: {
        tags: ['Pacientes'],
        summary: 'Obtener lista de pacientes',
        description: 'Obtiene la lista completa de pacientes registrados',
        responses: {
          '200': {
            description: 'Lista de pacientes obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    exito: { type: 'boolean', example: true },
                    datos: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'uuid' },
                          nombre: { type: 'string', example: 'Max' },
                          especie: { type: 'string', example: 'Canino' },
                          raza: { type: 'string', example: 'Golden Retriever' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reportes': {
      get: {
        tags: ['Reportes'],
        summary: 'Obtener lista de reportes',
        description: 'Obtiene la lista completa de reportes veterinarios',
        responses: {
          '200': {
            description: 'Lista de reportes obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    exito: { type: 'boolean', example: true },
                    datos: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'uuid' },
                          tipo_estudio: { type: 'string', example: 'Radiografía' },
                          fecha_estudio: { type: 'string', example: '2025-01-21' },
                          estado: { type: 'string', example: 'Completado' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/turnos': {
      get: {
        tags: ['Turnos'],
        summary: 'Obtener lista de turnos',
        description: 'Obtiene la lista completa de turnos programados',
        responses: {
          '200': {
            description: 'Lista de turnos obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    exito: { type: 'boolean', example: true },
                    datos: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'uuid' },
                          veterinario_nombre: { type: 'string', example: 'Dr. Juan Pérez' },
                          tipo_consulta: { type: 'string', example: 'Consulta General' },
                          fecha_hora: { type: 'string', example: '2025-01-21T10:00:00Z' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(swaggerSpec);
  } catch (error) {
    console.error('Error generating Swagger JSON:', error);
    return NextResponse.json({ error: 'Error generating documentation' }, { status: 500 });
  }
}
