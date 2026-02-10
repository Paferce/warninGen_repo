// sms_service.js - Servicio de envío de SMS usando Twilio
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Verificar configuración
if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('ADVERTENCIA: Configuracion de Twilio incompleta en .env');
    console.error('   Necesitas: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
} else {
    console.log('OK: Twilio SMS configurado con numero:', twilioPhoneNumber);
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;
if (client) {
    console.log('START: Cliente de Twilio SMS inicializado correctamente');
} else {
    console.error('ERROR: Al inicializar cliente de Twilio SMS');
}

/**
 * Enviar SMS usando Twilio
 * @param {string} telefono - Número de teléfono destino (formato internacional: +34...)
 * @param {string} mensaje - Mensaje a enviar
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function enviarSMS(telefono, mensaje) {
    try {
        if (!client) {
            console.error('ERROR: Cliente de Twilio no inicializado');
            return {
                success: false,
                error: 'Servicio de SMS no configurado'
            };
        }

        if (!telefono || !mensaje) {
            return {
                success: false,
                error: 'Teléfono y mensaje son requeridos'
            };
        }

        // Validar formato de teléfono (debe empezar con +)
        if (!telefono.startsWith('+')) {
            return {
                success: false,
                error: 'El número de teléfono debe estar en formato internacional (+34...)'
            };
        }

        console.log(`SMS: Enviando SMS a ${telefono}...`);

        const message = await client.messages.create({
            body: mensaje,
            from: twilioPhoneNumber,
            to: telefono
        });

        console.log(`OK: SMS enviado correctamente. SID: ${message.sid}`);

        return {
            success: true,
            messageId: message.sid,
            status: message.status
        };

    } catch (error) {
        console.error('ERROR: ERROR DETALLADO AL ENVIAR SMS:');
        console.error('   Código:', error.code);
        console.error('   Mensaje:', error.message);
        console.error('   Más info:', error.moreInfo);

        // Errores comunes de Twilio
        let errorMessage = error.message;

        if (error.code === 21211) {
            errorMessage = 'Número de teléfono inválido';
        } else if (error.code === 21408) {
            errorMessage = 'El país de destino no está permitido en esta cuenta';
        } else if (error.code === 21608) {
            errorMessage = 'Número de teléfono no verificado (necesario en cuentas de prueba)';
        } else if (error.code === 21614) {
            errorMessage = 'Número de teléfono no puede recibir SMS';
        }

        return {
            success: false,
            error: errorMessage,
            code: error.code,
            fullError: error
        };
    }
}

/**
 * Enviar SMS a multiples destinatarios
 * @param {Array<string>} destinatarios - Array de numeros de telefono
 * @param {string} mensaje - Mensaje a enviar
 * @returns {Promise<object>} - Resumen del envio
 */
async function enviarSMSMasivo(destinatarios, mensaje) {
    const resultados = {
        exitosos: 0,
        fallidos: 0,
        detalles: []
    };

    for (const telefono of destinatarios) {
        const resultado = await enviarSMS(telefono, mensaje);

        if (resultado.success) {
            resultados.exitosos++;
        } else {
            resultados.fallidos++;
        }

        resultados.detalles.push(resultado);

        // Pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return resultados;
}

/**
 * Verificar si el servicio de SMS está disponible
 * @returns {boolean}
 */
function isAvailable() {
    return client !== null;
}

module.exports = {
    enviarSMS,
    enviarSMSMasivo,
    isAvailable
};
