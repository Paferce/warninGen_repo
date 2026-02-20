# 🚀 Inicio Rápido - Despliegue

## Opción 1: Docker (Más Rápido) ⚡

### Windows
```bash
deploy.bat
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Opción 2: Docker Manual 🐳

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 2. Iniciar
docker-compose up -d

# 3. Ver logs
docker-compose logs -f
```

**Acceso:**
- Frontend: http://localhost
- Backend: http://localhost:3001

---

## Comandos Útiles 🛠️

```bash
# Ver estado
docker-compose ps

# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Ver logs
docker-compose logs -f backend

# Reconstruir
docker-compose up -d --build
```

---

## Variables de Entorno Requeridas 📝

Editar `.env` con:

```env
# Base de Datos
DB_PASSWORD=tu_contraseña_segura

# Twilio (obtener en twilio.com)
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=xxxx...
TWILIO_PHONE_NUMBER=+1234567890

# Email (Gmail: usar App Password)
EMAIL_USER=tu@email.com
EMAIL_PASS=tu_app_password
```

---

## Solución Rápida de Problemas 🔧

### Error de conexión a MySQL
```bash
docker-compose logs database
docker-compose restart database
```

### Frontend no carga
```bash
docker-compose logs frontend
docker-compose up -d --build frontend
```

### Backend no responde
```bash
docker-compose logs backend
# Verificar .env
cat .env
```

---

## 📖 Documentación Completa

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para:
- Instrucciones detalladas
- Despliegue en cloud (Vercel, Railway, Render)
- Configuración de HTTPS
- Backups y mantenimiento

---

## ✅ Checklist Antes de Desplegar

- [ ] Docker Desktop instalado
- [ ] Archivo `.env` configurado
- [ ] Credenciales de Twilio obtenidas
- [ ] Credenciales SMTP configuradas
- [ ] Script SQL en carpeta `database/`

---

**¿Necesitas ayuda?** Consulta DEPLOYMENT.md
