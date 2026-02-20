require('dotenv').config();
const mysql = require('mysql2/promise');

async function verContactos() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME
    });
    
    const [rows] = await connection.execute(
        'SELECT id, nombre, telefono, suscrito_sms, suscrito_whatsapp FROM contactos'
    );
    
    console.log('CONTACTOS EN LA BASE DE DATOS:');
    console.log('==============================\n');
    rows.forEach(row => {
        console.log('ID:', row.id);
        console.log('Nombre:', row.nombre);
        console.log('Telefono:', row.telefono);
        console.log('SMS:', row.suscrito_sms ? 'SI' : 'NO');
        console.log('WhatsApp:', row.suscrito_whatsapp ? 'SI' : 'NO');
        console.log('---');
    });
    
    await connection.end();
}

verContactos().catch(console.error);
