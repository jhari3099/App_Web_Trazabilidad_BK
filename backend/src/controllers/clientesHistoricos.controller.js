import pool from '../config/database.js';
import XLSX from 'xlsx';

// Obtener todos los clientes históricos con paginación y búsqueda
export const getClientesHistoricos = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM clientes_historicos';
    let countQuery = 'SELECT COUNT(*) as total FROM clientes_historicos';
    const params = [];

    if (search) {
      const searchCondition = ' WHERE ruc LIKE ? OR razon_social LIKE ?';
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    query += ' ORDER BY fecha_registro DESC LIMIT ? OFFSET ?';

    const [clientes] = await pool.execute(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        clientes,
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

// Buscar cliente histórico por RUC
export const getClienteByRuc = async (req, res, next) => {
  try {
    const { ruc } = req.params;

    const [clientes] = await pool.execute(
      'SELECT * FROM clientes_historicos WHERE ruc = ?',
      [ruc]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: clientes[0]
    });
  } catch (error) {
    next(error);
  }
};

// Importar clientes desde Excel
export const importarClientesDesdeExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó archivo Excel'
      });
    }

    // Leer archivo Excel
    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    let insertados = 0;
    let errores = 0;

    for (const row of data) {
      try {
        await pool.execute(
          `INSERT INTO clientes_historicos 
          (ruc, razon_social, direccion, telefono, email, sector, monto_aprobado, unidades_aprobadas, estado, datos_adicionales) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.RUC || row.ruc,
            row['Razón Social'] || row.razon_social,
            row.Direccion || row.direccion || null,
            row.Telefono || row.telefono || null,
            row.Email || row.email || null,
            row.Sector || row.sector || null,
            row['Monto Aprobado'] || row.monto_aprobado || null,
            row['Unidades Aprobadas'] || row.unidades_aprobadas || null,
            row.Estado || row.estado || 'Activo',
            JSON.stringify(row)
          ]
        );
        insertados++;
      } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') {
          console.error('Error insertando fila:', error);
        }
        errores++;
      }
    }

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, comentario, ip_address) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.user.rol,
        'Importar Clientes Históricos',
        `Importados ${insertados} clientes, ${errores} errores`,
        req.ip
      ]
    );

    res.json({
      success: true,
      message: 'Importación completada',
      data: {
        insertados,
        errores,
        total: data.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Crear cliente histórico
export const createClienteHistorico = async (req, res, next) => {
  try {
    const {
      ruc,
      razon_social,
      direccion,
      telefono,
      email,
      sector,
      monto_aprobado,
      unidades_aprobadas,
      estado
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO clientes_historicos 
      (ruc, razon_social, direccion, telefono, email, sector, monto_aprobado, unidades_aprobadas, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ruc, razon_social, direccion, telefono, email, sector, monto_aprobado, unidades_aprobadas, estado || 'Activo']
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Crear Cliente Histórico', 'clientes_historicos', result.insertId, `Cliente ${ruc} creado`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Cliente histórico creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar cliente histórico
export const updateClienteHistorico = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    await pool.execute(
      `UPDATE clientes_historicos SET ${fields} WHERE id = ?`,
      [...values, id]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Actualizar Cliente Histórico', 'clientes_historicos', id, 'Cliente actualizado', req.ip]
    );

    res.json({
      success: true,
      message: 'Cliente histórico actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
