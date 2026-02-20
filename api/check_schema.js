const fs = require('fs');
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});

connection.query('SHOW COLUMNS FROM contactos', (err, results) => {
    if (err) {
        console.error('Error:', err);
    } else {
        fs.writeFileSync('schema_output.json', JSON.stringify(results, null, 2));
        console.log('Schema written to schema_output.json');
    }
    connection.end();
});
