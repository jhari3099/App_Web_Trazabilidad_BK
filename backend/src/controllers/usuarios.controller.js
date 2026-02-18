import pool from '../config/database.js';

// Obtener todos los usuarios (Solo Admin)
export const getUsuarios = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rol, activo } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, nombre_completo, rol, activo, fecha_creacion FROM usuarios WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM usuarios WHERE 1=1';
    const params = [];

    if (rol) {
      query += ' AND rol = ?';
      countQuery += ' AND rol = ?';
      params.push(rol);
    }

    if (activo !== undefined) {
      query += ' AND activo = ?';
      countQuery += ' AND activo = ?';
      params.push(activo === 'true' ? 1 : 0);
    }

    query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';

    const [usuarios] = await pool.execute(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        usuarios,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.execute(
      'SELECT id, username, email, nombre_completo, rol, activo, fecha_creacion FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuarios[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario (Solo Admin)
export const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, nombre_completo, rol, activo } = req.body;

    await pool.execute(
      'UPDATE usuarios SET email = ?, nombre_completo = ?, rol = ?, activo = ? WHERE id = ?',
      [email, nombre_completo, rol, activo, id]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Actualizar Usuario', 'usuarios', id, `Usuario ${id} actualizado`, req.ip]
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Desactivar usuario (Solo Admin)
export const desactivarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No permitir desactivar el propio usuario
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propio usuario'
      });
    }

    await pool.execute(
      'UPDATE usuarios SET activo = 0 WHERE id = ?',
      [id]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Desactivar Usuario', 'usuarios', id, `Usuario ${id} desactivado`, req.ip]
    );

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Activar usuario (Solo Admin)
export const activarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE usuarios SET activo = 1 WHERE id = ?',
      [id]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Activar Usuario', 'usuarios', id, `Usuario ${id} activado`, req.ip]
    );

    res.json({
      success: true,
      message: 'Usuario activado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
