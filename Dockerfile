# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc -p tsconfig.json

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
USER node
#HEALTHCHECK --interval=1m30s --timeout=10s --retries=2 --start-period=40s --start-interval=5s CMD ["curl", "-f", "http://localhost:3000"]
EXPOSE 3000
CMD ["sh", "-c", "node dist/server.js"]