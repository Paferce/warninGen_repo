// check_twilio_logs.js - Revisar logs de mensajes de Twilio
require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function checkLogs() {
    console.log('=== ÚLTIMOS 5 MENSAJES DE TWILIO ===\n');

    try {
        const messages = await client.messages.list({ limit: 5 });

        for (const msg of messages) {
            console.log(`SID: ${msg.sid}`);
            console.log(`Estado: ${msg.status}`);
            console.log(`Para: ${msg.to}`);
            console.log(`De: ${msg.from}`);
            console.log(`Fecha: ${msg.dateCreated}`);

            if (msg.errorCode) {
                console.log(`❌ ERROR CODE: ${msg.errorCode}`);
                console.log(`❌ ERROR MESSAGE: ${msg.errorMessage}`);
            } else {
                console.log(`✅ Sin errores`);
            }

            console.log('---\n');
        }
    } catch (error) {
        console.error('Error al obtener logs:', error.message);
    }
}

checkLogs();
