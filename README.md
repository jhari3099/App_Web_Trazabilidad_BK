# Sistema de Evaluación de Clientes

Sistema web empresarial para la gestión y evaluación de clientes con integración a API externa (Sheriff) y control de trazabilidad completo.

## 📋 Características

### Módulos Principales

1. **Base Histórica de Clientes**
   - Almacenamiento de datos históricos de clientes
   - Búsqueda y consultas avanzadas
   - Importación desde Excel

2. **Solicitudes en Evaluación**
   - Registro de nuevas solicitudes (Comercial)
   - Adjuntar declaraciones juradas y reportes tributarios
   - Seguimiento de estado en tiempo real

3. **Evaluación de Riesgos**
   - Consulta a API Sheriff
   - Almacenamiento de respuestas JSON
   - Análisis y emisión de dictámenes (APROBADO/RECHAZADO/DEVUELTO)
   - Generación de reportes Excel

4. **Trazabilidad**
   - Registro completo de acciones del sistema
   - Auditoría por usuario, área y fecha
   - Estadísticas de actividad

### Roles de Usuario

- **Admin**: Acceso completo, gestión de usuarios
- **Comercial**: Crear y gestionar solicitudes
- **Riesgos**: Evaluar solicitudes y emitir dictámenes

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone <url-repositorio>
cd Sistema_Evaluacion_Clientes
```

### 2. Configurar Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# Ejecutar scripts de base de datos
source database/schema.sql
source database/seed.sql
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
copy .env.example .env

# Editar .env con tus credenciales
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=evaluacion_clientes
# JWT_SECRET=tu_secret_key
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install
```

### 5. Generar Hash de Contraseñas (Opcional)

Si necesitas generar nuevos hashes de contraseñas para usuarios:

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(hash => console.log(hash));"
```

## 🎯 Ejecución

### Desarrollo

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

El backend estará disponible en: `http://localhost:3000`
El frontend estará disponible en: `http://localhost:5173`

### Producción

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | Admin123! | Admin |
| comercial1 | Admin123! | Comercial |
| riesgos1 | Admin123! | Riesgos |

## 📁 Estructura del Proyecto

```
Sistema_Evaluacion_Clientes/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de BD
│   │   ├── controllers/     # Controladores MVC
│   │   ├── middleware/      # Auth, validación, errores
│   │   ├── models/          # (Queries en controladores)
│   │   ├── routes/          # Rutas de la API
│   │   ├── services/        # Servicios externos (Sheriff)
│   │   ├── utils/           # Utilidades
│   │   └── server.js        # Punto de entrada
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── context/         # Context API (Auth)
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # API calls
│   │   ├── styles/          # CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql           # Esquema de BD
│   └── seed.sql             # Datos de prueba
│
└── README.md
```

## 🔐 Seguridad

- **Autenticación JWT**: Tokens con expiración configurable
- **bcrypt**: Hash de contraseñas con 10 rounds
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de orígenes permitidos
- **Rate Limiting**: Límite de requests por IP
- **SQL Injection**: Consultas preparadas
- **Validación**: express-validator en todas las entradas

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (Admin)
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/change-password` - Cambiar contraseña

### Solicitudes
- `GET /api/solicitudes` - Listar solicitudes
- `GET /api/solicitudes/:id` - Obtener solicitud
- `POST /api/solicitudes` - Crear solicitud (Comercial)
- `PUT /api/solicitudes/:id` - Actualizar solicitud
- `GET /api/solicitudes/dashboard` - Estadísticas

### Clientes Históricos
- `GET /api/clientes-historicos` - Listar clientes
- `GET /api/clientes-historicos/ruc/:ruc` - Buscar por RUC
- `POST /api/clientes-historicos` - Crear cliente
- `PUT /api/clientes-historicos/:id` - Actualizar cliente
- `POST /api/clientes-historicos/importar` - Importar Excel

### Sheriff API
- `POST /api/sheriff/consultar` - Consultar RUC
- `GET /api/sheriff/solicitud/:id` - Obtener datos
- `GET /api/sheriff/excel/:id` - Generar Excel

### Dictámenes
- `GET /api/dictamenes` - Listar dictámenes
- `GET /api/dictamenes/solicitud/:id` - Por solicitud
- `POST /api/dictamenes` - Crear dictamen (Riesgos)
- `PUT /api/dictamenes/:id` - Actualizar dictamen

### Trazabilidad
- `GET /api/trazabilidad` - Listar trazabilidad (Admin)
- `GET /api/trazabilidad/solicitud/:id` - Por solicitud
- `GET /api/trazabilidad/estadisticas` - Estadísticas
- `POST /api/trazabilidad` - Registrar acción

### Usuarios
- `GET /api/usuarios` - Listar usuarios (Admin)
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `POST /api/usuarios/:id/desactivar` - Desactivar
- `POST /api/usuarios/:id/activar` - Activar

## 📊 Base de Datos

### Tablas Principales

- **usuarios**: Usuarios del sistema con roles
- **clientes_historicos**: Base histórica de clientes
- **solicitudes**: Solicitudes de evaluación
- **datos_sheriff**: Respuestas JSON de API Sheriff
- **dictamen_riesgo**: Dictámenes emitidos por Riesgos
- **trazabilidad**: Registro de acciones del sistema
- **declaraciones_juradas**: Documentos adjuntos
- **reportes_tributarios**: Reportes adjuntos

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js + Express
- MySQL2
- JWT + bcrypt
- express-validator
- Helmet (seguridad)
- CORS
- Axios (API Sheriff)
- XLSX (Excel)

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Lucide React (iconos)
- CSS3 (sin frameworks)

## 🔄 Flujo de Trabajo

1. **Comercial** crea una solicitud con datos del cliente
2. **Comercial** adjunta documentos (DJ, reportes tributarios)
3. **Riesgos** consulta API Sheriff para el RUC
4. Sistema guarda respuesta completa en JSON
5. **Riesgos** analiza datos y genera Excel si necesita
6. **Riesgos** emite dictamen (APROBADO/RECHAZADO/DEVUELTO)
7. Sistema actualiza automáticamente estado de solicitud
8. Todas las acciones quedan registradas en trazabilidad

## 📝 Variables de Entorno

```env
# Backend (.env)
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=evaluacion_clientes
DB_PORT=3306

JWT_SECRET=tu_secret_key_super_segura
JWT_EXPIRES_IN=24h

SHERIFF_API_URL=https://api.sheriff.com/v1
SHERIFF_API_KEY=tu_api_key

CORS_ORIGIN=http://localhost:5173
```

## 🐛 Troubleshooting

### Error de conexión a MySQL
```bash
# Verificar que MySQL esté corriendo
mysql --version
mysql -u root -p -e "SELECT 1"

# Verificar credenciales en .env
```

### Error de CORS
```bash
# Verificar que CORS_ORIGIN en backend apunte al frontend
# Por defecto: http://localhost:5173
```

### Error "Token inválido"
```bash
# Limpiar localStorage del navegador
# O hacer logout y login nuevamente
```

## 📈 Próximas Mejoras

- [ ] Upload de archivos adjuntos
- [ ] Notificaciones en tiempo real
- [ ] Reportes PDF personalizados
- [ ] Dashboard con gráficos avanzados
- [ ] Módulo de búsqueda avanzada
- [ ] Exportación masiva de datos
- [ ] Integración con más APIs externas

## 📞 Soporte

Para soporte técnico o consultas, contactar al equipo de desarrollo.

## 📄 Licencia

Uso interno empresarial - Todos los derechos reservados.

---

**Desarrollado con ❤️ para optimizar el proceso de evaluación de clientes**
