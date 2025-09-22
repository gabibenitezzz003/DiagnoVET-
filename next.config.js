/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Vercel
  output: 'standalone',

  // Configuración de imágenes
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true, // Para Vercel
  },

  // Configuración experimental
  experimental: {
    esmExternals: 'loose',
  },

  // Configuración de webpack
  webpack: (config, { isServer }) => {
    // Resolver conflictos de dependencias
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Configurar pdfjs-dist para funcionar en el navegador
    config.resolve.alias['pdfjs-dist/build/pdf.worker.entry'] = 'pdfjs-dist/build/pdf.worker.min.js';

    // Manejar módulos de Node.js que no están disponibles en el navegador
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
      buffer: false,
    };

    // Configuración para Vercel
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    return config;
  },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
