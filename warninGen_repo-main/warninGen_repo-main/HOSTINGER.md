# Despliegue en Hostinger

Esta guía te ayudará a desplegar tu aplicación React en Hostinger usando Git Deploy.

## 📋 Estructura del Proyecto

El proyecto ha sido reestructurado para ser compatible con Hostinger:

```
warning_gen/ (raíz)
├── src/                  # Código fuente React (frontend)
├── public/               # Archivos públicos
├── api/                  # Backend Node.js
│   ├── server.js
│   └── package.json
├── package.json          # Dependencias del frontend
├── database/             # Scripts SQL
└── docs/                 # Documentación
```

## 🚀 Despliegue en Hostinger

### Paso 1: Subir Cambios a GitHub

```bash
# En tu PC local
cd c:\Users\pafer\Desktop\warngen_antig_repo\warngen_antig_repo\warngen_antig\warning_gen

# Añadir cambios
git add .
git commit -m "Reestructurado para Hostinger"
git push origin main
```

### Paso 2: Importar en Hostinger

1. **Ir al panel de Hostinger**
   - Acceder a tu cuenta de Hostinger
   - Ir a la sección "Git" o "Despliegue"

2. **Conectar Repositorio**
   - Seleccionar "Importar desde GitHub"
   - Elegir el repositorio: `Paferce/warngen_antig_repo`
   - **Rama**: `main`
   - **Ruta del proyecto**: `warngen_antig_repo/warngen_antig/warning_gen`

3. **Configurar Build**
   - **Framework**: React (debería detectarlo automáticamente)
   - **Comando de build**: `npm run build`
   - **Directorio de salida**: `build`
   - **Comando de instalación**: `npm install`

### Paso 3: Configurar Variables de Entorno

En el panel de Hostinger, añadir estas variables de entorno:

```env
# React App
REACT_APP_API_URL=https://warngen.com/api

# Node.js (para el backend si lo despliegas en Hostinger)
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=u634918061_alertas
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=u634918061_sistema_alertas

# Twilio
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=xxxx...
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+1234567890

# Email
EMAIL_USER=tu@email.com
EMAIL_PASS=tu_contraseña
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
```

### Paso 4: Desplegar Backend (API)

El backend necesita desplegarse por separado. Opciones:

#### Opción A: SSH Manual (Recomendado)

```bash
# Conectar por SSH
ssh u634918061@tu-servidor.com

# Ir a la carpeta del dominio
cd /home/u634918061/domains/warngen.com

# Clonar el repositorio
git clone https://github.com/Paferce/warngen_antig_repo.git
cd warngen_antig_repo/warngen_antig_repo/warngen_antig/warning_gen

# Instalar dependencias del backend
cd api
npm install --production

# Configurar .env
cp .env.example .env
nano .env  # Editar con tus credenciales

# Iniciar con PM2
npm install -g pm2
pm2 start server.js --name warngen-api
pm2 save
pm2 startup
```

#### Opción B: Usar Node.js App de Hostinger

1. Crear una nueva "Node.js App" en Hostinger
2. Configurar:
   - **Versión Node.js**: 18.x
   - **Directorio de aplicación**: `/home/u634918061/domains/warngen.com/api`
   - **Archivo de inicio**: `server.js`
   - **Puerto**: 3001

### Paso 5: Configurar Nginx (Proxy Reverso)

Para que el frontend pueda comunicarse con el backend, configurar nginx:

```nginx
# En /etc/nginx/sites-available/warngen.com
server {
    listen 80;
    server_name warngen.com www.warngen.com;
    
    root /home/u634918061/domains/warngen.com/public_html;
    index index.html;
    
    # Frontend (React)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Webhooks
    location /webhook {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Reiniciar nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Actualizaciones Automáticas

### Configurar Webhook en GitHub

1. Ir a tu repositorio en GitHub
2. Settings → Webhooks → Add webhook
3. **Payload URL**: `https://warngen.com/deploy-hook` (proporcionado por Hostinger)
4. **Content type**: `application/json`
5. **Events**: Just the push event

Ahora cada vez que hagas `git push`, Hostinger desplegará automáticamente.

## 📝 Comandos Útiles

### Desarrollo Local

```bash
# Instalar dependencias
npm install
npm run install:api

# Iniciar frontend
npm start

# Iniciar backend (en otra terminal)
npm run start:api

# Build de producción
npm run build
```

### En el Servidor

```bash
# Ver logs del backend
pm2 logs warngen-api

# Reiniciar backend
pm2 restart warngen-api

# Actualizar código
cd /home/u634918061/domains/warngen.com/warngen_antig_repo/warngen_antig_repo/warngen_antig/warning_gen
git pull origin main
cd api && npm install
pm2 restart warngen-api
```

## 🐛 Solución de Problemas

### Hostinger no detecta React

- Verificar que `package.json` esté en la raíz
- Verificar que existan las carpetas `src/` y `public/`
- Revisar que la ruta del proyecto sea correcta

### Error de build

```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend no responde

```bash
# Verificar que esté corriendo
pm2 list

# Ver logs
pm2 logs warngen-api

# Reiniciar
pm2 restart warngen-api
```

## 🔒 Seguridad

- ✅ Nunca versionar archivos `.env`
- ✅ Usar variables de entorno en Hostinger
- ✅ Configurar HTTPS (Let's Encrypt)
- ✅ Restringir acceso a puerto 3001

---

**¿Necesitas ayuda?** Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para más opciones de despliegue.
