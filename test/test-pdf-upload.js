/**
 * Script de prueba para subida de PDFs a Google Drive
 * Ejecutar con: node test/test-pdf-upload.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

console.log('🧪 PROBANDO SUBIDA DE PDF A GOOGLE DRIVE');
console.log('==========================================\n');

// Crear un PDF de prueba simple
function createTestPDF() {
    const testPDFContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF DiagnoVET) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

    const testPDFPath = path.join(__dirname, 'test-document.pdf');
    fs.writeFileSync(testPDFPath, testPDFContent);
    return testPDFPath;
}

async function testPDFUpload() {
    try {
        console.log('📄 Creando PDF de prueba...');
        const testPDFPath = createTestPDF();
        console.log('✅ PDF de prueba creado:', testPDFPath);

        console.log('\n🔄 Probando endpoint de procesamiento de reportes...');

        // Crear FormData
        const formData = new FormData();
        formData.append('archivo', fs.createReadStream(testPDFPath), {
            filename: 'test-document.pdf',
            contentType: 'application/pdf'
        });

        // Enviar a la API
        const response = await fetch('http://localhost:8000/api/reportes/procesar', {
            method: 'POST',
            body: formData
        });

        console.log('📡 Status:', response.status);
        console.log('📡 Status Text:', response.statusText);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Respuesta exitosa:', JSON.stringify(result, null, 2));

            if (result.exito) {
                console.log('\n🎉 ¡PDF procesado exitosamente!');
                console.log('📊 Datos extraídos:', result.datos);

                if (result.datos.googleDriveUrl) {
                    console.log('🔗 URL de Google Drive:', result.datos.googleDriveUrl);
                }
            } else {
                console.log('❌ Error en el procesamiento:', result.error);
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Error en la respuesta:', errorText);
        }

    } catch (error) {
        console.error('❌ Error al probar subida de PDF:', error.message);
    } finally {
        // Limpiar archivo de prueba
        try {
            const testPDFPath = path.join(__dirname, 'test-document.pdf');
            if (fs.existsSync(testPDFPath)) {
                fs.unlinkSync(testPDFPath);
                console.log('🧹 Archivo de prueba eliminado');
            }
        } catch (cleanupError) {
            console.log('⚠️ Error al limpiar archivo de prueba:', cleanupError.message);
        }
    }
}

async function testGoogleDriveConnection() {
    console.log('\n🔍 Verificando conexión con Google Drive...');

    try {
        const response = await fetch('http://localhost:8000/api/archivos/test-google-drive', {
            method: 'GET'
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Conexión con Google Drive:', result);
        } else {
            console.log('❌ Error al conectar con Google Drive:', response.status);
        }
    } catch (error) {
        console.log('❌ Error al verificar Google Drive:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Iniciando pruebas de PDF...\n');

    // Verificar conexión con Google Drive
    await testGoogleDriveConnection();

    // Probar subida de PDF
    await testPDFUpload();

    console.log('\n✅ Pruebas completadas');
}

// Ejecutar pruebas
runTests().catch(console.error);
