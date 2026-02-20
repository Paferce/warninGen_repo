// test_whatsapp.js - Script de prueba para enviar WhatsApp
require('dotenv').config();
const { enviarWhatsApp } = require('./whatsapp_service');

async function testWhatsApp() {
    console.log('=== PRUEBA DE ENVÍO DE WHATSAPP ===');
    console.log('Número de destino: +34609173611');
    console.log('Mensaje: Mensaje de prueba desde el servidor');
    console.log('');

    try {
        const resultado = await enviarWhatsApp('+34609173611', 'Mensaje de prueba desde el servidor');
        console.log('');
        console.log('=== RESULTADO ===');
        console.log(JSON.stringify(resultado, null, 2));
    } catch (error) {
        console.error('');
        console.error('=== ERROR ===');
        console.error(error);
    }
}

testWhatsApp();
