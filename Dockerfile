FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Si usas variables de entorno
ENV PORT=4321
EXPOSE 4321

CMD ["node", "index.js"]
# Comando para iniciar la aplicación|