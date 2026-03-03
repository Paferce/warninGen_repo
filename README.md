# Sistema de Alertas Automatizado - Guía de Instalación

## Descripción

Sistema completo de alertas multicanal (Email, SMS, WhatsApp) con interfaz web y móvil, gestión de plantillas y programación de envíos.

## Características Principales

-  **Sistema de autenticación**: Acceso solo para administradores autorizados
-  **Dos niveles de usuarios**: Superadministrador y Administrador
-  **Gestión de administradores**: El superadmin puede activar/desactivar administradores
-  Gestión de plantillas para Email, SMS y WhatsApp
-  Variables dinámicas en plantillas
-  Envío multicanal simultáneo
-  Programación de envíos
-  Dashboard con estadísticas en tiempo real
-  **Gestión avanzada de contactos** con múltiples parámetros
-  **Sistema de baja de contactos** (por administrador o por el propio contacto)
-  **Control de suscripciones** por canal (Email, SMS, WhatsApp)
-  Historial de envíos
-  Interfaz responsiva (móvil y web)

## Archivos del Proyecto

```
sistema-alertas/
├── sistema-alertas.jsx         # Aplicación frontend React
├── server.js                   # Servidor backend Node.js + Express + MySQL
├── DOCUMENTACION_TECNICA.md    # Documentación técnica completa
└── README.md                   # Este archivo
```

## Requisitos Previos

### Para Desarrollo Local (XAMPP):
- Node.js v14 o superior
- XAMPP (con MySQL y Apache)
- Navegador web moderno

### Para Producción (Hostinger):
- Cuenta de Hostinger con MySQL
- Node.js v14 o superior (en tu servidor o local para desarrollo)
- Credenciales de APIs (Twilio para SMS/WhatsApp, SMTP para email)

### Dependencias adicionales (Autenticación):
- bcrypt (hasheo de contraseñas)
- jsonwebtoken (tokens JWT)

## Usuarios por Defecto

El sistema viene con usuarios de ejemplo:

```
Superadministrador:
Email: superadmin@ejemplo.com
Contraseña: admin123

Administrador:
Email: admin@ejemplo.com
Contraseña: admin123
```

**IMPORTANTE**: Cambiar estas contraseñas en producción.

## Instalación Paso a Paso

### 1. Configurar Base de Datos

#### Opción A: XAMPP (Desarrollo Local)

1. Iniciar XAMPP Control Panel
2. Iniciar los servicios de Apache y MySQL
3. Abrir phpMyAdmin en: http://localhost/phpmyadmin
4. Crear nueva base de datos llamada `sistema_alertas`
5. Seleccionar la base de datos y ir a la pestaña "SQL"
6. Copiar y ejecutar el script SQL de la documentación técnica

#### Opción B: Hostinger (Producción)

1. Acceder al panel de control de Hostinger
2. Ir a "Bases de datos" → "MySQL Databases"
3. Crear nueva base de datos:
   - Nombre: `sistema_alertas`
   - Usuario: crear uno nuevo o usar existente
   - Anotar: host, usuario, contraseña
4. Abrir phpMyAdmin desde el panel de Hostinger
5. Seleccionar la base de datos y ejecutar el script SQL

### 2. Configurar Backend

1. Crear carpeta para el proyecto:
```bash
mkdir sistema-alertas-backend
cd sistema-alertas-backend
```

2. Inicializar proyecto Node.js:
```bash
npm init -y
```

3. Instalar dependencias:
```bash
npm install express cors mysql2 dotenv bcrypt jsonwebtoken
```

4. Copiar el archivo `server.js` a la carpeta del proyecto

5. Editar `server.js` y actualizar la configuración de la base de datos:

```javascript
// Para XAMPP (local):
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_alertas'
};

// Para Hostinger (producción):
const dbConfig = {
    host: 'tu-servidor.hostinger.com',  // Ej: mysql123.hostinger.com
    user: 'tu_usuario',
    password: 'tu_contraseña',
    database: 'sistema_alertas'
};
```

6. Iniciar el servidor:
```bash
node server.js
```

Deberías ver:
```
 Conexión a MySQL establecida correctamente
 Servidor iniciado en http://localhost:3000
```

### 3. Configurar Frontend

#### Opción A: Ejecutar en el Navegador (Demo rápida)

1. Abrir el archivo `sistema-alertas.jsx`
2. Copiar todo el contenido
3. Ir a https://claude.ai
4. Crear un nuevo artefacto React y pegar el código
5. La aplicación se ejecutará en el navegador

#### Opción B: Proyecto React Completo

1. Crear proyecto React:
```bash
npx create-react-app sistema-alertas-frontend
cd sistema-alertas-frontend
```

2. Instalar dependencias adicionales:
```bash
npm install lucide-react axios
```

3. Copiar el contenido de `sistema-alertas.jsx` a `src/App.js`

4. Modificar el código para conectar con el backend:

