import express from 'express';
import {
  getClientesHistoricos,
  getClienteByRuc,
  createClienteHistorico,
  updateClienteHistorico,
  importarClientesDesdeExcel
} from '../controllers/clientesHistoricos.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los clientes
router.get('/', getClientesHistoricos);

// Buscar cliente por RUC
router.get('/ruc/:ruc', getClienteByRuc);

// Crear cliente (Admin y Riesgos)
router.post('/', checkRole('Admin', 'Riesgos'), createClienteHistorico);

// Actualizar cliente (Admin y Riesgos)
router.put('/:id', checkRole('Admin', 'Riesgos'), updateClienteHistorico);

// Importar desde Excel (Solo Admin)
router.post('/importar', checkRole('Admin'), importarClientesDesdeExcel);

export default router;
