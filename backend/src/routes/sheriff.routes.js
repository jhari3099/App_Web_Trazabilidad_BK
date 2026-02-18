import express from 'express';
import {
  consultarSheriff,
  getDatosSheriff,
  generarExcelSheriff
} from '../controllers/sheriff.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { rucValidation } from '../middleware/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de Riesgos
router.use(authMiddleware);
router.use(checkRole('Riesgos', 'Admin'));

// Consultar API Sheriff
router.post('/consultar', consultarSheriff);

// Obtener datos de Sheriff para una solicitud
router.get('/solicitud/:solicitud_id', getDatosSheriff);

// Generar Excel con datos de Sheriff
router.get('/excel/:solicitud_id', generarExcelSheriff);

export default router;
