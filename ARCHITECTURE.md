# ARQUITECTURA DEL SISTEMA

## 🏗️ Visión General

Sistema de 3 capas:
- **Presentación**: React + Vite (Frontend)
- **Lógica de Negocio**: Node.js + Express (Backend)
- **Datos**: MySQL (Base de Datos)

## 📊 Diagrama de Flujo Principal

```
┌─────────────┐
│  COMERCIAL  │
└──────┬──────┘
       │ 1. Crea solicitud
       ▼
┌─────────────────────┐
│   SOLICITUDES DB    │
└──────┬──────────────┘
       │ 2. Pasa a evaluación
       ▼
┌─────────────┐
│   RIESGOS   │
└──────┬──────┘
       │ 3. Consulta Sheriff API
       ▼
┌─────────────────────┐
│  DATOS_SHERIFF DB   │
└──────┬──────────────┘
       │ 4. Analiza datos
       ▼
┌─────────────┐
│   RIESGOS   │
└──────┬──────┘
       │ 5. Emite dictamen
       ▼
┌─────────────────────┐
│   DICTAMEN_DB       │
│   + Trazabilidad    │
└─────────────────────┘
```

## 🔐 Sistema de Autenticación

```
Usuario → Login → JWT Token → LocalStorage → Headers → Verificación Middleware
```

1. Usuario envía credenciales
2. Backend verifica con bcrypt
3. Genera token JWT
4. Frontend guarda en localStorage
5. Cada request incluye token en headers
6. Middleware verifica y decodifica token
7. Agrega datos de usuario a request

## 🗄️ Modelo de Datos

### Relaciones Principales

```
usuarios (1) ──────→ (N) solicitudes
solicitudes (1) ───→ (1) dictamen_riesgo
solicitudes (1) ───→ (N) datos_sheriff
solicitudes (1) ───→ (N) trazabilidad
```

### Estados de Solicitud

```
Pendiente → En Evaluación → APROBADO/RECHAZADO/DEVUELTO
```

## 🎯 Patrones de Diseño Utilizados

### Backend

**MVC (Model-View-Controller)**
- Models: Queries en controladores (sin ORM)
- Views: JSON responses
- Controllers: Lógica de negocio

**Middleware Pattern**
- authMiddleware: Verificación JWT
- checkRole: Control de acceso por roles
- validators: Validación de datos
- errorHandler: Manejo centralizado de errores

**Service Layer**
- sheriffService: Abstracción de API externa
- Separación de lógica de integración

### Frontend

**Context API**
- AuthContext: Estado global de autenticación

**Component Composition**
- Layout: Estructura base
- PrivateRoute: Protección de rutas
- Pages: Vistas principales
- Components: Reutilizables

**Service Layer**
- api.js: Centralización de llamadas HTTP
- Interceptors para tokens y errores

## 🔄 Flujo de Request

### Ejemplo: Crear Solicitud

```
1. Frontend (Comercial)
   └─→ Form submission
       └─→ solicitudesService.create(data)

2. API Service
   └─→ POST /api/solicitudes
       └─→ Headers: { Authorization: Bearer JWT }

3. Backend Middleware
   └─→ authMiddleware: Verifica token
       └─→ checkRole: Verifica rol "Comercial"
           └─→ solicitudValidation: Valida datos

4. Controller
   └─→ solicitudes.controller.createSolicitud()
       └─→ INSERT INTO solicitudes
           └─→ INSERT INTO trazabilidad

5. Response
   └─→ { success: true, data: { id: 123 } }

6. Frontend
   └─→ Actualiza UI
       └─→ Redirect o mensaje de éxito
```

## 🛡️ Capas de Seguridad

```
1. HTTPS (Producción)
2. Helmet (Headers seguros)
3. CORS (Orígenes permitidos)
4. Rate Limiting (Anti DDoS)
5. JWT (Autenticación)
6. bcrypt (Passwords)
7. Prepared Statements (SQL Injection)
8. express-validator (Validación)
9. Role-based Access Control
10. Trazabilidad (Auditoría)
```

## 📦 Estructura de Módulos

### Backend

```
server.js
├── Configuración Express
├── Middleware globales
├── Rutas
│   ├── /api/auth
│   ├── /api/solicitudes
│   ├── /api/clientes-historicos
│   ├── /api/sheriff
│   ├── /api/dictamenes
│   ├── /api/trazabilidad
│   └── /api/usuarios
└── Error Handler
```

### Frontend

```
App.jsx
├── AuthProvider (Context)
└── Router
    ├── /login (Público)
    └── PrivateRoute
        └── Layout
            ├── Sidebar
            ├── Header
            └── Content
                ├── /dashboard
                ├── /solicitudes
                ├── /clientes
                ├── /evaluaciones
                ├── /usuarios
                └── /trazabilidad
```

## 🔌 Integración con API Externa (Sheriff)

```
1. Riesgos → Solicita consulta RUC
2. Backend → sheriffService.consultarRUC()
3. Axios → GET https://api.sheriff.com/v1/consulta?ruc=...
4. Response → JSON completo
5. Backend → INSERT INTO datos_sheriff (respuesta_json)
6. Backend → Actualiza estado solicitud
7. Response → Frontend con datos
8. Opcional → Generar Excel para análisis
```

## 📈 Escalabilidad

### Consideraciones Actuales
- Pool de conexiones MySQL (10 conexiones)
- Rate limiting (100 req/15min)
- JWT con expiración
- Queries optimizadas con índices

### Mejoras Futuras
- Cache con Redis
- Queue system para tareas pesadas
- Microservicios por módulo
- CDN para archivos estáticos
- Load balancer

## 🧪 Testing (Recomendaciones)

### Backend
```bash
npm install --save-dev jest supertest
```
- Unit tests: Controladores
- Integration tests: Endpoints
- Mock de base de datos

### Frontend
```bash
npm install --save-dev vitest @testing-library/react
```
- Component tests
- Integration tests
- E2E con Playwright

## 📚 Convenciones de Código

### Backend
- Nombres en camelCase
- Rutas en kebab-case
- Async/await (no callbacks)
- Try/catch + next(error)

### Frontend
- Componentes en PascalCase
- Hooks con "use" prefix
- Props destructuring
- CSS modules o clases BEM

## 🔍 Debugging

### Backend
```bash
# Logs de consultas
console.log('Query:', sql, params);

# Debug mode
NODE_ENV=development npm run dev
```

### Frontend
```bash
# React DevTools
# Network tab
# Console logs
console.log('API Response:', response.data);
```

---

Esta arquitectura permite:
✅ Separación de responsabilidades
✅ Escalabilidad horizontal
✅ Mantenibilidad
✅ Seguridad por capas
✅ Testing independiente
✅ Deployment flexible
