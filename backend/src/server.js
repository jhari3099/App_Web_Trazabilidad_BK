import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import clientesHistoricosRoutes from './routes/clientesHistoricos.routes.js';
import solicitudesRoutes from './routes/solicitudes.routes.js';
import sheriffRoutes from './routes/sheriff.routes.js';
import dictamenRoutes from './routes/dictamen.routes.js';
import trazabilidadRoutes from './routes/trazabilidad.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

// Importar middleware de errores
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana
});
app.use('/api/', limiter);

// Parseo de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/clientes-historicos', clientesHistoricosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/sheriff', sheriffRoutes);
app.use('/api/dictamenes', dictamenRoutes);
app.use('/api/trazabilidad', trazabilidadRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
});

export default app;