```javascript
// Al inicio del componente, añadir configuración de API:
const API_URL = 'http://localhost:3000/api';

// Ejemplo de cómo cargar plantillas desde el backend:
useEffect(() => {
    fetch(`${API_URL}/plantillas`)
        .then(res => res.json())
        .then(data => setPlantillas(data))
        .catch(err => console.error('Error:', err));
}, []);
```

5. Iniciar la aplicación:
```bash
npm start
```

La aplicación estará disponible en: http://localhost:3001

### 4. Configurar Servicios de Mensajería (Opcional para la demo)

#### Email - SMTP

Editar `server.js` y añadir:

```javascript
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
        user: 'tu-email@tudominio.com',
        pass: 'tu-contraseña-email'
    }
});
```

#### SMS y WhatsApp - Twilio

1. Crear cuenta en Twilio: https://www.twilio.com
2. Obtener Account SID y Auth Token
3. Instalar SDK:
```bash
npm install twilio
```

4. Añadir a `server.js`:
```javascript
const twilio = require('twilio');
const twilioClient = twilio(
    'TU_ACCOUNT_SID',
    'TU_AUTH_TOKEN'
);
```

## Uso de la Aplicación

### 1. Autenticación
- Iniciar sesión con credenciales de administrador
- El sistema valida usuario y verifica que esté activo
- Genera token JWT con expiración de 24 horas

### 2. Dashboard
- Ver estadísticas generales
- Accesos rápidos a funciones principales

### 3. Gestión de Contactos
- Crear contactos con información detallada (nombre, email, teléfono, WhatsApp, empresa, ciudad, etc.)
- Control de suscripciones por canal
- Dar de baja contactos manualmente
- Reactivar contactos dados de baja
- Filtrar por ciudad, país, estado

### 4. Sistema de Baja de Contactos
- **Por administrador**: Dar de baja desde la interfaz con motivo
- **Por el contacto**: Endpoint público `/api/baja/solicitar/:contactoId` para que el contacto se dé de baja
- Todas las bajas quedan registradas con fecha y motivo

### 5. Gestión de Plantillas
- Crear plantillas para diferentes canales
- Usar variables dinámicas: `{{nombre}}`, `{{fecha}}`, etc.
- Ver y eliminar plantillas existentes

### 6. Envío de Alertas
- Seleccionar plantilla
- Elegir destinatarios (individual o múltiple)
- Seleccionar canales (Email, SMS, WhatsApp)
- Enviar inmediatamente o programar

### 7. Gestión de Usuarios (Solo Superadmin)
- Crear nuevos administradores
- Activar/Desactivar administradores
- No se puede desactivar al superadministrador
- Al desactivar un admin, se cierran todas sus sesiones

## Estructura de la Base de Datos

### Tablas Principales:
- `plantillas` - Plantillas de mensajes
- `contactos` - Base de datos de destinatarios
- `alertas` - Registro de alertas enviadas/programadas
- `alertas_destinatarios` - Relación alertas-contactos
- `estadisticas_mensuales` - Estadísticas mensuales de envío
- `configuracion` - Configuración del sistema

## Migración de Demo a Producción

1. **Cambiar localStorage por API**:
   - Reemplazar todas las llamadas a `localStorage` por llamadas a la API
   - Usar `fetch` o `axios` para comunicarse con el backend

2. **Implementar autenticación**:
   - Añadir JWT (JSON Web Tokens)
   - Crear sistema de login/registro

3. **Implementar envíos reales**:
   - Integrar APIs de Twilio, SendGrid, etc.
   - Crear sistema de colas para envíos masivos

4. **Optimizar para producción**:
   - Implementar caché
   - Añadir rate limiting
   - Configurar HTTPS

## Solución de Problemas

### Error: "Cannot connect to MySQL"
- Verificar que MySQL esté ejecutándose (XAMPP o Hostinger)
- Comprobar credenciales en `server.js`
- Verificar que la base de datos `sistema_alertas` existe

### Error: "CORS policy"
- Asegurarse de que el backend tenga `cors` instalado y configurado
- Verificar que las URLs coincidan entre frontend y backend

### La aplicación no carga datos
- Verificar que el servidor backend esté ejecutándose
- Comprobar la consola del navegador para errores
- Verificar que las tablas de la BD tengan datos

## Próximos Pasos

1.  Demo funcional con localStorage
2.  Integración completa con MySQL
3.  Implementación de envíos reales
4.  Sistema de autenticación
5.  Panel de reportes avanzado
6.  Aplicación móvil React Native

## Costos Estimados

### Servicios de mensajería:
- Email: Gratis (SMTP incluido en Hostinger) o SendGrid Free (100/día)
- SMS: Twilio (~0.04€/SMS)
- WhatsApp: Twilio WhatsApp API (~0.005€/mensaje)

## Soporte y Contacto

Para dudas o problemas:
1. Revisar la DOCUMENTACION_TECNICA.md
2. Consultar logs del servidor
3. Verificar la consola del navegador

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025