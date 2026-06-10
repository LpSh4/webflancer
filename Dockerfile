FROM node:20-alpine AS builder

# 2. Устанавливаем libc6-compat и pnpm
RUN apk add --no-cache libc6-compat && \
    npm install -g pnpm

WORKDIR /app

# 3. Копируем файлы описания зависимостей ВКЛЮЧАЯ pnpm-lock.yaml
# Если локально pnpm-lock.yaml есть, он обязательно должен быть в контейнере!
COPY package*.json pnpm-lock.y* ./

# 4. Настройка pnpm для работы в CI и запуск сборки бинарников
# Разрешаем сборку нативных модулей (esbuild) с помощью --no-frozen-lockfile,
# если вдруг pnpm-lock отсутствует, и отключаем игнорирование скриптов.
RUN pnpm config set network-timeout 300000 && \
    pnpm install --only=prod=false --ignore-scripts=false

COPY . .

# 5. Build
RUN pnpm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
RUN apk add --no-cache libc6-compat

# Копируем результат сборки
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Запускаем сервер напрямую через ноду, чтобы избежать лишних сетевых оверхедов npx в продакшене
CMD ["node", "./node_modules/.bin/react-router-serve", "./build/server/index.js", "--host", "0.0.0.0"]