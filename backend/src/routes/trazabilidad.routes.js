import express from 'express';
import {
  getTrazabilidad,
  getTrazabilidadSolicitud,
  registrarAccion,
  getEstadisticasActividad
} from '../controllers/trazabilidad.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener estadísticas (Solo Admin)
router.get('/estadisticas', checkRole('Admin'), getEstadisticasActividad);

// Obtener trazabilidad general (Solo Admin)
router.get('/', checkRole('Admin'), getTrazabilidad);

// Obtener trazabilidad de una solicitud
router.get('/solicitud/:solicitud_id', getTrazabilidadSolicitud);

// Registrar acción manual
router.post('/', registrarAccion);

export default router;
