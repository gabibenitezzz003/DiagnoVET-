/**
 * Configuración de Sentry para monitoreo de errores
 */

// import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
    // Sentry.init({
    //     dsn: SENTRY_DSN,
    //     environment: process.env.NODE_ENV,
    //     tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    //     debug: process.env.NODE_ENV === "development",
    //     beforeSend(event) {
    //         // Filtrar eventos sensibles
    //         if (event.exception) {
    //             const error = event.exception.values?.[0];
    //             if (error?.value?.includes("password") || error?.value?.includes("token")) {
    //                 return null;
    //             }
    //         }
    //         return event;
    //     },
    //     integrations: [
    //         new Sentry.BrowserTracing({
    //             // Configurar tracing para rutas específicas
    //             routingInstrumentation: Sentry.nextjsRouterInstrumentation,
    //         }),
    //     ],
    // });
}

// export default Sentry;
