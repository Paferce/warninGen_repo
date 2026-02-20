// email_service.js - Servicio de envio de emails
require('dotenv').config();
const nodemailer = require('nodemailer');

// Configurar el transportador SMTP usando Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar la configuracion del transportador
transporter.verify(function(error, success) {
    if (error) {
        console.log('Error en configuracion de email:', error);
    } else {
        console.log('Servidor de email listo para enviar mensajes');
    }
});

/**
 * Enviar email
 * @param {string} destinatario - Email del destinatario
 * @param {string} asunto - Asunto del email
 * @param {string} mensaje - Cuerpo del mensaje (puede ser HTML)
 * @returns {Promise<object>} - Resultado del envio
 */
async function enviarEmail(destinatario, asunto, mensaje) {
    try {
        // Configurar el email
        const mailOptions = {
            from: `"Sistema de Alertas" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            html: mensaje.replace(/\n/g, '<br>'),
            text: mensaje
        };
        
        // Enviar el email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email enviado:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            destinatario: destinatario
        };
        
    } catch (error) {
        console.error('Error al enviar email:', error);
        return {
            success: false,
            error: error.message,
            destinatario: destinatario
        };
    }
}

/**
 * Enviar email a multiples destinatarios
 * @param {Array<string>} destinatarios - Array de emails
 * @param {string} asunto - Asunto del email
 * @param {string} mensaje - Mensaje del email
 * @returns {Promise<object>} - Resumen del envio
 */
async function enviarEmailMasivo(destinatarios, asunto, mensaje) {
    const resultados = {
        exitosos: 0,
        fallidos: 0,
        detalles: []
    };
    
    // Enviar a cada destinatario
    for (const destinatario of destinatarios) {
        const resultado = await enviarEmail(destinatario, asunto, mensaje);
        
        if (resultado.success) {
            resultados.exitosos++;
        } else {
            resultados.fallidos++;
        }
        
        resultados.detalles.push(resultado);
        
        // Pequeña pausa para no saturar el servidor SMTP
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return resultados;
}

module.exports = {
    enviarEmail,
    enviarEmailMasivo
};