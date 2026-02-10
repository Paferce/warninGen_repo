# Etapa de construcción
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos desde la etapa de construcción
COPY --from=builder /app/build /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando de inicio (nginx se inicia automáticamente)
CMD ["nginx", "-g", "daemon off;"]
