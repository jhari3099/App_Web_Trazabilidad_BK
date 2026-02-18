import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 1,
});

async function runSetup() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    const connection = await pool.getConnection();
    console.log('✅ Conectado correctamente');

    // Leer y ejecutar schema.sql
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Separar por ; y ejecutar cada statement
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Ejecutando ${statements.length} comandos SQL...`);

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (error) {
        if (error.code !== 'ER_TABLE_EXISTS_ERROR' && error.code !== 'ER_DUP_ENTRY') {
          console.error('Error ejecutando:', statement.substring(0, 50) + '...');
          console.error(error.message);
        }
      }
    }

    console.log('✅ Schema creado correctamente');

    // Leer y ejecutar seed.sql
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    const seedStatements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Ejecutando ${seedStatements.length} comandos de datos...`);

    for (const statement of seedStatements) {
      try {
        await connection.query(statement);
      } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') {
          console.error(error.message);
        }
      }
    }

    console.log('✅ Datos de prueba insertados correctamente');
    console.log('\n✨ Setup completado exitosamente!');
    console.log('Puedes iniciar el servidor con: npm run dev\n');

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante setup:', error.message);
    process.exit(1);
  }
}

runSetup();
