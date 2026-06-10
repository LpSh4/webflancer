FROM node:20-alpine AS builder

# 1. Standard Chinese Mirror
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

# 2. Install pnpm and essential build tools
# libc6-compat is needed for Vite/Tailwind binaries on Alpine
RUN apk add --no-cache libc6-compat && \
    npm install -g pnpm

WORKDIR /app

# 3. Copy only dependency files
COPY package*.json ./

# 4. Use pnpm with a high network timeout and limited concurrency
# This bypasses the NPM stalling bug by using a different fetching engine
RUN pnpm config set network-timeout 300000 && \
    pnpm install --frozen-lockfile || pnpm install

COPY . .

# 5. Build
RUN pnpm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Ensure we have the same environment fixes for the runner
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
RUN apk add --no-cache libc6-compat

# Copy the build output
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Option A: If you want to be safe, copy the modules from builder
# instead of installing them again
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Use 'npx' only if the package is in your dependencies,
# otherwise call the bin directly to avoid network lookups
CMD ["npx", "react-router-serve", "./build/server/index.js", "--host", "0.0.0.0"]