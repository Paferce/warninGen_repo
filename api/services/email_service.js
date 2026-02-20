// services/email.service.js - Servicio de envÃ­o de emails
require('dotenv').config();
const nodemailer = require('nodemailer');

// Configurar el transportador SMTP
// Soporta Gmail o Hostinger segun variables de entorno
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS
    }
});

// Verificar la configuraciÃ³n del transportador
transporter.verify(function(error, success) {
    if (error) {
        console.log('âŒ Error en configuraciÃ³n de email:', error);
    } else {
        console.log('âœ… Servidor de email listo para enviar mensajes');
    }
});

/**
 * Enviar email
 * @param {string} destinatario - Email del destinatario
 * @param {string} asunto - Asunto del email
 * @param {string} mensaje - Cuerpo del mensaje (puede ser HTML)
 * @param {object} variables - Variables para sustituir en el mensaje
 * @returns {Promise<object>} - Resultado del envÃ­o
 */
async function enviarEmail(destinatario, asunto, mensaje, variables = {}) {
    try {
        // Sustituir variables en el asunto y mensaje
        let asuntoFinal = asunto;
        let mensajeFinal = mensaje;
        
        // Reemplazar cada variable {{variable}} con su valor
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            asuntoFinal = asuntoFinal.replace(regex, value);
            mensajeFinal = mensajeFinal.replace(regex, value);
        }
        
        // Configurar el email
        const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER;
        const fromName = process.env.SMTP_FROM_NAME || 'Sistema de Alertas';
        
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: destinatario,
            subject: asuntoFinal,
            html: mensajeFinal,
            text: mensajeFinal.replace(/<[^>]*>/g, '') // Version texto plano sin HTML
        };
        
        // Enviar el email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('âœ… Email enviado:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            destinatario: destinatario
        };
        
    } catch (error) {
        console.error('âŒ Error al enviar email:', error);
        return {
            success: false,
            error: error.message,
            destinatario: destinatario
        };
    }
}

/**
 * Enviar email a mÃºltiples destinatarios
 * @param {Array<string>} destinatarios - Array de emails
 * @param {string} asunto - Asunto del email
 * @param {string} mensaje - Mensaje del email
 * @param {object} variables - Variables comunes para todos
 * @returns {Promise<object>} - Resumen del envÃ­o
 */
async function enviarEmailMasivo(destinatarios, asunto, mensaje, variables = {}) {
    const resultados = {
        exitosos: 0,
        fallidos: 0,
        detalles: []
    };
    
    // Enviar a cada destinatario
    for (const destinatario of destinatarios) {
        const resultado = await enviarEmail(destinatario, asunto, mensaje, variables);
        
        if (resultado.success) {
            resultados.exitosos++;
        } else {
            resultados.fallidos++;
        }
        
        resultados.detalles.push(resultado);
        
        // PequeÃ±a pausa para no saturar el servidor SMTP
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return resultados;
}

/**
 * Verificar si el servicio de email esta configurado
 * @returns {boolean} - true si esta configurado correctamente
 */
function verificarConfiguracion() {
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const emailPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
    
    return !!(emailUser && emailPass);
}

module.exports = {
    enviarEmail,
    enviarEmailMasivo,
    verificarConfiguracion
};