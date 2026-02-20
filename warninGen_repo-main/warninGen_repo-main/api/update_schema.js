const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});

const queries = [
    "ALTER TABLE contactos MODIFY COLUMN tipo_usuario VARCHAR(50)",
    "ALTER TABLE contactos MODIFY COLUMN tipo_punto_critico VARCHAR(50)",
    "ALTER TABLE contactos ADD COLUMN IF NOT EXISTS distrito VARCHAR(100)"
];

const runQueries = async () => {
    for (const query of queries) {
        try {
            await connection.promise().query(query);
            console.log(`Executed: ${query}`);
        } catch (err) {
            console.error(`Error executing ${query}:`, err);
        }
    }
    connection.end();
};

runQueries();
