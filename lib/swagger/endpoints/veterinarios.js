/**
 * @swagger
 * /api/veterinarios:
 *   get:
 *     summary: Obtener lista de veterinarios
 *     description: Retorna todos los veterinarios registrados en el sistema
 *     tags: [Veterinarios]
 *     responses:
 *       200:
 *         description: Lista de veterinarios obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Veterinario'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/veterinarios/{id}:
 *   get:
 *     summary: Obtener veterinario por ID
 *     description: Retorna un veterinario específico por su ID
 *     tags: [Veterinarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del veterinario
 *     responses:
 *       200:
 *         description: Veterinario encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Veterinario'
 *       404:
 *         description: Veterinario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   put:
 *     summary: Actualizar veterinario
 *     description: Actualiza la información de un veterinario existente
 *     tags: [Veterinarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del veterinario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VeterinarioUpdate'
 *     responses:
 *       200:
 *         description: Veterinario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Veterinario'
 *       404:
 *         description: Veterinario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   delete:
 *     summary: Eliminar veterinario
 *     description: Elimina un veterinario del sistema
 *     tags: [Veterinarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del veterinario
 *     responses:
 *       200:
 *         description: Veterinario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Veterinario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * components:
 *   schemas:
 *     Veterinario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         nombre:
 *           type: string
 *           example: "Dr. Juan Pérez"
 *         apellido:
 *           type: string
 *           example: "García"
 *         matricula:
 *           type: string
 *           example: "MP-12345"
 *         especializacion:
 *           type: string
 *           example: "Cirugía"
 *         clinica:
 *           type: string
 *           example: "Clínica Veterinaria Central"
 *         email:
 *           type: string
 *           example: "juan.perez@clinica.com"
 *         telefono:
 *           type: string
 *           example: "+54 9 11 1234-5678"
 *         direccion:
 *           type: string
 *           example: "Av. Corrientes 1234, CABA"
 *         horario:
 *           type: string
 *           example: "Lunes a Viernes 9:00-18:00"
 *         activo:
 *           type: boolean
 *           example: true
 *         creado_en:
 *           type: string
 *           format: date-time
 *           example: "2025-09-21T10:00:00Z"
 * 
 *     VeterinarioUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Dr. Juan Carlos"
 *         apellido:
 *           type: string
 *           example: "García"
 *         matricula:
 *           type: string
 *           example: "MP-12345"
 *         especializacion:
 *           type: string
 *           example: "Cirugía"
 *         clinica:
 *           type: string
 *           example: "Clínica Veterinaria Central"
 *         email:
 *           type: string
 *           example: "juan.perez@clinica.com"
 *         telefono:
 *           type: string
 *           example: "+54 9 11 1234-5678"
 *         direccion:
 *           type: string
 *           example: "Av. Corrientes 1234, CABA"
 *         horario:
 *           type: string
 *           example: "Lunes a Viernes 9:00-18:00"
 *         activo:
 *           type: boolean
 *           example: true
 */
