/**
 * Configuración de analytics y métricas para producción
 */

interface AnalyticsEvent {
    action: string;
    category: string;
    label?: string;
    value?: number;
}

class Analytics {
    private isProduction = process.env.NODE_ENV === "production";

    // Track eventos de usuario
    track(event: AnalyticsEvent) {
        if (!this.isProduction) {
            console.log("Analytics Event:", event);
            return;
        }

        // Enviar a Google Analytics, Mixpanel, etc.
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", event.action, {
                event_category: event.category,
                event_label: event.label,
                value: event.value,
            });
        }
    }

    // Track errores
    trackError(error: Error, context?: string) {
        this.track({
            action: "error",
            category: "javascript",
            label: context || "unknown",
        });

        // Enviar a Sentry si está configurado
        if (typeof window !== "undefined" && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, {
                tags: {
                    context: context || "unknown",
                },
            });
        }
    }

    // Track performance
    trackPerformance(metric: string, value: number) {
        this.track({
            action: "performance",
            category: "timing",
            label: metric,
            value: Math.round(value),
        });
    }

    // Track conversiones
    trackConversion(conversion: string, value?: number) {
        this.track({
            action: "conversion",
            category: "business",
            label: conversion,
            value: value,
        });
    }
}

export const analytics = new Analytics();
export default analytics;
