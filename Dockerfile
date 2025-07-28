# Imagen base
FROM node:20

# Instala nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copiar el resto del código
COPY . .

# Copiar config de NGINX
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer el puerto 80 (NGINX)
EXPOSE 80

# Iniciar ambos servicios
CMD ["/entrypoint.sh"]
