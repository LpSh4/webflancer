FROM node:20-alpine
WORKDIR /app

# 1. Прописываем зеркало и таймауты для npm, чтобы сеть на Coolify не отваливалась
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
ENV NPM_CONFIG_FETCH_TIMEOUT=300000
ENV NPM_CONFIG_FETCH_RETRIES=5

# 2. Ставим системную библиотеку (нужна для Vite/esbuild на Alpine)
RUN apk add --no-cache libc6-compat

# 3. Копируем package.json и устанавливаем зависимости через npm ci (как у тебя и работало)
COPY package*.json ./
RUN npm ci

ARG VITE_SOCKET_URL
ARG VITE_API_BASE_URL

# Переводим их в ENV, чтобы npm run build их увидел
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 4. Копируем исходники и собираем проект
COPY . .
RUN npm run build

EXPOSE 3000

# 5. Запускаем через npx, но явно указываем локальный бинарник, чтобы избежать синтаксического бага Node.js
CMD ["npx", "--no-install", "react-router-serve", "./build/server/index.js", "--host", "0.0.0.0"]