/**
 * Validadores de seguridad para datos de entrada
 */

import Joi from "joi";

// Esquemas de validación
export const schemas = {
    // Validación de archivos
    fileUpload: Joi.object({
        filename: Joi.string().max(255).required(),
        mimetype: Joi.string().valid(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif"
        ).required(),
        size: Joi.number().max(10 * 1024 * 1024).required(), // 10MB
    }),

    // Validación de reportes
    reporte: Joi.object({
        tipo_estudio: Joi.string().valid(
            "radiografia",
            "ecografia",
            "analisis",
            "consulta",
            "otro"
        ).required(),
        especie: Joi.string().valid(
            "canino",
            "felino",
            "equino",
            "bovino",
            "porcino",
            "otro"
        ).required(),
        veterinario_id: Joi.string().uuid().required(),
        paciente_id: Joi.string().uuid().required(),
        observaciones: Joi.string().max(5000).optional(),
    }),

    // Validación de turnos
    turno: Joi.object({
        fecha_hora: Joi.date().iso().required(),
        veterinario_id: Joi.string().uuid().required(),
        paciente_id: Joi.string().uuid().required(),
        tipo_consulta: Joi.string().max(100).required(),
        notas: Joi.string().max(1000).optional(),
        precio: Joi.number().min(0).optional(),
    }),

    // Validación de pacientes
    paciente: Joi.object({
        nombre: Joi.string().max(200).required(),
        especie: Joi.string().valid(
            "canino",
            "felino",
            "equino",
            "bovino",
            "porcino",
            "otro"
        ).required(),
        raza: Joi.string().max(100).optional(),
        edad: Joi.string().max(50).optional(),
        sexo: Joi.string().valid("macho", "hembra", "desconocido").optional(),
        peso: Joi.number().min(0).max(1000).optional(),
        tutor_nombre: Joi.string().max(200).required(),
        tutor_telefono: Joi.string().max(50).optional(),
        tutor_email: Joi.string().email().max(200).optional(),
    }),

    // Validación de veterinarios
    veterinario: Joi.object({
        nombre: Joi.string().max(100).required(),
        apellido: Joi.string().max(100).required(),
        email: Joi.string().email().max(200).required(),
        matricula: Joi.string().max(50).required(),
        especializacion: Joi.string().max(100).optional(),
        clinica: Joi.string().max(200).optional(),
        telefono: Joi.string().max(50).optional(),
    }),

    // Validación de mensajes del chatbot
    mensajeChatbot: Joi.object({
        mensaje: Joi.string().max(1000).required(),
        sesion_id: Joi.string().uuid().optional(),
        contexto: Joi.string().max(500).optional(),
    }),
};

// Función para validar datos
export function validateData<T>(schema: Joi.ObjectSchema, data: unknown): T {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        throw new Error(`Datos inválidos: ${error.details.map(d => d.message).join(", ")}`);
    }

    return value as T;
}

// Función para sanitizar strings
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, "") // Remover caracteres HTML básicos
        .replace(/javascript:/gi, "") // Remover javascript:
        .replace(/on\w+=/gi, ""); // Remover event handlers
}

// Función para validar email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar UUID
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export default schemas;
