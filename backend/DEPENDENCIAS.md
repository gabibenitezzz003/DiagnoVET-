# 📦 Dependencias del Backend - DiagnoVET

Este documento describe todas las dependencias utilizadas en el backend de DiagnoVET.

## 🏗️ Dependencias Principales

### Framework Web
- **FastAPI** (0.104.1): Framework web moderno y rápido para APIs
- **Uvicorn** (0.24.0): Servidor ASGI para FastAPI
- **python-multipart** (0.0.6): Soporte para formularios multipart

### Base de Datos
- **SQLAlchemy** (2.0.34): ORM para Python
- **Pydantic** (2.11.9): Validación de datos y serialización
- **Supabase** (2.19.0): Cliente para Supabase

### Procesamiento de Documentos
- **Pillow** (10.4.0): Procesamiento de imágenes
- **pytesseract** (0.3.13): OCR (Reconocimiento Óptico de Caracteres)
- **pdf2image** (1.17.0): Conversión de PDF a imágenes
- **pdfjs-dist** (3.11.174): Procesamiento de PDFs en JavaScript

### Análisis de Datos
- **Pandas** (2.3.2): Manipulación y análisis de datos
- **NumPy** (1.26.4): Computación numérica

### APIs Externas
- **OpenAI** (1.3.7): Integración con GPT
- **httpx** (0.28.1): Cliente HTTP asíncrono

### Google APIs
- **google-api-python-client** (2.108.0): Cliente para APIs de Google
- **google-auth-httplib2** (0.1.1): Autenticación HTTP para Google
- **google-auth-oauthlib** (1.1.0): OAuth2 para Google
- **google-auth** (2.23.4): Autenticación de Google

### Seguridad
- **python-jose[cryptography]** (3.3.0): JWT y encriptación
- **passlib[bcrypt]** (1.7.4): Hashing de contraseñas
- **bcrypt** (4.3.0): Algoritmo de hashing

### Utilidades
- **uuid** (1.30): Generación de UUIDs
- **python-dotenv** (1.0.0): Carga de variables de entorno

## 🔧 Dependencias de Desarrollo

### Testing
- **pytest** (7.4.3): Framework de testing
- **pytest-asyncio** (0.21.1): Soporte para async/await en tests
- **pytest-cov** (4.1.0): Cobertura de código

### Linting y Formateo
- **black** (23.11.0): Formateador de código
- **flake8** (6.1.0): Linter de Python
- **isort** (5.12.0): Organizador de imports
- **mypy** (1.7.1): Verificador de tipos

### Documentación
- **sphinx** (7.2.6): Generador de documentación
- **sphinx-rtd-theme** (1.3.0): Tema para Sphinx

### Debugging
- **ipdb** (0.13.13): Debugger interactivo
- **rich** (13.7.0): Mejoras visuales en terminal

### Monitoreo
- **sentry-sdk[fastapi]** (1.38.0): Monitoreo de errores

## 📋 Instalación

### Instalación Básica
```bash
cd backend
pip install -r requirements.txt
```

### Instalación de Desarrollo
```bash
cd backend
pip install -r requirements-dev.txt
```

### Instalación con NPM
```bash
# Producción
npm run install:backend

# Desarrollo
npm run install:all:dev
```

## 🔍 Verificación

Para verificar que todas las dependencias están instaladas correctamente:

```bash
cd backend
python -c "
import fastapi
import uvicorn
import supabase
import google.auth
print('✅ Todas las dependencias principales están instaladas')
"
```

## 🐳 Docker

El Dockerfile incluye todas las dependencias del sistema necesarias:

- **tesseract-ocr**: Para OCR
- **poppler-utils**: Para conversión de PDF
- **libgl1-mesa-glx**: Para procesamiento de imágenes
- **gcc/g++**: Para compilar extensiones nativas

## 🔄 Actualización

Para actualizar las dependencias:

1. Editar `requirements.txt` o `requirements-dev.txt`
2. Ejecutar `pip install -r requirements.txt --upgrade`
3. Verificar que todo funciona con `python -c "import [modulo]"`

## ⚠️ Notas Importantes

- **Python 3.11+** es requerido
- **Tesseract** debe estar instalado en el sistema para OCR
- **Google Cloud APIs** deben estar habilitadas
- Las **variables de entorno** deben estar configuradas correctamente

## 🆘 Solución de Problemas

### Error de Tesseract
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-spa

# Windows
# Descargar desde: https://github.com/UB-Mannheim/tesseract/wiki
```

### Error de Google Auth
```bash
pip install --upgrade google-auth google-auth-oauthlib google-auth-httplib2
```

### Error de PDF2Image
```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils

# Windows
# Descargar desde: https://poppler.freedesktop.org/
```
