'use client';

import { useEffect, useState } from 'react';

export default function SwaggerPage() {
  const [swaggerHtml, setSwaggerHtml] = useState('');

  useEffect(() => {
    // Cargar Swagger UI
    const loadSwagger = async () => {
      try {
        const response = await fetch('/api/swagger');
        const html = await response.text();
        setSwaggerHtml(html);
      } catch (error) {
        console.error('Error loading Swagger:', error);
        setSwaggerHtml(`
          <div style="padding: 20px; text-align: center;">
            <h1>Error al cargar la documentación de la API</h1>
            <p>Por favor, asegúrate de que el servidor esté ejecutándose.</p>
          </div>
        `);
      }
    };

    loadSwagger();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">DiagnoVET API Documentation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                API v1.0.0
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Supabase Connected
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div 
            className="swagger-ui-container"
            dangerouslySetInnerHTML={{ __html: swaggerHtml }}
          />
        </div>
      </div>
    </div>
  );
}
