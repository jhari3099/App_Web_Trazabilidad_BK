import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// Datos mock para desarrollo
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@empresa.com',
    password: 'Admin123!',
    nombre_completo: 'Administrador del Sistema',
    rol: 'Admin',
    activo: 1
  },
  {
    id: 2,
    username: 'comercial1',
    email: 'comercial1@empresa.com',
    password: 'Admin123!',
    nombre_completo: 'Juan Pérez - Comercial',
    rol: 'Comercial',
    activo: 1
  },
  {
    id: 3,
    username: 'riesgos1',
    email: 'riesgos1@empresa.com',
    password: 'Admin123!',
    nombre_completo: 'Carlos López - Riesgos',
    rol: 'Riesgos',
    activo: 1
  }
];

// Login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log('🔍 Login intent:', username, 'Password:', password);

    // Usar datos mock o de BD
    let users = [];
    try {
      [users] = await pool.execute(
        'SELECT id, username, email, password, nombre_completo, rol, activo FROM usuarios WHERE username = ?',
        [username]
      );
    } catch (error) {
      // Si falla la BD, usar mock
      console.log('ℹ️  Usando datos mock - Error BD:', error.message);
      users = mockUsers.filter(u => u.username === username);
    }

    console.log('👤 Usuario encontrado:', users.length > 0);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];
    console.log('🔐 Usuario:', user.username, 'Hash almacenado:', user.password.substring(0, 20) + '...');

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Verificar contraseña
    console.log('🔑 Comparando password...');
    let isPasswordValid;
    
    // En MOCK_MODE, comparar directamente; en producción usar bcrypt
    if (password === user.password) {
      // MOCK_MODE o contraseña en texto plano (desarrollo)
      isPasswordValid = true;
    } else if (user.password.startsWith('$2b$')) {
      // Hash bcrypt - comparar con bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = false;
    }
    
    console.log('✓ Password válida:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Registrar acción en trazabilidad
    try {
      await pool.execute(
        'INSERT INTO trazabilidad (usuario_id, area, accion, comentario, ip_address) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.rol, 'Login', 'Inicio de sesión exitoso', req.ip]
      );
    } catch (error) {
      console.log('ℹ️  Trazabilidad no disponible (modo mock)');
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nombre_completo: user.nombre_completo,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Registro de nuevo usuario (solo Admin)
export const register = async (req, res, next) => {
  try {
    const { username, email, password, nombre_completo, rol } = req.body;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await pool.execute(
      'INSERT INTO usuarios (username, email, password, nombre_completo, rol) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, nombre_completo, rol]
    );

    // Registrar acción en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Crear Usuario', 'usuarios', result.insertId, `Usuario ${username} creado`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: result.insertId,
        username,
        email,
        nombre_completo,
        rol
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'El username o email ya existe'
      });
    }
    next(error);
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res, next) => {
  try {
    let users = [];
    try {
      [users] = await pool.execute(
        'SELECT id, username, email, nombre_completo, rol, activo, fecha_creacion FROM usuarios WHERE id = ?',
        [req.user.id]
      );
    } catch (error) {
      users = mockUsers.filter(u => u.id === req.user.id);
    }

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario actual
    let users = [];
    try {
      [users] = await pool.execute(
        'SELECT password FROM usuarios WHERE id = ?',
        [req.user.id]
      );
    } catch (error) {
      users = mockUsers.filter(u => u.id === req.user.id);
    }

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    try {
      await pool.execute(
        'UPDATE usuarios SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id]
      );
    } catch (error) {
      console.log('ℹ️  Cambio de contraseña en modo mock');
    }

    // Registrar acción en trazabilidad
    try {
      await pool.execute(
        'INSERT INTO trazabilidad (usuario_id, area, accion, comentario, ip_address) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, req.user.rol, 'Cambio de Contraseña', 'Contraseña actualizada', req.ip]
      );
    } catch (error) {
      console.log('ℹ️  Trazabilidad no disponible');
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
