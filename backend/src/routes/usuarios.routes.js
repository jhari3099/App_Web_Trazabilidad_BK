import express from 'express';
import {
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  desactivarUsuario,
  activarUsuario
} from '../controllers/usuarios.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de Admin
router.use(authMiddleware);
router.use(checkRole('Admin'));

// Obtener todos los usuarios
router.get('/', getUsuarios);

// Obtener usuario por ID
router.get('/:id', getUsuarioById);

// Actualizar usuario
router.put('/:id', updateUsuario);

// Desactivar usuario
router.post('/:id/desactivar', desactivarUsuario);

// Activar usuario
router.post('/:id/activar', activarUsuario);

export default router;
