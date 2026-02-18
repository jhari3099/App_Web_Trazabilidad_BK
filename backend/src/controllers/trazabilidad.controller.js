import pool from '../config/database.js';

// Obtener trazabilidad con filtros
export const getTrazabilidad = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      usuario_id,
      area,
      tabla_afectada,
      registro_id,
      fecha_desde,
      fecha_hasta
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.username, u.nombre_completo
      FROM trazabilidad t
      INNER JOIN usuarios u ON t.usuario_id = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM trazabilidad WHERE 1=1';
    const params = [];

    if (usuario_id) {
      query += ' AND t.usuario_id = ?';
      countQuery += ' AND usuario_id = ?';
      params.push(usuario_id);
    }

    if (area) {
      query += ' AND t.area = ?';
      countQuery += ' AND area = ?';
      params.push(area);
    }

    if (tabla_afectada) {
      query += ' AND t.tabla_afectada = ?';
      countQuery += ' AND tabla_afectada = ?';
      params.push(tabla_afectada);
    }

    if (registro_id) {
      query += ' AND t.registro_id = ?';
      countQuery += ' AND registro_id = ?';
      params.push(registro_id);
    }

    if (fecha_desde) {
      query += ' AND t.fecha_accion >= ?';
      countQuery += ' AND fecha_accion >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND t.fecha_accion <= ?';
      countQuery += ' AND fecha_accion <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY t.fecha_accion DESC LIMIT ? OFFSET ?';

    const [registros] = await pool.execute(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        registros,
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

// Obtener trazabilidad de una solicitud específica
export const getTrazabilidadSolicitud = async (req, res, next) => {
  try {
    const { solicitud_id } = req.params;

    const [registros] = await pool.execute(
      `SELECT t.*, u.username, u.nombre_completo
       FROM trazabilidad t
       INNER JOIN usuarios u ON t.usuario_id = u.id
       WHERE t.tabla_afectada = 'solicitudes' AND t.registro_id = ?
       ORDER BY t.fecha_accion DESC`,
      [solicitud_id]
    );

    res.json({
      success: true,
      data: registros
    });
  } catch (error) {
    next(error);
  }
};

// Registrar acción manual en trazabilidad
export const registrarAccion = async (req, res, next) => {
  try {
    const { accion, tabla_afectada, registro_id, comentario, datos_adicionales } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO trazabilidad 
      (usuario_id, area, accion, tabla_afectada, registro_id, comentario, datos_adicionales, ip_address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.user.rol,
        accion,
        tabla_afectada || null,
        registro_id || null,
        comentario || null,
        datos_adicionales ? JSON.stringify(datos_adicionales) : null,
        req.ip
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Acción registrada en trazabilidad',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de actividad
export const getEstadisticasActividad = async (req, res, next) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (fecha_desde) {
      whereClause += ' AND fecha_accion >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      whereClause += ' AND fecha_accion <= ?';
      params.push(fecha_hasta);
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_acciones,
        COUNT(DISTINCT usuario_id) as usuarios_activos,
        COUNT(DISTINCT area) as areas_activas,
        COUNT(DISTINCT DATE(fecha_accion)) as dias_activos
      FROM trazabilidad
      ${whereClause}
    `, params);

    const [accionesPorArea] = await pool.execute(`
      SELECT area, COUNT(*) as cantidad
      FROM trazabilidad
      ${whereClause}
      GROUP BY area
      ORDER BY cantidad DESC
    `, params);

    const [accionesPorUsuario] = await pool.execute(`
      SELECT u.nombre_completo, COUNT(*) as cantidad
      FROM trazabilidad t
      INNER JOIN usuarios u ON t.usuario_id = u.id
      ${whereClause}
      GROUP BY t.usuario_id, u.nombre_completo
      ORDER BY cantidad DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        resumen: stats[0],
        por_area: accionesPorArea,
        por_usuario: accionesPorUsuario
      }
    });
  } catch (error) {
    next(error);
  }
};
