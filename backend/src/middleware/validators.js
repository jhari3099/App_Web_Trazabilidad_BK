import { body, validationResult } from 'express-validator';

// Middleware para validar resultados
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para autenticación
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('El username es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
];

export const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('El username es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('El username solo puede contener letras, números y guiones bajos'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('nombre_completo')
    .trim()
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres'),
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['Admin', 'Comercial', 'Riesgos']).withMessage('Rol inválido'),
  validate
];

// Validaciones para solicitudes
export const solicitudValidation = [
  body('ruc')
    .trim()
    .notEmpty().withMessage('El RUC es requerido')
    .matches(/^\d{11}$/).withMessage('El RUC debe tener 11 dígitos'),
  body('razon_social')
    .trim()
    .notEmpty().withMessage('La razón social es requerida')
    .isLength({ min: 3, max: 255 }).withMessage('La razón social debe tener entre 3 y 255 caracteres'),
  body('monto_solicitado')
    .notEmpty().withMessage('El monto solicitado es requerido')
    .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('unidades_solicitadas')
    .notEmpty().withMessage('Las unidades solicitadas son requeridas')
    .isInt({ min: 1 }).withMessage('Las unidades deben ser un número entero positivo'),
  validate
];

// Validaciones para dictamen
export const dictamenValidation = [
  body('solicitud_id')
    .notEmpty().withMessage('El ID de solicitud es requerido')
    .isInt({ min: 1 }).withMessage('ID de solicitud inválido'),
  body('dictamen')
    .notEmpty().withMessage('El dictamen es requerido')
    .isIn(['APROBADO', 'RECHAZADO', 'DEVUELTO']).withMessage('Dictamen inválido'),
  body('comentarios')
    .optional()
    .trim(),
  body('monto_aprobado')
    .if(body('dictamen').equals('APROBADO'))
    .notEmpty().withMessage('El monto aprobado es requerido para aprobaciones')
    .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('unidades_aprobadas')
    .if(body('dictamen').equals('APROBADO'))
    .notEmpty().withMessage('Las unidades aprobadas son requeridas para aprobaciones')
    .isInt({ min: 1 }).withMessage('Las unidades deben ser un número entero positivo'),
  validate
];

// Validación de RUC
export const rucValidation = [
  body('ruc')
    .trim()
    .notEmpty().withMessage('El RUC es requerido')
    .matches(/^\d{11}$/).withMessage('El RUC debe tener 11 dígitos'),
  validate
];
