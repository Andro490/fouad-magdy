# ─────────────────────────────────────────────────────────────
# Frontend Dockerfile - Build React app then serve with Nginx
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build args for Vite env variables (baked in at build time)
ARG VITE_API_URL=""
ARG VITE_IMGBB_API_KEY=""
ARG VITE_GOOGLE_CLIENT_ID=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IMGBB_API_KEY=$VITE_IMGBB_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN chmod +x node_modules/.bin/* && npm run build

# ─────────────────────────────────────────────────────────────
# Production: serve with Nginx
# ─────────────────────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx config for SPA routing
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
