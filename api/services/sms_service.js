// services/sms.service.js - Servicio de envÃ­o de SMS
require('dotenv').config();
const twilio = require('twilio');

// Configurar cliente de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

// Inicializar cliente solo si hay credenciales
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
    console.log('âœ… Cliente de Twilio SMS inicializado');
} else {
    console.log('âš ï¸  Credenciales de Twilio no configuradas. SMS deshabilitado.');
}

/**
 * Enviar SMS
 * @param {string} destinatario - NÃºmero de telÃ©fono (formato: +34666777888)
 * @param {string} mensaje - Mensaje a enviar
 * @param {object} variables - Variables para sustituir en el mensaje
 * @returns {Promise<object>} - Resultado del envÃ­o
 */
async function enviarSMS(destinatario, mensaje, variables = {}) {
    try {
        if (!client) {
            throw new Error('Cliente de Twilio no configurado');
        }
        
        // Sustituir variables en el mensaje
        let mensajeFinal = mensaje;
        
        // Reemplazar cada variable {{variable}} con su valor
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            mensajeFinal = mensajeFinal.replace(regex, value);
        }
        
        // Limitar longitud del SMS (160 caracteres estÃ¡ndar)
        if (mensajeFinal.length > 160) {
            console.log(`âš ï¸  Mensaje de ${mensajeFinal.length} caracteres (se enviarÃ¡ como SMS mÃºltiple)`);
        }
        
        // Enviar SMS
        const message = await client.messages.create({
            body: mensajeFinal,
            from: twilioPhoneNumber,
            to: destinatario
        });
        
        console.log('âœ… SMS enviado:', message.sid);
        
        return {
            success: true,
            messageId: message.sid,
            destinatario: destinatario,
            status: message.status
        };
        
    } catch (error) {
        console.error('âŒ Error al enviar SMS:', error.message);
        return {
            success: false,
            error: error.message,
            destinatario: destinatario
        };
    }
}

/**
 * Enviar SMS a mÃºltiples destinatarios
 * @param {Array<string>} destinatarios - Array de nÃºmeros de telÃ©fono
 * @param {string} mensaje - Mensaje del SMS
 * @param {object} variables - Variables comunes para todos
 * @returns {Promise<object>} - Resumen del envÃ­o
 */
async function enviarSMSMasivo(destinatarios, mensaje, variables = {}) {
    const resultados = {
        exitosos: 0,
        fallidos: 0,
        detalles: []
    };
    
    // Enviar a cada destinatario
    for (const destinatario of destinatarios) {
        const resultado = await enviarSMS(destinatario, mensaje, variables);
        
        if (resultado.success) {
            resultados.exitosos++;
        } else {
            resultados.fallidos++;
        }
        
        resultados.detalles.push(resultado);
        
        // PequeÃ±a pausa entre envÃ­os
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return resultados;
}

/**
 * Verificar formato de nÃºmero de telÃ©fono
 * @param {string} numero - NÃºmero a verificar
 * @returns {boolean} - True si es vÃ¡lido
 */
function validarNumeroTelefono(numero) {
    // Debe empezar con + y tener entre 10 y 15 dÃ­gitos
    const regex = /^\+[1-9]\d{9,14}$/;
    return regex.test(numero);
}

module.exports = {
    enviarSMS,
    enviarSMSMasivo,
    validarNumeroTelefono
};