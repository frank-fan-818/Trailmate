# ====== Stage 1: Build ======
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root configs for path resolution
COPY package*.json tsconfig.json ./
COPY api-server/package*.json ./api-server/

# Install api-server dependencies
RUN cd api-server && npm ci

# Copy source files
COPY shared/ ./shared/
COPY api-server/ ./api-server/

# Compile TypeScript to JavaScript
RUN cd api-server && npx tsc --project tsconfig.json

# ====== Stage 2: Run ======
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/api-server/node_modules ./node_modules
COPY --from=builder /app/api-server/dist ./dist

EXPOSE 3456

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3456/health || exit 1

CMD ["node", "dist/api-server/src/index.js"]
