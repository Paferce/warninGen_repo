const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});

connection.query('SELECT id, nombre, email, password, rol FROM usuarios', (err, results) => {
    if (err) {
        console.error('Error fetching users:', err);
    } else {
        console.log('--- USUARIOS ---');
        results.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email} | Pass: ${u.password} | Rol: ${u.rol}`);
        });
        console.log('----------------');
    }
    connection.end();
});
