import pool from '../config/database.js';
import sheriffService from '../services/sheriff.service.js';
import XLSX from 'xlsx';

// Consultar API Sheriff para una solicitud
export const consultarSheriff = async (req, res, next) => {
  try {
    const { solicitud_id, ruc } = req.body;

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

    // Consultar API Sheriff (usar mock para desarrollo)
    const useMock = process.env.NODE_ENV === 'development';
    const resultado = useMock 
      ? await sheriffService.consultarRUCMock(ruc)
      : await sheriffService.consultarRUC(ruc);

    if (!resultado.success) {
      return res.status(resultado.statusCode || 500).json({
        success: false,
        message: 'Error consultando API Sheriff',
        error: resultado.error
      });
    }

    // Guardar respuesta en la base de datos
    const [result] = await pool.execute(
      'INSERT INTO datos_sheriff (solicitud_id, ruc, respuesta_json, usuario_consulta_id) VALUES (?, ?, ?, ?)',
      [solicitud_id, ruc, JSON.stringify(resultado.data), req.user.id]
    );

    // Actualizar estado de solicitud
    await pool.execute(
      'UPDATE solicitudes SET estado_solicitud = ? WHERE id = ?',
      ['En Evaluación', solicitud_id]
    );

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Consulta Sheriff', 'datos_sheriff', result.insertId, `Consulta para RUC ${ruc}`, req.ip]
    );

    res.json({
      success: true,
      message: 'Consulta Sheriff realizada exitosamente',
      data: {
        sheriff_id: result.insertId,
        datos: resultado.data
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener datos de Sheriff para una solicitud
export const getDatosSheriff = async (req, res, next) => {
  try {
    const { solicitud_id } = req.params;

    const [datos] = await pool.execute(
      'SELECT * FROM datos_sheriff WHERE solicitud_id = ? ORDER BY fecha_consulta DESC LIMIT 1',
      [solicitud_id]
    );

    if (datos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay datos de Sheriff para esta solicitud'
      });
    }

    res.json({
      success: true,
      data: datos[0]
    });
  } catch (error) {
    next(error);
  }
};

// Generar Excel con datos de Sheriff para el área de riesgos
export const generarExcelSheriff = async (req, res, next) => {
  try {
    const { solicitud_id } = req.params;

    // Obtener datos
    const [datos] = await pool.execute(
      `SELECT ds.*, s.ruc, s.razon_social, s.monto_solicitado, s.unidades_solicitadas
       FROM datos_sheriff ds
       INNER JOIN solicitudes s ON ds.solicitud_id = s.id
       WHERE ds.solicitud_id = ?
       ORDER BY ds.fecha_consulta DESC LIMIT 1`,
      [solicitud_id]
    );

    if (datos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay datos de Sheriff para esta solicitud'
      });
    }

    const sheriffData = JSON.parse(datos[0].respuesta_json);

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Datos Generales
    const datosGenerales = [
      ['REPORTE SHERIFF - ANÁLISIS DE RIESGOS'],
      [''],
      ['Solicitud ID', solicitud_id],
      ['RUC', datos[0].ruc],
      ['Razón Social', datos[0].razon_social],
      ['Monto Solicitado', datos[0].monto_solicitado],
      ['Unidades Solicitadas', datos[0].unidades_solicitadas],
      ['Fecha Consulta', new Date(datos[0].fecha_consulta).toLocaleString()],
      [''],
      ['INFORMACIÓN SHERIFF'],
      ['Estado', sheriffData.estado || 'N/A'],
      ['Condición', sheriffData.condicion || 'N/A'],
      ['Dirección', sheriffData.direccion || 'N/A'],
      ['Actividad Comercial', sheriffData.actividad_comercial || 'N/A']
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(datosGenerales);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Datos Generales');

    // Hoja 2: Análisis Crediticio
    if (sheriffData.reportes_credito) {
      const analisisCredito = [
        ['ANÁLISIS CREDITICIO'],
        [''],
        ['Score', sheriffData.reportes_credito.score || 'N/A'],
        ['Calificación', sheriffData.reportes_credito.calificacion || 'N/A'],
        ['Deuda Total', sheriffData.reportes_credito.deuda_total || 0],
        ['Protestos', sheriffData.reportes_credito.protestos || 0],
        ['Demandas', sheriffData.reportes_credito.demandas || 0],
        ['Morosidad', sheriffData.reportes_credito.morosidad ? 'SI' : 'NO']
      ];

      const ws2 = XLSX.utils.aoa_to_sheet(analisisCredito);
      XLSX.utils.book_append_sheet(workbook, ws2, 'Análisis Crediticio');
    }

    // Hoja 3: Información Financiera
    if (sheriffData.informacion_financiera) {
      const infoFinanciera = [
        ['INFORMACIÓN FINANCIERA'],
        [''],
        ['Ventas Anuales', sheriffData.informacion_financiera.ventas_anuales || 0],
        ['Activos', sheriffData.informacion_financiera.activos || 0],
        ['Patrimonio', sheriffData.informacion_financiera.patrimonio || 0]
      ];

      const ws3 = XLSX.utils.aoa_to_sheet(infoFinanciera);
      XLSX.utils.book_append_sheet(workbook, ws3, 'Info Financiera');
    }

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Registrar en trazabilidad
    await pool.execute(
      'INSERT INTO trazabilidad (usuario_id, area, accion, tabla_afectada, registro_id, comentario, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.rol, 'Generar Excel Sheriff', 'datos_sheriff', datos[0].id, `Excel generado para solicitud ${solicitud_id}`, req.ip]
    );

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Sheriff_RUC_${datos[0].ruc}_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
