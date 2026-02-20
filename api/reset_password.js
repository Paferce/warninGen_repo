const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});

connection.query('UPDATE usuarios SET password = "admin123" WHERE email = "superadmin@ejemplo.com"', (err, results) => {
    if (err) {
        console.error('Error updating password:', err);
    } else {
        console.log('Password updated to "admin123" for superadmin@ejemplo.com');
    }
    connection.end();
});
