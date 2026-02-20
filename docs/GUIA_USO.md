# Guía de Uso - Sistema de Alertas v2.0

## Nuevas Características Implementadas

### 1. Sistema de Autenticación
- Acceso restringido solo para administradores autenticados
- Dos niveles de usuarios:
  - **Superadministrador**: Control total del sistema
  - **Administrador**: Gestión de contactos, plantillas y alertas

### 2. Gestión de Usuarios (Solo Superadmin)
- Crear nuevos administradores
- Activar/Desactivar acceso de administradores
- Control de permisos por roles
- Los superadministradores no pueden ser desactivados

### 3. Gestión Mejorada de Contactos
- Campos extendidos: ciudad, país, empresa, cargo, etc.
- Control de suscripciones por canal (Email, SMS, WhatsApp)
- Sistema de baja de contactos con motivo
- Posibilidad de reactivar contactos dados de baja
- Filtros por ciudad, país y estado de suscripción

### 4. Sistema de Baja de Contactos
- **Por administrador**: Dar de baja manualmente desde la interfaz
- **Por el contacto**: Endpoint público para que el contacto se dé de baja desde un mensaje
- Registro de todas las solicitudes de baja
- Motivos de baja rastreables

## Credenciales de Acceso

### Demo/Desarrollo:
```
Superadministrador:
Email: superadmin@ejemplo.com
Contraseña: admin123

Administrador:
Email: admin@ejemplo.com
Contraseña: admin123
```

### Producción:
Cambiar las contraseñas en la base de datos usando bcrypt:
```bash
# Instalar bcrypt
npm install bcrypt

# Generar hash
node
> const bcrypt = require('bcrypt');
> bcrypt.hashSync('tu_contraseña', 10);
```

## Flujo de Uso

### 1. Inicio de Sesión
1. Acceder a la aplicación
2. Ingresar email y contraseña
3. El sistema valida credenciales y verifica que el usuario esté activo
4. Si es válido, genera un token JWT y permite el acceso

### 2. Dashboard Principal
Al iniciar sesión, verás:
- **Enviados Total**: Total de mensajes enviados
- **Pendientes**: Alertas programadas pendientes
- **Contactos Activos**: Número de contactos activos
- **Plantillas**: Número de plantillas disponibles
- **Acciones Rápidas**: Botones para las funciones principales

### 3. Gestión de Contactos

#### Crear Nuevo Contacto:
1. Ir a "Contactos" en el menú
2. Completar el formulario:
   - Nombre (obligatorio)
   - Al menos un método de contacto (email, teléfono o WhatsApp)
   - Información adicional opcional
   - Seleccionar canales de suscripción
3. Clic en "Guardar Contacto"

#### Dar de Baja un Contacto:
1. Buscar el contacto en la lista
2. Clic en "Dar de baja"
3. Confirmar la acción
4. El contacto se marca como inactivo

#### Reactivar un Contacto:
1. En la lista, los contactos inactivos se muestran con etiqueta roja
2. Clic en "Reactivar"
3. El contacto vuelve a estar activo

### 4. Gestión de Plantillas

#### Crear Nueva Plantilla:
1. Ir a "Plantillas" en el menú
2. Completar:
   - Nombre identificativo
   - Tipo (Email, SMS o WhatsApp)
   - Asunto (solo para emails)
   - Mensaje con variables dinámicas
3. Usar formato `{{variable}}` para campos dinámicos
4. Clic en "Guardar Plantilla"

Ejemplo de mensaje con variables:
```
Hola {{nombre}}, 

Te informamos que {{evento}} será el {{fecha}} a las {{hora}}.

¡No te lo pierdas!
```

### 5. Enviar Alertas
1. Ir a "Enviar Alerta" en el menú
2. Seleccionar plantilla
3. Seleccionar destinatarios (contactos activos)
4. Elegir canales de envío
5. Opcionalmente programar fecha y hora
6. Clic en "Enviar Alerta" o "Programar Alerta"

### 6. Gestión de Usuarios (Solo Superadmin)

#### Crear Nuevo Administrador:
1. Ir a "Usuarios" en el menú (solo visible para superadmin)
2. Completar formulario:
   - Nombre completo
   - Email (será el usuario para login)
   - Contraseña
   - Rol (Admin o Superadmin)
3. Clic en "Crear Usuario"

#### Desactivar un Administrador:
1. En la lista de usuarios
2. Clic en "Desactivar" junto al usuario deseado
3. El usuario no podrá iniciar sesión
4. Sus sesiones activas se cierran automáticamente

#### Reactivar un Administrador:
1. Clic en "Activar" junto al usuario desactivado
2. El usuario podrá volver a iniciar sesión

## Sistema de Baja Pública

### Endpoint para que los contactos se den de baja:

```
POST /api/baja/solicitar/:contactoId
```

Este endpoint es público (no requiere autenticación) y permite que los contactos se den de baja desde:
- Enlaces en emails
- Respuestas a SMS
- Mensajes de WhatsApp

