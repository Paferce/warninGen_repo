// server.js - Backend para Sistema de Alertas
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3001;

// Configuración de CORS
app.use(cors());
app.use(express.json());
// IMPORTANTE: Twilio envía datos como application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Configuración del Pool de MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Hacer el pool accesible globalmente para las rutas externas
global.pool = pool;

// Importar servicios
const { enviarSMS } = require('./sms_service');
const { enviarEmail } = require('./email_service');
const { enviarWhatsApp } = require('./whatsapp_service');

// Importar rutas
const enviarRoutes = require('./routes/enviar.routes');
app.use('/api/enviar', enviarRoutes);

// --- ENDPOINTS DE AUTENTICACIÓN ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
        }
        const usuario = rows[0];
        // En un sistema real usaríamos bcrypt.compare
        // Por ahora, si la contraseña coincide (o si es desarrollo)
        if (password === usuario.password) {
            res.json({ success: true, user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
        } else {
            res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
});

// --- ENDPOINTS DE CONTACTOS ---

app.get('/api/contactos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM contactos ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo contactos:', error);
        res.status(500).json({ error: 'Error obteniendo contactos' });
    }
});

app.post('/api/contactos', async (req, res) => {
    const {
        nombre, email, telefono, whatsapp,
        tipo_usuario, tipo_punto_critico,
        zona, distrito, ciudad, pais,
        suscrito_email, suscrito_sms, suscrito_whatsapp
    } = req.body;

    if (!nombre) {
        return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
    }
    if (!telefono && !email && !whatsapp) {
        return res.status(400).json({ success: false, error: 'Debe proporcionar al menos un medio de contacto (teléfono, email o whatsapp)' });
    }

    try {
        const [result] = await pool.execute(
            `INSERT INTO contactos (
                nombre, email, telefono, whatsapp,
                tipo_usuario, tipo_punto_critico,
                zona, distrito, ciudad, pais,
                suscrito_email, suscrito_sms, suscrito_whatsapp,
                fecha_modificacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                nombre, email || null, telefono || null, whatsapp || null,
                tipo_usuario || 'Residente', tipo_punto_critico || null,
                zona || null, distrito || null, ciudad || null, pais || null,
                suscrito_email ? 1 : 0, suscrito_sms ? 1 : 0, suscrito_whatsapp ? 1 : 0
            ]
        );

        const id = result.insertId;

        // Enviar mensajes de consentimiento automáticos
        if (telefono && suscrito_sms) {
            // Updated message improving instructions
            await enviarSMS(telefono, 'SISTEMA ALERTAS: Para recibir alertas por WhatsApp, es NECESARIO que guarde este número en su agenda y responda con la palabra "Acepto".');
        }

        if (email && suscrito_email) {
            const numeroWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
            await enviarEmail(email, 'Instrucciones activación Alertas', `SISTEMA ALERTAS: Para recibir alertas por WhatsApp, es NECESARIO que guarde el número ${numeroWhatsApp} en su agenda y responda con la palabra "Acepto".`);
        }

        res.json({ success: true, id: id });
    } catch (error) {
        console.error('Error creando contacto:', error);
        res.status(500).json({ success: false, error: 'Error al crear contacto: ' + error.message });
    }
});

app.delete('/api/contactos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM contactos WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error eliminando contacto:', error);
        res.status(500).json({ error: 'Error eliminando contacto' });
    }
});

// --- ENDPOINTS DE PLANTILLAS ---

app.get('/api/plantillas', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM plantillas ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo plantillas:', error);
        res.status(500).json({ error: 'Error obteniendo plantillas' });
    }
});

// --- ENDPOINTS DE WEBHOOKS ---

// Webhook para Twilio (sin prefijo /api para compatibilidad)
app.post('/webhook/whatsapp', async (req, res) => {
    // Log completo para debugging
    console.log('========================================');
    console.log('✅ Webhook WhatsApp recibido');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body completo:', JSON.stringify(req.body, null, 2));
    console.log('========================================');

    const { From, Body } = req.body;
    const mensaje = Body ? Body.trim().toLowerCase().replace(/[.,!]/g, '') : ''; // Remove punctuation

    console.log(`De: ${From}`);
    console.log(`Mensaje original: "${Body}"`);
    console.log(`Mensaje procesado: "${mensaje}"`);

    const palabrasClave = ['acepto', 'si', 'sí', 'ok', 'confirmar'];
    console.log(`Palabras clave aceptadas: ${palabrasClave.join(', ')}`);
    console.log(`¿Mensaje coincide?: ${palabrasClave.includes(mensaje)}`);

    if (palabrasClave.includes(mensaje)) {
        console.log('✅ Mensaje coincide con palabra clave. Procesando...');
        try {
            const telefonoLimpio = From.replace('whatsapp:', '');
            console.log(`Teléfono limpio: ${telefonoLimpio}`);

            console.log('Actualizando base de datos...');
            await pool.execute(
                'UPDATE contactos SET suscrito_whatsapp = 1 WHERE telefono LIKE ?',
                [`%${telefonoLimpio}%`]
            );
            console.log('✅ Base de datos actualizada');

            // Send confirmation reply
            console.log(`Enviando mensaje de confirmación a: ${telefonoLimpio}`);
            const resultado = await enviarWhatsApp(telefonoLimpio, 'Gracias. Su suscripción a las alertas ha sido confirmada correctamente.');
            console.log('✅ Resultado envío confirmación:', JSON.stringify(resultado, null, 2));

            if (!resultado.success) {
                console.error('❌ ERROR: No se pudo enviar mensaje de confirmación');
                console.error('Detalles:', resultado);
            }
        } catch (error) {
            console.error('❌ Error activando contacto via WhatsApp:', error);
        }
    } else {
        console.log(`❌ Mensaje "${mensaje}" NO coincide con ninguna palabra clave`);
    }
    console.log('========================================');

    res.status(200).send('OK');
});

// Ruta alternativa con prefijo /api (por compatibilidad)
app.post('/api/webhook/whatsapp', async (req, res) => {
    const { From, Body } = req.body;
    const mensaje = Body ? Body.trim().toLowerCase().replace(/[.,!]/g, '') : ''; // Remove punctuation

    console.log(`Webhook WhatsApp recibido de ${From}: ${mensaje}`);

    const palabrasClave = ['acepto', 'si', 'sí', 'ok', 'confirmar'];

    if (palabrasClave.includes(mensaje)) {
        try {
            const telefonoLimpio = From.replace('whatsapp:', '');
            await pool.execute(
                'UPDATE contactos SET suscrito_whatsapp = 1 WHERE telefono LIKE ?',
                [`%${telefonoLimpio}%`]
            );
            console.log('Contacto activado via WhatsApp:', From);

            // Send confirmation reply - usar telefonoLimpio sin el prefijo whatsapp:
            const resultado = await enviarWhatsApp(telefonoLimpio, 'Gracias. Su suscripción a las alertas ha sido confirmada correctamente.');
            console.log('Resultado envío confirmación:', resultado);
        } catch (error) {
            console.error('Error activando contacto via WhatsApp:', error);
        }
    }

    res.status(200).send('OK');
});

// --- INICIO DEL SERVIDOR ---

app.listen(port, () => {
    console.log(`OK: Servidor backend ejecutandose en http://localhost:${port}`);
    console.log('AVISO: Los emoticonos han sido eliminados de la salida de consola.');
});
