/**
 * @swagger
 * /api/turnos:
 *   get:
 *     summary: Obtener lista de turnos
 *     description: Retorna todos los turnos registrados en el sistema
 *     tags: [Turnos]
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Turno'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   post:
 *     summary: Crear nuevo turno
 *     description: Registra un nuevo turno en el sistema y lo sincroniza con Google Calendar
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoCreate'
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Turno'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/turnos/{id}:
 *   get:
 *     summary: Obtener turno por ID
 *     description: Retorna un turno específico por su ID
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del turno
 *     responses:
 *       200:
 *         description: Turno encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Turno'
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   put:
 *     summary: Actualizar turno
 *     description: Actualiza un turno existente y lo sincroniza con Google Calendar
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoUpdate'
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Turno'
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   delete:
 *     summary: Eliminar turno
 *     description: Elimina un turno del sistema y lo cancela en Google Calendar
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del turno
 *     responses:
 *       200:
 *         description: Turno eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/turnos/calendario:
 *   get:
 *     summary: Obtener turnos por rango de fechas
 *     description: Retorna turnos dentro de un rango de fechas específico
 *     tags: [Turnos]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango
 *     responses:
 *       200:
 *         description: Turnos obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/Turno'
 *       400:
 *         description: Parámetros de fecha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * components:
 *   schemas:
 *     Turno:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         paciente_nombre:
 *           type: string
 *           example: "Max"
 *         paciente_especie:
 *           type: string
 *           example: "canino"
 *         paciente_raza:
 *           type: string
 *           example: "Golden Retriever"
 *         tutor_nombre:
 *           type: string
 *           example: "María González"
 *         tutor_email:
 *           type: string
 *           example: "maria.gonzalez@email.com"
 *         tutor_telefono:
 *           type: string
 *           example: "+54 9 11 9876-5432"
 *         veterinario_id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         veterinario_nombre:
 *           type: string
 *           example: "Dr. Juan Pérez"
 *         tipo_consulta:
 *           type: string
 *           example: "consulta_general"
 *         fecha_hora:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T14:00:00Z"
 *         duracion_minutos:
 *           type: integer
 *           example: 30
 *         estado:
 *           type: string
 *           example: "programado"
 *         notas:
 *           type: string
 *           example: "Primera consulta de rutina"
 *         precio:
 *           type: number
 *           example: 5000
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 * 
 *     TurnoCreate:
 *       type: object
 *       required:
 *         - paciente_nombre
 *         - paciente_especie
 *         - paciente_raza
 *         - tutor_nombre
 *         - tutor_email
 *         - tutor_telefono
 *         - veterinario_id
 *         - tipo_consulta
 *         - fecha_hora
 *         - duracion_minutos
 *       properties:
 *         paciente_nombre:
 *           type: string
 *           example: "Max"
 *         paciente_especie:
 *           type: string
 *           example: "canino"
 *         paciente_raza:
 *           type: string
 *           example: "Golden Retriever"
 *         tutor_nombre:
 *           type: string
 *           example: "María González"
 *         tutor_email:
 *           type: string
 *           example: "maria.gonzalez@email.com"
 *         tutor_telefono:
 *           type: string
 *           example: "+54 9 11 9876-5432"
 *         veterinario_id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         tipo_consulta:
 *           type: string
 *           example: "consulta_general"
 *         fecha_hora:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T14:00:00Z"
 *         duracion_minutos:
 *           type: integer
 *           example: 30
 *         notas:
 *           type: string
 *           example: "Primera consulta de rutina"
 *         precio:
 *           type: number
 *           example: 5000
 * 
 *     TurnoUpdate:
 *       type: object
 *       properties:
 *         paciente_nombre:
 *           type: string
 *           example: "Max"
 *         paciente_especie:
 *           type: string
 *           example: "canino"
 *         paciente_raza:
 *           type: string
 *           example: "Golden Retriever"
 *         tutor_nombre:
 *           type: string
 *           example: "María González"
 *         tutor_email:
 *           type: string
 *           example: "maria.gonzalez@email.com"
 *         tutor_telefono:
 *           type: string
 *           example: "+54 9 11 9876-5432"
 *         veterinario_id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         tipo_consulta:
 *           type: string
 *           example: "consulta_general"
 *         fecha_hora:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T14:00:00Z"
 *         duracion_minutos:
 *           type: integer
 *           example: 30
 *         estado:
 *           type: string
 *           example: "confirmado"
 *         notas:
 *           type: string
 *           example: "Primera consulta de rutina"
 *         precio:
 *           type: number
 *           example: 5000
 */
