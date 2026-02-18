import express from 'express';
import {
  createDictamen,
  getDictamenBySolicitud,
  getDictamenes,
  updateDictamen
} from '../controllers/dictamen.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { dictamenValidation } from '../middleware/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los dictámenes (Admin y Riesgos)
router.get('/', checkRole('Admin', 'Riesgos'), getDictamenes);

// Obtener dictamen por solicitud
router.get('/solicitud/:solicitud_id', getDictamenBySolicitud);

// Crear dictamen (Solo Riesgos)
router.post('/', checkRole('Riesgos'), dictamenValidation, createDictamen);

// Actualizar dictamen (Riesgos que lo creó o Admin)
router.put('/:id', checkRole('Admin', 'Riesgos'), dictamenValidation, updateDictamen);

export default router;
