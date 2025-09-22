import { NextRequest, NextResponse } from 'next/server';
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
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
        },
        GoogleDriveAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
              tokenUrl: 'https://oauth2.googleapis.com/token',
              scopes: {
                'https://www.googleapis.com/auth/drive.file': 'Acceso a Google Drive para subir archivos'
              }
            }
          }
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
        name: 'Imágenes',
        description: 'Gestión de imágenes médicas'
      },
      {
        name: 'Chat',
        description: 'Sistema de chat y chatbot'
      },
      {
        name: 'Google Drive',
        description: 'Integración con Google Drive'
      },
      {
        name: 'N8N',
        description: 'Integración con workflows de N8N'
      },
      {
        name: 'Análisis',
        description: 'Análisis de PDFs con Gemini AI'
      }
    ]
  },
  apis: ['./lib/swagger/endpoints/*.js']
};

const specs = swaggerJSDoc(options);

export async function GET(request: NextRequest) {
  try {
    // Generar HTML para Swagger UI usando CDN
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DiagnoVET API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    .swagger-ui .topbar { display: none !important; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null,
        onComplete: function() {
          console.log('Swagger UI loaded successfully');
        }
      });
    };
  </script>
</body>
</html>`;

    return new NextResponse(swaggerHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating Swagger documentation:', error);
    return new NextResponse('Error generating documentation', { status: 500 });
  }
}
