# GUÍA DE INICIO RÁPIDO

## ⚡ Instalación Rápida

### 1. Base de Datos (5 minutos)

```bash
# Abrir MySQL Workbench o línea de comandos
mysql -u root -p

# Copiar y pegar el contenido de database/schema.sql
# Luego copiar y pegar database/seed.sql
```

### 2. Backend (2 minutos)

```bash
cd backend
npm install
copy .env.example .env
```

**Editar `.env` con tus datos:**
```env
DB_PASSWORD=TU_PASSWORD_MYSQL
JWT_SECRET=cualquier_texto_largo_y_secreto
```

### 3. Frontend (2 minutos)

```bash
cd frontend
npm install
```

### 4. Ejecutar (1 minuto)

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

**Abrir navegador:** http://localhost:5173

## 🔑 Acceso Rápido

- Usuario: `admin`
- Password: `Admin123!`

## ✅ Checklist de Verificación

- [ ] MySQL instalado y corriendo
- [ ] Node.js 18+ instalado
- [ ] Base de datos creada (schema.sql ejecutado)
- [ ] Datos de prueba cargados (seed.sql ejecutado)
- [ ] Backend `.env` configurado
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Login exitoso con usuario `admin`

## 🆘 Problemas Comunes

**"Cannot connect to MySQL"**
- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env`

**"Token inválido"**
- Hacer logout y login nuevamente
- Verificar que JWT_SECRET esté configurado

**Puerto en uso**
- Backend: cambiar PORT en `.env`
- Frontend: cambiar port en `vite.config.js`

## 📱 Primeros Pasos

1. **Login** con usuario `admin`
2. Ver **Dashboard** con estadísticas
3. Ir a **Solicitudes** para ver ejemplos
4. Como **Admin**, puedes acceder a todos los módulos

## 🎓 Usuarios de Prueba

```
admin / Admin123!        → Acceso completo
comercial1 / Admin123!   → Crear solicitudes
riesgos1 / Admin123!     → Evaluar y emitir dictámenes
```

---

¿Todo funcionando? ¡Excelente! Revisa el README.md completo para más detalles.
