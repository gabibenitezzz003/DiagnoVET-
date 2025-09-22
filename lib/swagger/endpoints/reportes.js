/**
 * @swagger
 * /api/reportes:
 *   get:
 *     summary: Obtener lista de reportes
 *     description: Retorna todos los reportes veterinarios registrados en el sistema
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de reportes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reporte'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   post:
 *     summary: Crear nuevo reporte
 *     description: Registra un nuevo reporte veterinario en el sistema
 *     tags: [Reportes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ReporteCreate'
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Reporte'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/reportes/{id}:
 *   get:
 *     summary: Obtener reporte por ID
 *     description: Retorna un reporte específico por su ID
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del reporte
 *     responses:
 *       200:
 *         description: Reporte encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Reporte'
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   put:
 *     summary: Actualizar reporte
 *     description: Actualiza la información de un reporte existente
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReporteUpdate'
 *     responses:
 *       200:
 *         description: Reporte actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Reporte'
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   delete:
 *     summary: Eliminar reporte
 *     description: Elimina un reporte del sistema
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del reporte
 *     responses:
 *       200:
 *         description: Reporte eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/reportes/analizar:
 *   post:
 *     summary: Analizar PDF con Gemini AI
 *     description: Procesa un PDF veterinario y extrae información usando Gemini AI
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
 *     Reporte:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         paciente_id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         veterinario_id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         tipo_estudio:
 *           type: string
 *           example: "radiografia"
 *         fecha_estudio:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 *         archivo_original:
 *           type: string
 *           example: "estudio_radiografico_ramon.pdf"
 *         contenido_extraido:
 *           type: string
 *           example: "Contenido extraído del PDF..."
 *         confianza_extraccion:
 *           type: number
 *           example: 0.95
 *         estado:
 *           type: string
 *           example: "completado"
 *         tipo_procesamiento:
 *           type: string
 *           example: "gemini_ai"
 *         creado_en:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 * 
 *     ReporteCreate:
 *       type: object
 *       required:
 *         - archivo
 *       properties:
 *         archivo:
 *           type: string
 *           format: binary
 *           description: Archivo PDF a procesar
 * 
 *     ReporteUpdate:
 *       type: object
 *       properties:
 *         tipo_estudio:
 *           type: string
 *           example: "radiografia"
 *         fecha_estudio:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 *         contenido_extraido:
 *           type: string
 *           example: "Contenido extraído del PDF..."
 *         confianza_extraccion:
 *           type: number
 *           example: 0.95
 *         estado:
 *           type: string
 *           example: "completado"
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
