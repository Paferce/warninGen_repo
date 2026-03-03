require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function migrate() {
    console.log('=================================');
    console.log('Iniciando migración de contraseñas');
    console.log('=================================');

    // Configuración del Pool de MySQL
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sistema_alertas',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('Conectando a la base de datos...');
        const [usuarios] = await pool.execute('SELECT * FROM usuarios');
        let migrados = 0;
        let yaHasheados = 0;

        if (usuarios.length === 0) {
            console.log('No se encontraron usuarios en la base de datos.');
        }

        for (const usuario of usuarios) {
            // Verificar si NO empieza con '$2' (indicador de bcrypt)
            if (usuario.password && !usuario.password.startsWith('$2')) {
                console.log(`[PROCESANDO] Hasheando contraseña para usuario ID: ${usuario.id} (${usuario.email})...`);
                const hashedPassword = await bcrypt.hash(usuario.password, 10);

                await pool.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, usuario.id]);
                migrados++;
                console.log(`[OK] Usuario ${usuario.id} migrado correctamente.`);
            } else {
                yaHasheados++;
            }
        }

        console.log('\n=================================');
        console.log('Migración completada con éxito.');
        console.log(`Usuarios actualizados a bcrypt: ${migrados}`);
        console.log(`Usuarios que ya estaban seguros: ${yaHasheados}`);
        console.log('=================================\n');

    } catch (error) {
        console.error('ERROR durante la migración de la base de datos:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

migrate();
