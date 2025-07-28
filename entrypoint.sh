#!/bin/sh

echo "🟢 Sobrescribiendo variables de entorno en .env"

# Sobrescribir variables de entorno en .env (crear nuevo .env dentro del contenedor)
env | grep -E '^(ACCESS_TOKEN|REFRESH_TOKEN|RESEND_KEY|MYSQL_)' > .env

echo "✅ Variables escritas en .env:"
cat .env

# Iniciar Node.js en segundo plano
node index.js &

# Iniciar NGINX en primer plano
nginx -g "daemon off;"
