import express from 'express';
import { login, register, getProfile, changePassword } from '../controllers/auth.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { loginValidation, registerValidation } from '../middleware/validators.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginValidation, login);

// Rutas protegidas
router.get('/profile', authMiddleware, getProfile);
router.post('/change-password', authMiddleware, changePassword);

// Solo Admin puede registrar usuarios
router.post('/register', authMiddleware, checkRole('Admin'), registerValidation, register);

export default router;
