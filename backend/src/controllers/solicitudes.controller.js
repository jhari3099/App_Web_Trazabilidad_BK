import pool from '../config/database.js';

// Crear nueva solicitud (Comercial)
export const createSolicitud = async (req, res, next) => {
  try {
    const { ruc, razon_social, monto_solicitado, unidades_solicitadas, observaciones } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO solicitudes 
      (ruc, razon_social, monto_solicitado, unidades_solicitadas, comercial_id, observaciones) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [ruc, razon_social, monto_solicitado, unidades_solicitadas, req.user.id, observaciones]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Crear Solicitud', 'solicitudes', result.insertId, `Solicitud para RUC ${ruc}`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las solicitudes con filtros
export const getSolicitudes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, comercial_id, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.nombre_completo as comercial_nombre 
      FROM solicitudes s
      LEFT JOIN usuarios u ON s.comercial_id = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM solicitudes WHERE 1=1';
    const params = [];

    // Filtros
    if (estado) {
      query += ' AND s.estado_solicitud = ?';
      countQuery += ' AND estado_solicitud = ?';
      params.push(estado);
    }

    if (comercial_id) {
      query += ' AND s.comercial_id = ?';
      countQuery += ' AND comercial_id = ?';
      params.push(comercial_id);
    }

    if (search) {
      const searchCondition = ' AND (s.ruc LIKE ? OR s.razon_social LIKE ?)';
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    // Si es Comercial, solo ver sus propias solicitudes
    if (req.user.rol === 'Comercial') {
      query += ' AND s.comercial_id = ?';
      countQuery += ' AND comercial_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY s.fecha_solicitud DESC LIMIT ? OFFSET ?';

    const [solicitudes] = await pool.execute(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        solicitudes,
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

// Obtener solicitud por ID
export const getSolicitudById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [solicitudes] = await pool.execute(
      `SELECT s.*, u.nombre_completo as comercial_nombre,
       dr.dictamen, dr.monto_aprobado, dr.unidades_aprobadas, dr.comentarios as dictamen_comentarios,
       ds.respuesta_json as sheriff_data
       FROM solicitudes s
       LEFT JOIN usuarios u ON s.comercial_id = u.id
       LEFT JOIN dictamen_riesgo dr ON s.id = dr.solicitud_id
       LEFT JOIN datos_sheriff ds ON s.id = ds.solicitud_id
       WHERE s.id = ?`,
      [id]
    );

    if (solicitudes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Si es Comercial, verificar que sea su solicitud
    if (req.user.rol === 'Comercial' && solicitudes[0].comercial_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta solicitud'
      });
    }

    res.json({
      success: true,
      data: solicitudes[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar solicitud (Solo el comercial que la creó)
export const updateSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monto_solicitado, unidades_solicitadas, observaciones } = req.body;

    // Verificar que la solicitud existe y pertenece al usuario
    const [solicitudes] = await pool.execute(
      'SELECT comercial_id, estado_solicitud FROM solicitudes WHERE id = ?',
      [id]
    );

    if (solicitudes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitudes[0].comercial_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta solicitud'
      });
    }

    // No permitir edición si ya tiene dictamen
    if (solicitudes[0].estado_solicitud !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'No se puede modificar una solicitud que ya está en evaluación o tiene dictamen'
      });
    }

    await pool.execute(
      'UPDATE solicitudes SET monto_solicitado = ?, unidades_solicitadas = ?, observaciones = ? WHERE id = ?',
      [monto_solicitado, unidades_solicitadas, observaciones, id]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Actualizar Solicitud', 'solicitudes', id, 'Solicitud actualizada', req.ip]
    );

    res.json({
      success: true,
      message: 'Solicitud actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Dashboard con estadísticas
export const getDashboardStats = async (req, res, next) => {
  try {
    let whereClause = '';
    const params = [];

    if (req.user.rol === 'Comercial') {
      whereClause = 'WHERE comercial_id = ?';
      params.push(req.user.id);
    }

    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado_solicitud = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado_solicitud = 'En Evaluación' THEN 1 ELSE 0 END) as en_evaluacion,
        SUM(CASE WHEN estado_solicitud = 'Aprobado' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN estado_solicitud = 'Rechazado' THEN 1 ELSE 0 END) as rechazadas,
        SUM(CASE WHEN estado_solicitud = 'Devuelto' THEN 1 ELSE 0 END) as devueltas
      FROM solicitudes ${whereClause}
    `, params);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    next(error);
  }
};
