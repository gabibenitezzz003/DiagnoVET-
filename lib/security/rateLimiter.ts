/**
 * Rate Limiter para protección contra ataques DDoS
 */

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message: string;
}

class RateLimiter {
    private requests: Map<string, { count: number; resetTime: number }> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
    }

    isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        // Limpiar entradas expiradas
        for (const [key, value] of this.requests.entries()) {
            if (value.resetTime < now) {
                this.requests.delete(key);
            }
        }

        const current = this.requests.get(identifier);

        if (!current) {
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + this.config.windowMs,
            });

            return {
                allowed: true,
                remaining: this.config.maxRequests - 1,
                resetTime: now + this.config.windowMs,
            };
        }

        if (current.count >= this.config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: current.resetTime,
            };
        }

        current.count++;
        return {
            allowed: true,
            remaining: this.config.maxRequests - current.count,
            resetTime: current.resetTime,
        };
    }
}

// Configuraciones por tipo de endpoint
export const rateLimiters = {
    api: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 100,
        message: "Demasiadas solicitudes, intenta más tarde",
    }),

    auth: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 5,
        message: "Demasiados intentos de autenticación",
    }),

    upload: new RateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hora
        maxRequests: 10,
        message: "Límite de subida de archivos excedido",
    }),

    chatbot: new RateLimiter({
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 20,
        message: "Demasiados mensajes al chatbot",
    }),
};

export default rateLimiters;
