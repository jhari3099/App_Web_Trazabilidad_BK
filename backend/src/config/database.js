import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Modo mock para desarrollo sin BD
const MOCK_MODE = process.env.MOCK_MODE === 'true' || true;

let pool = null;

if (MOCK_MODE) {
  console.log('🎭 Modo MOCK activo - usando datos simulados');
} else {
  // Configuración del pool de conexiones
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'evaluacion_clientes',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

// Datos mock
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@empresa.com',
    password: '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C',
    nombre_completo: 'Administrador del Sistema',
    rol: 'Admin',
    activo: 1
  },
  {
    id: 2,
    username: 'comercial1',
    email: 'comercial1@empresa.com',
    password: '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C',
    nombre_completo: 'Juan Pérez - Comercial',
    rol: 'Comercial',
    activo: 1
  },
  {
    id: 3,
    username: 'riesgos1',
    email: 'riesgos1@empresa.com',
    password: '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C',
    nombre_completo: 'Carlos López - Riesgos',
    rol: 'Riesgos',
    activo: 1
  }
];

// Función para verificar la conexión
export const testConnection = async () => {
  if (MOCK_MODE) {
    console.log('✅ Modo MOCK - conexión simulada');
    return true;
  }
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
};

// Ejecutar query con manejo de errores
export const executeQuery = async (sql, params = []) => {
  if (MOCK_MODE) {
    // Simulación de queries para modo mock
    if (sql.includes('SELECT') && sql.includes('usuarios') && sql.includes('username')) {
      return mockUsers.filter(u => u.username === params[0]);
    }
    if (sql.includes('SELECT COUNT') && sql.includes('solicitudes')) {
      return [{ total: 5, pendientes: 2, en_evaluacion: 1, aprobadas: 1, rechazadas: 1, devueltas: 0 }];
    }
    return [];
  }
  
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error ejecutando query:', error.message);
    throw error;
  }
};

export default pool;
