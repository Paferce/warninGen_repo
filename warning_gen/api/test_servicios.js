require('dotenv').config();
const fs = require('fs');

console.log('=== VERIFICACION DE SERVICIOS ===\n');

// Verificar archivos
console.log('Archivos:');
console.log('sms_service.js existe:', fs.existsSync('./services/sms_service.js'));
console.log('whatsapp_service.js existe:', fs.existsSync('./services/whatsapp_service.js'));
console.log('');

// Intentar importar
console.log('Importando servicios...');
try {
    const smsService = require('./services/sms_service');
    console.log('SMS Service: OK');
    console.log('Funciones:', Object.keys(smsService));
} catch(e) {
    console.log('SMS Service: ERROR -', e.message);
}

try {
    const whatsappService = require('./services/whatsapp_service');
    console.log('WhatsApp Service: OK');
    console.log('Funciones:', Object.keys(whatsappService));
} catch(e) {
    console.log('WhatsApp Service: ERROR -', e.message);
}

console.log('\n=== PRUEBA DE ENVIO ===\n');

async function testEnvio() {
    try {
        const smsService = require('./services/sms_service');
        console.log('Probando SMS a +34666777888...');
        const resultado = await smsService.enviarSMS('+34666777888', 'Test desde sistema');
        console.log('Resultado SMS:', resultado);
    } catch(e) {
        console.log('Error SMS:', e.message);
        console.log('Stack:', e.stack);
    }
    
    try {
        const whatsappService = require('./services/whatsapp_service');
        console.log('\nProbando WhatsApp a +34666777888...');
        const resultado = await whatsappService.enviarWhatsApp('+34666777888', 'Test WhatsApp');
        console.log('Resultado WhatsApp:', resultado);
    } catch(e) {
        console.log('Error WhatsApp:', e.message);
        console.log('Stack:', e.stack);
    }
}

testEnvio();
