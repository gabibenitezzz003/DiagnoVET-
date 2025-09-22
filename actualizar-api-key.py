#!/usr/bin/env python3
"""
Script para actualizar la API key de Gemini
"""

import os
import shutil

def actualizar_api_key():
    """Actualiza la API key de Gemini en todos los archivos necesarios"""
    print("🔑 ACTUALIZADOR DE API KEY DE GEMINI")
    print("=" * 50)
    
    # Solicitar nueva API key
    nueva_api_key = input("Ingresa tu nueva API key de Gemini: ").strip()
    
    if not nueva_api_key:
        print("❌ No se ingresó una API key válida")
        return
    
    print(f"✅ API key recibida: {nueva_api_key[:10]}...")
    
    # Archivos a actualizar
    archivos = [
        '.env',
        'backend/.env',
        '.env.local'
    ]
    
    for archivo in archivos:
        if os.path.exists(archivo):
            print(f"📝 Actualizando {archivo}...")
            
            # Leer archivo actual
            with open(archivo, 'r', encoding='utf-8') as f:
                contenido = f.read()
            
            # Actualizar o agregar la API key
            if 'NEXT_PUBLIC_GEMINI_API_KEY' in contenido:
                # Reemplazar línea existente
                lineas = contenido.split('\n')
                nuevas_lineas = []
                for linea in lineas:
                    if linea.startswith('NEXT_PUBLIC_GEMINI_API_KEY'):
                        nuevas_lineas.append(f'NEXT_PUBLIC_GEMINI_API_KEY={nueva_api_key}')
                    else:
                        nuevas_lineas.append(linea)
                contenido = '\n'.join(nuevas_lineas)
            else:
                # Agregar nueva línea
                contenido += f'\nNEXT_PUBLIC_GEMINI_API_KEY={nueva_api_key}\n'
            
            # Escribir archivo actualizado
            with open(archivo, 'w', encoding='utf-8') as f:
                f.write(contenido)
            
            print(f"✅ {archivo} actualizado")
        else:
            print(f"⚠️ {archivo} no encontrado, creando...")
            
            # Crear archivo con la API key
            with open(archivo, 'w', encoding='utf-8') as f:
                f.write(f'NEXT_PUBLIC_GEMINI_API_KEY={nueva_api_key}\n')
            
            print(f"✅ {archivo} creado")
    
    print("\n🎉 API key actualizada en todos los archivos")
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. Reinicia el backend: cd backend && python -m uvicorn main:app --reload --port 8000")
    print("2. Prueba el sistema: python test-simple-flow.py")
    print("3. Verifica que funcione: python test-radiografia.py")

if __name__ == "__main__":
    actualizar_api_key()
