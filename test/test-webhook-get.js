console.log('🔧 PROBANDO WEBHOOK CON GET');
console.log('===========================');

const WEBHOOK_URL = 'https://diagnovet.app.n8n.cloud/webhook/turnos';

async function probarWebhookGET() {
  try {
    console.log('🔄 Probando conexión con webhook usando GET...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);
    } else {
      console.log('❌ Error en respuesta:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('📄 Detalles del error:', errorText);
    }

  } catch (error) {
    console.error('❌ Error al probar webhook:', error);
  }
}

// Ejecutar prueba
probarWebhookGET();

console.log('\n✅ INFORMACIÓN DEL WEBHOOK:');
console.log('==========================');
console.log('   📡 URL: https://diagnovet.app.n8n.cloud/webhook/turnos');
console.log('   🔄 Método: GET (por defecto)');
console.log('   📋 Path: /turnos');
console.log('   🎯 Webhook ID: d21a1770-6da7-4869-b316-3be80b202eba');

console.log('\n✅ CONFIGURACIÓN DEL WORKFLOW:');
console.log('=============================');
console.log('   📝 Nombre: calendario_diagnovet++');
console.log('   🔗 Nodo: Webhook Turnos');
console.log('   🔄 Tipo: n8n-nodes-base.webhook');
console.log('   📋 Path: turnos');
console.log('   ⚙️ Opciones: {}');

console.log('\n✅ FLUJO DEL WORKFLOW:');
console.log('=====================');
console.log('   1. Webhook Turnos recibe petición');
console.log('   2. Tipo de Evento (Switch) procesa datos');
console.log('   3. Google Calendar - Crear evento');
console.log('   4. Email - Enviar confirmación');
console.log('   5. Supabase - Actualizar base de datos');

console.log('\n✅ DATOS ESPERADOS:');
console.log('==================');
console.log('   📋 Query parameters o body');
console.log('   🔑 id: string');
console.log('   🔑 tipo_evento: crear/modificar/cancelar');
console.log('   🔑 fecha_hora: ISO string');
console.log('   🔑 tutor: string');
console.log('   🔑 email_tutor: string');
console.log('   🔑 paciente: string');
console.log('   🔑 tipo_consulta: string');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('=====================');
console.log('   ✅ Respuesta 200 OK');
console.log('   ✅ Workflow iniciado');
console.log('   ✅ Evento creado en Google Calendar');
console.log('   ✅ Email enviado');
console.log('   ✅ Supabase actualizado');
