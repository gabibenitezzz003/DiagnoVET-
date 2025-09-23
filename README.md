<div align="center">

<img src="https://www.freepik.es/icono/bing_732186" alt="DiagnoVET Logo" width="120"/>

# 🐾 DiagnoVET  
### Sistema de Diagnóstico Veterinario Asistido por IA

> Una plataforma web full-stack para **digitalizar, analizar y gestionar** informes clínicos veterinarios, con asistencia inteligente en tiempo real.

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-blue" alt="Estado del Proyecto"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/IA-Google%20Gemini-blue?logo=google" alt="Google Gemini"/>
  <img src="https://img.shields.io/badge/Base%20de%20Datos-Supabase-3ECF8E?logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Licencia-MIT-green" alt="Licencia MIT"/>
</p>

</div>

---

## 📖 Tabla de Contenidos
1. [Acerca del Proyecto](#-acerca-del-proyecto)
2. [✨ Características Clave](#-características-clave)
3. [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
4. [📂 Estructura del Repositorio](#-estructura-del-repositorio)
5. [🛠️ Stack Tecnológico](#️-stack-tecnológico)
6. [⚙️ Instalación Local](#️-instalación-local)
7. [🔑 Variables de Entorno](#-variables-de-entorno)
8. [🔌 API Endpoints](#-api-endpoints)
9. [📅 Sistema de Calendarios](#-sistema-de-calendarios)
10. [☁️ Despliegue a Producción](#️-despliegue-a-producción)
11. [🤝 Contribuciones](#-contribuciones)
12. [📄 Licencia](#-licencia)

---

## 🚀 Acerca del Proyecto

**DiagnoVET** es una solución integral para clínicas veterinarias que:  
- Automatiza la lectura y procesamiento de **informes PDF** médicos.  
- Convierte datos desestructurados en **información útil y consultable**.  
- Ofrece un **chatbot clínico inteligente (Dr. VetAI)** que responde preguntas con fuentes citadas.  
- Incluye un **sistema de turnos** conectado a Google Calendar y notificaciones automáticas.  

### 💡 Problema que resuelve
Los veterinarios pierden tiempo en tareas repetitivas como:  
- Leer informes médicos.  
- Transcribir resultados de laboratorio.  
- Agendar y confirmar turnos.  

Con **DiagnoVET**, estas tareas se **automatizan y centralizan**, liberando tiempo para lo más importante: **el cuidado de los pacientes**.

---

## ✨ Características Clave

- 📑 **Análisis Inteligente de PDFs** → Extrae información de radiografías, ecografías y análisis de sangre.  
- 🤖 **Chatbot Clínico (Dr. VetAI)** → Responde consultas clínicas basadas en RAG.  
- 📊 **Dashboard Centralizado** → Métricas en tiempo real e informes recientes.  
- 📅 **Gestión de Turnos** → Integración con Google Calendar y confirmación por email.  
- 🔄 **Automatización Total** → Ingesta automática desde Google Drive y sincronización con Supabase.  

---

## 🏗️ Arquitectura del Sistema

```plaintext
┌───────────────────────┐
│ Veterinario / Usuario │
└───────────┬───────────┘
            │
┌───────────▼───────────┐
│  Frontend (Next.js)   │
│ Despliegue: Vercel    │
└───────────┬───────────┘
            │ (API REST)
┌───────────▼───────────┐
│  Backend (FastAPI)    │
│ Despliegue: Render    │
└─────┬───────────┬─────┘
      │           │
      │           │───► n8n (Workflows: Turnos, Emails)
      │
┌─────▼─────┐   ┌──────────────┐
│ Supabase  │   │ Google Drive │
│ (DB/Auth) │   └──────────────┘
└───────────┘
📂 Estructura del Repositorio
plaintext
Copiar código
DiagnoVET/
├── app/                    # Frontend Next.js
│   ├── api/                # API routes
│   ├── dashboard/          # Panel de control
│   ├── documentos/         # Subida de documentos
│   ├── reportes/           # Visualización de reportes
│   └── chatbot/            # Chatbot integrado
├── backend/                # Backend FastAPI
│   ├── controladores/      # Controladores de API
│   ├── modelos/            # Modelos de datos
│   ├── servicios/          # Lógica de negocio
│   └── utilidades/         # Helpers
├── components/             # Componentes UI reutilizables
├── lib/                    # Librerías compartidas
├── n8n/                    # Workflows automatizados
└── supabase/               # Migraciones y esquemas DB
🛠️ Stack Tecnológico
Capa	Tecnologías
Frontend	Next.js, TypeScript, Tailwind CSS
Backend	Python, FastAPI, Docker
Base de Datos	Supabase (PostgreSQL)
IA & NLP	Google Gemini, LangChain
Automatización	n8n, Google Calendar API, SMTP
Infraestructura	Vercel, Render, GitHub Actions, Docker, Nginx

⚙️ Instalación Local
🔧 Prerrequisitos
Node.js 18+

Python 3.10+

Docker + Docker Compose

Git

🖥️ Pasos
bash
Copiar código
# 1. Clonar el repositorio
git clone https://github.com/gabibenitezzz003/DiagnoVET-.git
cd DiagnoVET-

# 2. Levantar DB en Docker
docker-compose up -d postgres

# 3. Backend
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# 4. Frontend
cd app
npm install
npm run dev
🔑 Variables de Entorno
Variable	Servicio	Descripción
SUPABASE_URL	Backend	URL pública de Supabase
SUPABASE_ANON_KEY	Frontend	Clave pública para cliente
SUPABASE_SERVICE_KEY	Backend	Clave de servicio (admin)
GEMINI_API_KEY	Backend	API Key de Google Gemini
DATABASE_URL	Backend	Conexión PostgreSQL
SMTP_USER	Backend	Usuario SMTP
SMTP_PASS	Backend	Contraseña SMTP
N8N_WEBHOOK_TURNOS	Backend	Webhook n8n para turnos

🔌 API Endpoints
POST /api/reportes/analizar → Procesa PDF con Gemini

GET /api/reportes → Lista reportes

GET /api/reportes/{id} → Reporte específico

POST /api/archivos/subir → Sube archivo PDF

GET /api/archivos → Lista archivos

POST /api/chatbot/mensaje → Chat con Dr. VetAI

POST /api/calendario/turno → Crear turno

PATCH /api/calendario/turno/{id} → Modificar turno

DELETE /api/calendario/turno/{id} → Cancelar turno

📅 Sistema de Calendarios
DiagnoVET integra Google Calendar + n8n + Supabase para gestionar turnos en tiempo real:

plaintext
Copiar código
Webhook Turnos (n8n)
   │
   ├── Crear Evento → Google Calendar → Email de Confirmación
   ├── Modificar Evento → Google Calendar → Email de Actualización
   └── Cancelar Evento → Google Calendar → Email de Cancelación
          ↓
        Supabase (Registro de estado)
✅ Notificaciones automáticas a tutores con botones de Confirmar / Cancelar
✅ Sincronización inmediata con la base de datos
✅ Evita la sobrecarga manual de agenda

☁️ Despliegue a Producción
Base de Datos → Supabase / Neon

Backend → Render (Docker)

Frontend → Vercel

Workflows → n8n Cloud

CI/CD → GitHub Actions

🤝 Contribuciones
Contribuciones abiertas 🚀

Fork del repo

Crear rama feature/nueva-funcionalidad

Push + Pull Request

📄 Licencia
Distribuido bajo licencia MIT.
