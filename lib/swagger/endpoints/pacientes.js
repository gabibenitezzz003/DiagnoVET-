/**
 * @swagger
 * /api/pacientes:
 *   get:
 *     summary: Obtener lista de pacientes
 *     description: Retorna todos los pacientes registrados en el sistema
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Lista de pacientes obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Paciente'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   post:
 *     summary: Crear nuevo paciente
 *     description: Registra un nuevo paciente en el sistema
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PacienteCreate'
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Paciente'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/pacientes/{id}:
 *   get:
 *     summary: Obtener paciente por ID
 *     description: Retorna un paciente específico por su ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del paciente
 *     responses:
 *       200:
 *         description: Paciente encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Paciente'
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   put:
 *     summary: Actualizar paciente
 *     description: Actualiza la información de un paciente existente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PacienteUpdate'
 *     responses:
 *       200:
 *         description: Paciente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Paciente'
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   delete:
 *     summary: Eliminar paciente
 *     description: Elimina un paciente del sistema
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del paciente
 *     responses:
 *       200:
 *         description: Paciente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * components:
 *   schemas:
 *     Paciente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         nombre:
 *           type: string
 *           example: "Max"
 *         especie:
 *           type: string
 *           example: "canino"
 *         raza:
 *           type: string
 *           example: "Golden Retriever"
 *         sexo:
 *           type: string
 *           example: "macho"
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "2020-05-15"
 *         peso:
 *           type: number
 *           example: 25.5
 *         color:
 *           type: string
 *           example: "dorado"
 *         tutor_nombre:
 *           type: string
 *           example: "María González"
 *         tutor_telefono:
 *           type: string
 *           example: "+54 9 11 9876-5432"
 *         tutor_email:
 *           type: string
 *           example: "maria.gonzalez@email.com"
 *         tutor_direccion:
 *           type: string
 *           example: "Av. Santa Fe 1234, CABA"
 *         historial_medico:
 *           type: string
 *           example: "Vacunado, desparasitado"
 *         alergias:
 *           type: string
 *           example: "Ninguna conocida"
 *         activo:
 *           type: boolean
 *           example: true
 *         creado_en:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 * 
 *     PacienteCreate:
 *       type: object
 *       required:
 *         - nombre
 *         - especie
 *         - raza
 *         - sexo
 *         - tutor_nombre
 *         - tutor_telefono
 *         - tutor_email
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Max"
 *         especie:
 *           type: string
 *           example: "canino"
 *         raza:
 *           type: string
 *           example: "Golden Retriever"
 *         sexo:
 *           type: string
 *           example: "macho"
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "2020-05-15"
 *         peso:
 *           type: number
 *           example: 25.5
 *         color:
 *           type: string
 *           example: "dorado"
 *         tutor_nombre:
 *           type: string
 *           example: "María González"
 *         tutor_telefono:
 *           type: string
 *           example: "+54 9 11 9876-5432"
 *         tutor_email:
 *           type: string
 *           example: "maria.gonzalez@email.com"
 *         tutor_direccion:
 *           type: string
 *           example: "Av. Santa Fe 1234, CABA"
 *         historial_medico:
 *           type: string
 *           example: "Vacunado, desparasitado"
 *         alergias:
 *           type: string
 *           example: "Ninguna conocida"
 * 
 *     PacienteUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Max"
 *         especie:
 *           type: string
 *           example: "canino"
 *         raza:
 *           type: string
 *           example: "Golden Retriever"
 *         sexo:
 *           type: string
 *           example: "macho"
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "2020-05-15"
 *         peso:
 *           type: number
 *           example: 25.5
 *         color:
 *           type: string
 *           example: "dorado"
 *         tutor_nombre:
 *           type: string
 *           example: "María González"
 *         tutor_telefono:
 *           type: string
 *           example: "+54 9 11 9876-5432"
 *         tutor_email:
 *           type: string
 *           example: "maria.gonzalez@email.com"
 *         tutor_direccion:
 *           type: string
 *           example: "Av. Santa Fe 1234, CABA"
 *         historial_medico:
 *           type: string
 *           example: "Vacunado, desparasitado"
 *         alergias:
 *           type: string
 *           example: "Ninguna conocida"
 *         activo:
 *           type: boolean
 *           example: true
 */
