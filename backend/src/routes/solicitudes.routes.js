import express from 'express';
import {
  createSolicitud,
  getSolicitudes,
  getSolicitudById,
  updateSolicitud,
  getDashboardStats
} from '../controllers/solicitudes.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { solicitudValidation } from '../middleware/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Dashboard con estadísticas
router.get('/dashboard', getDashboardStats);

// Obtener todas las solicitudes
router.get('/', getSolicitudes);

// Obtener solicitud por ID
router.get('/:id', getSolicitudById);

// Crear solicitud (Solo Comercial)
router.post('/', checkRole('Comercial'), solicitudValidation, createSolicitud);

// Actualizar solicitud (Solo Comercial que la creó)
router.put('/:id', checkRole('Comercial'), updateSolicitud);

export default router;
