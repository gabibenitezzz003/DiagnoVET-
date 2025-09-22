/**
 * @swagger
 * /api/google-drive/subir:
 *   post:
 *     summary: Subir archivo a Google Drive
 *     description: Sube un archivo PDF a Google Drive con metadata del paciente
 *     tags: [Google Drive]
 *     security:
 *       - GoogleDriveAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF a subir
 *               paciente_nombre:
 *                 type: string
 *                 example: "Ramón"
 *               veterinario_nombre:
 *                 type: string
 *                 example: "Dr. Carolina Ghersevich"
 *               tipo_estudio:
 *                 type: string
 *                 example: "radiografia"
 *               fecha_estudio:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-21T10:00:00Z"
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 archivo:
 *                   $ref: '#/components/schemas/ArchivoDrive'
 *       400:
 *         description: Error en la subida del archivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/google-drive/archivos:
 *   get:
 *     summary: Listar archivos en Google Drive
 *     description: Retorna la lista de archivos en la carpeta de Google Drive
 *     tags: [Google Drive]
 *     security:
 *       - GoogleDriveAuth: []
 *     responses:
 *       200:
 *         description: Lista de archivos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 archivos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ArchivoDrive'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/n8n/chat:
 *   post:
 *     summary: Enviar mensaje al chatbot
 *     description: Envía un mensaje al chatbot de N8N y retorna la respuesta
 *     tags: [N8N]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mensaje:
 *                 type: string
 *                 example: "¿Cuáles son los síntomas de la displasia de cadera?"
 *               sessionId:
 *                 type: string
 *                 example: "session_123"
 *     responses:
 *       200:
 *         description: Respuesta del chatbot obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 respuesta:
 *                   type: string
 *                   example: "La displasia de cadera es una condición..."
 *                 sessionId:
 *                   type: string
 *                   example: "session_123"
 *       400:
 *         description: Error en el envío del mensaje
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/n8n/calendario/crear:
 *   post:
 *     summary: Crear evento en Google Calendar
 *     description: Crea un evento en Google Calendar a través de N8N
 *     tags: [N8N]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "turno_123"
 *               tipo_evento:
 *                 type: string
 *                 example: "crear"
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-21T14:00:00Z"
 *               tutor:
 *                 type: string
 *                 example: "María González"
 *               email_tutor:
 *                 type: string
 *                 example: "maria.gonzalez@email.com"
 *               paciente:
 *                 type: string
 *                 example: "Max"
 *               tipo_consulta:
 *                 type: string
 *                 example: "consulta_general"
 *               veterinario:
 *                 type: string
 *                 example: "1"
 *               notas:
 *                 type: string
 *                 example: "Primera consulta"
 *               precio:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Workflow was started"
 *       400:
 *         description: Error en la creación del evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/analisis/pdf:
 *   post:
 *     summary: Analizar PDF con Gemini AI
 *     description: Procesa un PDF veterinario y extrae información estructurada usando Gemini AI
 *     tags: [Análisis]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF a analizar
 *     responses:
 *       200:
 *         description: PDF analizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/ReporteAnalizado'
 *       400:
 *         description: Error en el análisis del PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * components:
 *   schemas:
 *     ArchivoDrive:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1ABC123DEF456GHI789JKL"
 *         nombre:
 *           type: string
 *           example: "2025-09-21_Ramón_radiografia_Estudio_Radiográfico_Ramón.pdf"
 *         url:
 *           type: string
 *           example: "https://drive.google.com/file/d/1ABC123DEF456GHI789JKL/view"
 *         carpeta_id:
 *           type: string
 *           example: "1NxLCCGCXbd3H2kNjwfyMirhGDIoanlFJ"
 *         fecha_subida:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 * 
 *     ReporteAnalizado:
 *       type: object
 *       properties:
 *         paciente:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *               example: "Ramón"
 *             especie:
 *               type: string
 *               example: "canino"
 *             raza:
 *               type: string
 *               example: "Schnauzer miniatura"
 *             sexo:
 *               type: string
 *               example: "macho"
 *             edad:
 *               type: string
 *               example: "13 años"
 *         veterinario:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *               example: "Dr. Carolina Ghersevich"
 *             matricula:
 *               type: string
 *               example: "MP-12345"
 *         informacion_estudio:
 *           type: object
 *           properties:
 *             tipo:
 *               type: string
 *               example: "radiografia"
 *             fecha:
 *               type: string
 *               example: "2025-08-27"
 *             motivo:
 *               type: string
 *               example: "Control de rutina"
 *         imagenes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "img_123"
 *               nombre:
 *                 type: string
 *                 example: "Imagen Clínica - Página 3"
 *               url:
 *                 type: string
 *                 example: "data:image/png;base64,..."
 *               tipo:
 *                 type: string
 *                 example: "radiografia"
 *               pagina:
 *                 type: integer
 *                 example: 3
 *         hallazgos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               organo:
 *                 type: string
 *                 example: "Pulmones"
 *               descripcion:
 *                 type: string
 *                 example: "Sin alteraciones patológicas"
 *               severidad:
 *                 type: string
 *                 example: "normal"
 *         recomendaciones:
 *           type: string
 *           example: "Continuar con controles regulares"
 *         confianza:
 *           type: number
 *           example: 0.95
 */
