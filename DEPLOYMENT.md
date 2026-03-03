# Guía de Despliegue - Sistema de Alertas React

Esta guía proporciona instrucciones completas para desplegar el Sistema de Alertas en producción.

##  Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Opción 1: Despliegue con Docker (Recomendado)](#opción-1-despliegue-con-docker-recomendado)
- [Opción 2: Despliegue Manual](#opción-2-despliegue-manual)
- [Opción 3: Despliegue en Plataformas Cloud](#opción-3-despliegue-en-plataformas-cloud)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

### Para Despliegue con Docker:
- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido con Docker Desktop)
- 4GB de RAM mínimo
- 10GB de espacio en disco

### Para Despliegue Manual:
- Node.js 18 o superior
- MySQL 8.0 o superior
- Nginx (para servir el frontend)

### Credenciales de Servicios Externos:
- **Twilio**: Para SMS y WhatsApp ([Crear cuenta](https://www.twilio.com))
- **SMTP**: Para envío de emails (Gmail, Hostinger, etc.)

---

## Opción 1: Despliegue con Docker (Recomendado)

### 1. Preparar Variables de Entorno

Copiar el archivo de ejemplo y configurar con valores reales:

```bash
# En el directorio raíz del proyecto
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Base de Datos
DB_USER=alertas_user
DB_PASSWORD=TuContraseñaSegura123!
DB_NAME=sistema_alertas

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Email
EMAIL_USER=tu_email@ejemplo.com
EMAIL_PASS=tu_contraseña_app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 2. Inicializar Base de Datos

Asegúrate de que el script SQL de inicialización esté en la carpeta `database/`:

```bash
# Verificar que existe el archivo
ls database/
```

Si no existe, crea el archivo `database/init.sql` con el esquema de la base de datos.

### 3. Construir y Ejecutar los Contenedores

```bash
# Construir las imágenes
docker-compose build

# Iniciar los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 4. Verificar el Despliegue

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001/api/contactos
- **Base de Datos**: localhost:3306

```bash
# Verificar estado de los contenedores
docker-compose ps

# Verificar logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

### 5. Comandos Útiles de Docker

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina datos de BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver logs de un servicio
docker-compose logs -f backend

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend sh
docker-compose exec database mysql -u root -p

# Reconstruir después de cambios en el código
docker-compose up -d --build
```

---

## Opción 2: Despliegue Manual

### Backend

#### 1. Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
```

#### 2. Instalar Dependencias

```bash
npm install --production
```

#### 3. Configurar Base de Datos

Ejecutar el script SQL en tu servidor MySQL:

```bash
mysql -u root -p < ../database/init.sql
```

#### 4. Iniciar el Servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run start:prod
```

### Frontend

#### 1. Configurar Variables de Entorno

```bash
cd frontend
cp .env.production.example .env.production
```

Editar `.env.production`:

```env
REACT_APP_API_URL=http://tu-servidor.com:3001
```

#### 2. Construir para Producción

```bash
npm install
npm run build
```

#### 3. Servir con Nginx

Copiar la configuración de nginx:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/alertas
sudo ln -s /etc/nginx/sites-available/alertas /etc/nginx/sites-enabled/
```

Copiar archivos construidos:

```bash
sudo cp -r build/* /var/www/html/alertas/
```

Reiniciar nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Opción 3: Despliegue en Plataformas Cloud

### Vercel (Frontend)

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Desplegar frontend:
```bash
cd frontend
vercel --prod
```

3. Configurar variables de entorno en el dashboard de Vercel:
   - `REACT_APP_API_URL`: URL de tu backend

### Railway (Backend + Base de Datos)

1. Crear cuenta en [Railway.app](https://railway.app)

2. Crear nuevo proyecto desde GitHub

3. Añadir servicio MySQL desde el marketplace

4. Configurar variables de entorno en Railway:
   - Todas las variables del archivo `.env.example`

5. Railway detectará automáticamente el `Dockerfile` y desplegará

### Render (Alternativa Full-Stack)

1. Crear cuenta en [Render.com](https://render.com)

2. Crear Web Service para el backend:
   - Build Command: `npm install`
   - Start Command: `npm run start:prod`

3. Crear Static Site para el frontend:
   - Build Command: `npm run build`
   - Publish Directory: `build`

4. Crear PostgreSQL o MySQL database

---

## Configuración de Variables de Entorno

### Variables Requeridas

#### Base de Datos
```env
DB_HOST=localhost          # Host de MySQL
DB_USER=root              # Usuario de MySQL
DB_PASSWORD=              # Contraseña de MySQL
DB_NAME=sistema_alertas   # Nombre de la base de datos
```

#### Twilio (SMS y WhatsApp)
```env
TWILIO_ACCOUNT_SID=ACxxxx...    # Account SID de Twilio
TWILIO_AUTH_TOKEN=xxxx...       # Auth Token de Twilio
TWILIO_PHONE_NUMBER=+1234567890 # Número de teléfono Twilio
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890  # Número WhatsApp
WHATSAPP_CONTENT_SID=HXxxxx...  # Content SID (opcional)
```

#### Email (SMTP)
```env
EMAIL_USER=tu@email.com         # Email del remitente
EMAIL_PASS=tu_contraseña        # Contraseña o App Password
SMTP_HOST=smtp.gmail.com        # Servidor SMTP
SMTP_PORT=587                   # Puerto SMTP
SMTP_FROM_NAME=Sistema Alertas  # Nombre del remitente
```

### Obtener Credenciales

#### Twilio
1. Registrarse en https://www.twilio.com
2. Ir a Console → Account Info
3. Copiar Account SID y Auth Token
4. Comprar un número de teléfono con capacidad SMS/WhatsApp

#### Gmail (SMTP)
1. Activar verificación en 2 pasos
2. Ir a Cuenta Google → Seguridad → Contraseñas de aplicaciones
3. Generar nueva contraseña de aplicación
4. Usar esa contraseña en `EMAIL_PASS`

---

## Configuración de Base de Datos

### Script de Inicialización

El archivo `database/init.sql` debe contener:

```sql
CREATE DATABASE IF NOT EXISTS sistema_alertas;
USE sistema_alertas;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'superadmin') DEFAULT 'admin',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    whatsapp VARCHAR(20),
    tipo_usuario VARCHAR(50) DEFAULT 'Residente',
    tipo_punto_critico VARCHAR(100),
    zona VARCHAR(100),
    distrito VARCHAR(100),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    suscrito_email BOOLEAN DEFAULT FALSE,
    suscrito_sms BOOLEAN DEFAULT FALSE,
    suscrito_whatsapp BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de plantillas
CREATE TABLE IF NOT EXISTS plantillas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('email', 'sms', 'whatsapp') NOT NULL,
    asunto VARCHAR(200),
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuario por defecto (cambiar contraseña en producción)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@ejemplo.com', 'admin123', 'superadmin')
ON DUPLICATE KEY UPDATE nombre=nombre;
```

### Migración de Datos

Si ya tienes datos en desarrollo:

```bash
# Exportar datos
mysqldump -u root -p sistema_alertas > backup.sql

# Importar en producción
mysql -u root -p sistema_alertas < backup.sql
```

---

## Solución de Problemas

### Error: "Cannot connect to MySQL"

**Causa**: El backend no puede conectarse a la base de datos.

**Solución**:
```bash
# Verificar que MySQL está corriendo
docker-compose ps database

# Ver logs de MySQL
docker-compose logs database

# Verificar credenciales en .env
cat .env | grep DB_
```

### Error: "CORS policy"

**Causa**: El frontend no puede hacer peticiones al backend.

**Solución**:
1. Verificar que `FRONTEND_URL` en `.env` coincide con la URL del frontend
2. En desarrollo local, usar `http://localhost` (sin puerto)

### Frontend muestra página en blanco

**Causa**: Error en el build o configuración de nginx.

**Solución**:
```bash
# Ver logs del contenedor frontend
docker-compose logs frontend

# Verificar que el build se completó
docker-compose exec frontend ls /usr/share/nginx/html

# Reconstruir frontend
docker-compose up -d --build frontend
```

### Webhooks de WhatsApp no funcionan

**Causa**: Twilio no puede alcanzar tu servidor.

**Solución**:
1. Usar ngrok para exponer tu servidor local:
   ```bash
   ngrok http 80
   ```
2. Configurar la URL del webhook en Twilio:
   - Ir a Twilio Console → WhatsApp → Sandbox
   - Configurar webhook: `https://tu-url.ngrok.io/webhook/whatsapp`

### Emails no se envían

**Causa**: Credenciales SMTP incorrectas o bloqueadas.

**Solución**:
1. Verificar credenciales en `.env`
2. Para Gmail, usar "Contraseñas de aplicaciones"
3. Verificar que el puerto 587 no esté bloqueado

### Contenedor se reinicia constantemente

**Causa**: Error en la aplicación o falta de dependencias.

**Solución**:
```bash
# Ver logs detallados
docker-compose logs --tail=100 backend

# Ejecutar shell en el contenedor
docker-compose exec backend sh

# Verificar variables de entorno
docker-compose exec backend env
```

---

## Comandos de Mantenimiento

### Backup de Base de Datos

```bash
# Backup completo
docker-compose exec database mysqldump -u root -p sistema_alertas > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T database mysql -u root -p sistema_alertas < backup_20260210.sql
```

### Actualizar la Aplicación

```bash
# 1. Hacer backup
docker-compose exec database mysqldump -u root -p sistema_alertas > backup.sql

# 2. Detener servicios
docker-compose down

# 3. Actualizar código (git pull, etc.)

# 4. Reconstruir y reiniciar
docker-compose up -d --build

# 5. Verificar logs
docker-compose logs -f
```

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f --tail=50

# Ver solo errores
docker-compose logs | grep -i error
```

---

## Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar contraseñas por defecto en la base de datos
- [ ] Usar contraseñas fuertes para `DB_PASSWORD`
- [ ] Configurar HTTPS (usar Let's Encrypt)
- [ ] Restringir acceso a puerto 3306 (MySQL)
- [ ] Usar variables de entorno para secretos (no hardcodear)
- [ ] Configurar firewall para permitir solo puertos 80/443
- [ ] Habilitar logs de auditoría
- [ ] Configurar backups automáticos

### Configurar HTTPS con Let's Encrypt

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com

# Renovación automática
sudo certbot renew --dry-run
```

---

## Soporte

Para más ayuda:
- Revisar logs: `docker-compose logs`
- Documentación de Docker: https://docs.docker.com
- Documentación de Twilio: https://www.twilio.com/docs
- Issues del proyecto: [GitHub Issues]

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026