#### Ejemplo de implementación en email:
```html
<p>Si no deseas recibir más correos, 
   <a href="https://tudominio.com/api/baja/solicitar/{{contacto_id}}?tipo=email">
   haz clic aquí para darte de baja
   </a>
</p>
```

#### Parámetros:
- `contactoId` (en URL): ID del contacto
- `tipo` (en body): 'email', 'sms', 'whatsapp', 'web'
- `motivo` (en body, opcional): Razón de la baja

#### Respuesta:
```json
{
  "success": true,
  "mensaje": "Tu solicitud de baja ha sido procesada correctamente. No recibirás más mensajes."
}
```

## Integración con API en Producción

### Configuración del Backend:

1. Instalar dependencias adicionales:
```bash
npm install bcrypt jsonwebtoken
```

2. Configurar variables de entorno (.env):
```
DB_HOST=tu-servidor.hostinger.com
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=sistema_alertas
JWT_SECRET=clave_secreta_muy_segura_cambiar_esto
PORT=3000
```

3. Iniciar servidor:
```bash
node server.js
```

### Configuración del Frontend:

Modificar las llamadas API en el frontend para usar el servidor real:

```javascript
// Ejemplo de login real
const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setToken(data.token);
      setUsuario(data.usuario);
      setAutenticado(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
    } else {
      setErrorLogin(data.error);
    }
  } catch (error) {
    setErrorLogin('Error de conexión con el servidor');
  }
};
```

### Autenticación en peticiones:

Todas las peticiones a rutas protegidas deben incluir el token:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

fetch('http://localhost:3000/api/contactos', { headers })
  .then(res => res.json())
  .then(data => console.log(data));
```

## Seguridad

### Buenas Prácticas Implementadas:

1. **Contraseñas Hasheadas**: Usando bcrypt con 10 salt rounds
2. **Tokens JWT**: Con expiración de 24 horas
3. **Validación de Sesión**: Verifica que el usuario esté activo en cada petición
4. **Protección de Rutas**: Middleware de autenticación en todas las rutas sensibles
5. **Roles y Permisos**: Separación de superadmin y admin
6. **Cierre de Sesiones**: Al desactivar un usuario, se cierran todas sus sesiones

### Recomendaciones Adicionales:

1. Usar HTTPS en producción
2. Implementar rate limiting
3. Añadir logs de auditoría
4. Implementar 2FA (autenticación de dos factores)
5. Configurar CORS apropiadamente
6. Validar y sanitizar todas las entradas
7. Implementar recuperación de contraseña

## Endpoints Disponibles

### Autenticación:
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verificar` - Verificar token

### Usuarios (Solo Superadmin):
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id/estado` - Activar/Desactivar usuario

### Contactos:
- `GET /api/contactos` - Listar contactos (con filtros)
- `POST /api/contactos` - Crear contacto
- `PUT /api/contactos/:id` - Actualizar contacto
- `POST /api/contactos/:id/baja` - Dar de baja contacto
- `POST /api/contactos/:id/reactivar` - Reactivar contacto

### Plantillas:
- `GET /api/plantillas` - Listar plantillas
- `POST /api/plantillas` - Crear plantilla
- `DELETE /api/plantillas/:id` - Eliminar plantilla

### Baja Pública:
- `POST /api/baja/solicitar/:contactoId` - Solicitar baja (público)
- `GET /api/baja/solicitudes` - Listar solicitudes pendientes

### Estadísticas:
- `GET /api/estadisticas` - Obtener estadísticas

## Solución de Problemas

### No puedo iniciar sesión:
- Verificar que las credenciales sean correctas
- Comprobar que el usuario esté activo
- Verificar conexión con la base de datos
- Revisar logs del servidor

### Usuario desactivado:
- Solo el superadmin puede reactivar usuarios
- Contactar con el superadministrador

### Token inválido o expirado:
- Cerrar sesión y volver a iniciar sesión
- Los tokens expiran después de 24 horas

### No aparecen los datos:
- Verificar que el servidor backend esté ejecutándose
- Comprobar la configuración de la base de datos
- Revisar la consola del navegador para errores

## Migración desde Versión Anterior

Si vienes de la versión sin autenticación:

1. Ejecutar el nuevo script SQL para crear tablas de usuarios
2. Crear el primer superadministrador:
```sql
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Super Admin', 'superadmin@tudominio.com', '$2b$10$...hash...', 'superadmin');
```
3. Actualizar el frontend con el nuevo código
4. Actualizar el backend con el nuevo código
5. Los datos de contactos y plantillas se mantienen

## Soporte

Para problemas o dudas:
1. Revisar esta documentación
2. Consultar logs del servidor
3. Verificar configuración de la base de datos
4. Contactar con el equipo de desarrollo

---

**Versión**: 2.0.0  
**Última actualización**: Noviembre 2025  
**Características**: Autenticación, Roles, Gestión de Usuarios, Contactos Mejorados