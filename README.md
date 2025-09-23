# DiagnoVET - Sistema de Reportes Veterinarios

Sistema completo de gestión de reportes veterinarios con procesamiento de PDFs usando inteligencia artificial, integración con Google Drive y Supabase.

## 🚀 Características Principales

- **Procesamiento de PDFs con IA**: Extracción y análisis de informes veterinarios usando Google Gemini
- **Generación de Reportes Estructurados**: Creación automática de reportes en formato Markdown
- **Integración con Google Drive**: Almacenamiento automático de PDFs originales
- **Base de Datos Supabase**: Persistencia de datos y reportes
- **Visor de Imágenes Médicas**: Visualización profesional de imágenes extraídas de PDFs
- **Frontend Moderno**: Interfaz desarrollada con Next.js y React
- **Backend Robusto**: API REST desarrollada con FastAPI y Python
- **Integración n8n**: Automatización de flujos de trabajo

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **React Markdown** - Visualización de reportes

### Backend
- **FastAPI** - Framework web de Python
- **Python 3.13** - Lenguaje de programación
- **Google Gemini AI** - Procesamiento de PDFs
- **Google Drive API** - Almacenamiento de archivos
- **Supabase** - Base de datos y autenticación
- **OpenCV** - Procesamiento de imágenes médicas
- **PyMuPDF** - Extracción de contenido de PDFs

### Infraestructura
- **Docker** - Containerización
- **Nginx** - Proxy reverso
- **GitHub Actions** - CI/CD
- **Vercel** - Despliegue frontend

## 📁 Estructura del Proyecto

```
DiagnoVET/
├── app/                    # Frontend Next.js
│   ├── api/               # API routes
│   ├── dashboard/         # Panel de control
│   ├── documentos/        # Subida de documentos
│   ├── reportes/          # Visualización de reportes
│   └── chatbot/           # Chatbot integrado
├── backend/               # Backend FastAPI
│   ├── controladores/     # Controladores de API
│   ├── modelos/           # Modelos de datos
│   ├── servicios/         # Servicios de negocio
│   └── utilidades/        # Utilidades comunes
├── components/            # Componentes React reutilizables
├── lib/                   # Librerías y utilidades
├── n8n/                   # Flujos de automatización
└── supabase/              # Esquemas de base de datos
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Python 3.13+
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/gabibenitezzz003/DiagnoVET-.git
cd DiagnoVET-
```

### 2. Configurar variables de entorno
Crear archivo `.env.local` con las siguientes variables:

```env
# Supabase
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_key

# Google Gemini
NEXT_PUBLIC_GEMINI_API_KEY=tu_gemini_api_key

# Google Drive
GOOGLE_DRIVE_CLIENT_ID=tu_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=tu_google_drive_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=tu_google_drive_refresh_token
GOOGLE_DRIVE_FOLDER_ID=tu_google_drive_folder_id

# N8N Webhooks
NEXT_PUBLIC_N8N_WEBHOOK_URL=tu_n8n_webhook_url
NEXT_PUBLIC_N8N_CALENDARIO_WEBHOOK_URL=tu_n8n_calendario_webhook_url
```

### 3. Instalar dependencias del frontend
```bash
npm install
```

### 4. Instalar dependencias del backend
```bash
cd backend
pip install -r requirements.txt
```

### 5. Ejecutar el proyecto

#### Frontend (puerto 3000)
```bash
npm run dev
```

#### Backend (puerto 8000)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

## 📖 Uso del Sistema

### 1. Subir Documento PDF
- Navegar a la sección "Documentos"
- Seleccionar un archivo PDF veterinario
- Configurar opciones de procesamiento
- Hacer clic en "Procesar Documento"

### 2. Ver Reportes Generados
- Ir a la sección "Reportes"
- Visualizar reportes procesados
- Usar el visor de imágenes médicas
- Exportar o compartir reportes

### 3. Dashboard
- Ver estadísticas en tiempo real
- Acceder a reportes recientes
- Gestionar el sistema

## 🔧 API Endpoints

### Reportes
- `POST /api/reportes/procesar` - Procesar PDF
- `GET /api/reportes` - Listar reportes
- `GET /api/reportes/{id}` - Obtener reporte específico

### Archivos
- `POST /api/archivos/subir` - Subir archivo
- `GET /api/archivos` - Listar archivos

### Chatbot
- `POST /api/chatbot/mensaje` - Enviar mensaje al chatbot

## 🐳 Despliegue con Docker

### Construir imágenes
```bash
docker-compose -f docker-compose.production.yml build
```

### Ejecutar en producción
```bash
docker-compose -f docker-compose.production.yml up -d
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/algo`)
3. Commit tus cambios (`git commit -m 'Add algo'`)
4. Push a la rama (`git push origin feature/algo`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Gabriel Benitez** - Desarrollador Principal

## 📞 Contacto

- GitHub: [@gabibenitezzz003](https://github.com/gabibenitezzz003)
- Proyecto: [DiagnoVET](https://github.com/gabibenitezzz003/DiagnoVET-)
