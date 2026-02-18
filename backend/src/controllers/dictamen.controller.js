import pool from '../config/database.js';

// Crear dictamen (Solo Riesgos)
export const createDictamen = async (req, res, next) => {
  try {
    const {
      solicitud_id,
      sheriff_data_id,
      dictamen,
      monto_aprobado,
      unidades_aprobadas,
      comentarios
    } = req.body;

    // Verificar que la solicitud existe
    const [solicitudes] = await pool.execute(
      'SELECT * FROM solicitudes WHERE id = ?',
      [solicitud_id]
    );

    if (solicitudes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar que no exista ya un dictamen
    const [dictamenesExistentes] = await pool.execute(
      'SELECT id FROM dictamen_riesgo WHERE solicitud_id = ?',
      [solicitud_id]
    );

    if (dictamenesExistentes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un dictamen para esta solicitud'
      });
    }

    // Insertar dictamen
    const [result] = await pool.execute(
      `INSERT INTO dictamen_riesgo 
      (solicitud_id, sheriff_data_id, dictamen, monto_aprobado, unidades_aprobadas, analista_id, comentarios) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        solicitud_id,
        sheriff_data_id || null,
        dictamen,
        dictamen === 'APROBADO' ? monto_aprobado : null,
        dictamen === 'APROBADO' ? unidades_aprobadas : null,
        req.user.id,
        comentarios
      ]
    );

    // El trigger actualizará automáticamente el estado de la solicitud

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.user.rol,
        'Crear Dictamen',
        'dictamen_riesgo',
        result.insertId,
        `Dictamen ${dictamen} para solicitud ${solicitud_id}`,
        req.ip
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Dictamen creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener dictamen por solicitud
export const getDictamenBySolicitud = async (req, res, next) => {
  try {
    const { solicitud_id } = req.params;

    const [dictamenes] = await pool.execute(
      `SELECT dr.*, u.nombre_completo as analista_nombre, s.razon_social, s.ruc
       FROM dictamen_riesgo dr
       INNER JOIN usuarios u ON dr.analista_id = u.id
       INNER JOIN solicitudes s ON dr.solicitud_id = s.id
       WHERE dr.solicitud_id = ?`,
      [solicitud_id]
    );

    if (dictamenes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay dictamen para esta solicitud'
      });
    }

    res.json({
      success: true,
      data: dictamenes[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los dictámenes con filtros
export const getDictamenes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, dictamen, analista_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT dr.*, u.nombre_completo as analista_nombre, s.razon_social, s.ruc, s.monto_solicitado
      FROM dictamen_riesgo dr
      INNER JOIN usuarios u ON dr.analista_id = u.id
      INNER JOIN solicitudes s ON dr.solicitud_id = s.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM dictamen_riesgo WHERE 1=1';
    const params = [];

    if (dictamen) {
      query += ' AND dr.dictamen = ?';
      countQuery += ' AND dictamen = ?';
      params.push(dictamen);
    }

    if (analista_id) {
      query += ' AND dr.analista_id = ?';
      countQuery += ' AND analista_id = ?';
      params.push(analista_id);
    }

    query += ' ORDER BY dr.fecha_dictamen DESC LIMIT ? OFFSET ?';

    const [dictamenes] = await pool.execute(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        dictamenes,
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

// Actualizar dictamen (Solo el analista que lo creó o Admin)
export const updateDictamen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dictamen, monto_aprobado, unidades_aprobadas, comentarios } = req.body;

    // Verificar que el dictamen existe
    const [dictamenes] = await pool.execute(
      'SELECT analista_id, solicitud_id FROM dictamen_riesgo WHERE id = ?',
      [id]
    );

    if (dictamenes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dictamen no encontrado'
      });
    }

    // Verificar permisos (solo el analista que lo creó o Admin)
    if (req.user.rol !== 'Admin' && dictamenes[0].analista_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este dictamen'
      });
    }

    // Actualizar dictamen
    await pool.execute(
      `UPDATE dictamen_riesgo 
       SET dictamen = ?, monto_aprobado = ?, unidades_aprobadas = ?, comentarios = ?
       WHERE id = ?`,
      [
        dictamen,
        dictamen === 'APROBADO' ? monto_aprobado : null,
        dictamen === 'APROBADO' ? unidades_aprobadas : null,
        comentarios,
        id
      ]
    );

    // Actualizar estado de solicitud
    await pool.execute(
      'UPDATE solicitudes SET estado_solicitud = ? WHERE id = ?',
      [dictamen, dictamenes[0].solicitud_id]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Actualizar Dictamen', 'dictamen_riesgo', id, `Dictamen actualizado a ${dictamen}`, req.ip]
    );

    res.json({
      success: true,
      message: 'Dictamen actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
