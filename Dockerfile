# Stage 1: Build React frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy configuration and source files
COPY tsconfig*.json vite.config.ts index.html ./
COPY public/ ./public/
COPY src/ ./src/

# Build production bundle to dist/
RUN npm run build

# Stage 2: Serve with high-performance Nginx
FROM nginx:alpine AS runner

# Remove default static pages
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Select a fail-closed bootstrap config until the TLS certificate is provisioned.
COPY nginx/conf.d/ /etc/nginx/site-config/
COPY nginx/select-site-config.sh /docker-entrypoint.d/40-select-site-config.sh
RUN chmod +x /docker-entrypoint.d/40-select-site-config.sh

EXPOSE 80
EXPOSE 443

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
