# ─────────────────────────────────────────────────────────────
# Backend Dockerfile - Multi-stage build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client & build TypeScript
RUN npx prisma generate && npm run build

# ─────────────────────────────────────────────────────────────
# Production image - smaller footprint
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output and prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy source data directory (coaches.json, settings.json)
COPY src/data/ ./src/data/

# Copy prisma schema for migrations
COPY prisma/ ./prisma/

# Install curl and netcat for healthcheck & postgres wait
RUN apk add --no-cache curl netcat-openbsd

# ── Entrypoint script: يشغل migration أولاً ثم السيرفر ──────
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
