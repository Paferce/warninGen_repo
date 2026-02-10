// whatsapp_service.js - Servicio de envio de WhatsApp
require('dotenv').config();
const twilio = require('twilio');

// Configurar cliente de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
const contentSid = process.env.WHATSAPP_CONTENT_SID;

let client = null;

// Inicializar cliente solo si hay credenciales
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
    console.log('Cliente de Twilio WhatsApp inicializado');
    if (contentSid) {
        console.log('Content SID configurado:', contentSid);
    } else {
        console.log('Advertencia: WHATSAPP_CONTENT_SID no configurado');
    }
} else {
    console.log('Credenciales de Twilio no configuradas. WhatsApp deshabilitado.');
}

/**
 * Enviar mensaje de WhatsApp usando plantilla aprobada
 * @param {string} destinatario - Numero de WhatsApp (formato: +34666777888)
 * @param {string} mensaje - Mensaje (se ignora si se usa plantilla)
 * @returns {Promise<object>} - Resultado del envio
 */
async function enviarWhatsApp(destinatario, mensaje) {
    try {
        if (!client) {
            throw new Error('Cliente de Twilio no configurado');
        }

        const toNumber = `whatsapp:${destinatario}`;

        console.log('Intentando enviar WhatsApp a:', toNumber);

        let message;

        // Intentar con plantilla primero si existe
        if (contentSid) {
            console.log('Usando plantilla aprobada:', contentSid);
            try {
                // Twilio requiere que el 'from' tenga el prefijo 'whatsapp:' para mensajes de WhatsApp
                const fromNumber = twilioWhatsAppNumber.startsWith('whatsapp:') ? twilioWhatsAppNumber : `whatsapp:${twilioWhatsAppNumber}`;

                message = await client.messages.create({
                    contentSid: contentSid,
                    from: fromNumber,
                    to: toNumber
                });
                console.log('OK: WhatsApp enviado con plantilla:', message.sid);
            } catch (error) {
                console.error('ERROR: Con plantilla:', error.message);
                console.log('Intentando con texto libre como fallback...');

                const fromNumber = twilioWhatsAppNumber.startsWith('whatsapp:') ? twilioWhatsAppNumber : `whatsapp:${twilioWhatsAppNumber}`;

                // Fallback a texto libre
                message = await client.messages.create({
                    body: mensaje,
                    from: fromNumber,
                    to: toNumber
                });
                console.log('OK: WhatsApp enviado con texto libre (fallback):', message.sid);
            }
        } else {
            // Sin plantilla, usar texto libre
            console.log('Enviando con texto libre (sin plantilla)');
            const fromNumber = twilioWhatsAppNumber.startsWith('whatsapp:') ? twilioWhatsAppNumber : `whatsapp:${twilioWhatsAppNumber}`;

            message = await client.messages.create({
                body: mensaje,
                from: fromNumber,
                to: toNumber
            });
            console.log('OK: WhatsApp enviado:', message.sid);
        }

        return {
            success: true,
            messageId: message.sid,
            destinatario: destinatario,
            status: message.status
        };

    } catch (error) {
        console.error('ERROR AL ENVIAR WHATSAPP:');
        console.error('Destinatario:', destinatario);
        console.error('Error completo:', error);
        console.error('Codigo error:', error.code);
        console.error('Mensaje error:', error.message);

        return {
            success: false,
            error: error.message,
            errorCode: error.code,
            destinatario: destinatario
        };
    }
}

/**
 * Enviar WhatsApp a multiples destinatarios
 * @param {Array<string>} destinatarios - Array de numeros de WhatsApp
 * @param {string} mensaje - Mensaje del WhatsApp
 * @returns {Promise<object>} - Resumen del envio
 */
async function enviarWhatsAppMasivo(destinatarios, mensaje) {
    const resultados = {
        exitosos: 0,
        fallidos: 0,
        detalles: []
    };

    for (const destinatario of destinatarios) {
        const resultado = await enviarWhatsApp(destinatario, mensaje);

        if (resultado.success) {
            resultados.exitosos++;
        } else {
            resultados.fallidos++;
        }

        resultados.detalles.push(resultado);

        // Pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return resultados;
}

module.exports = {
    enviarWhatsApp,
    enviarWhatsAppMasivo
};