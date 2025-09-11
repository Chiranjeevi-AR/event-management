# Multi-stage Docker build for Campus Drive Platform

# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --only=production
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Build backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production
COPY backend/ ./backend/

# Production stage
FROM node:18-alpine as production
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S campus -u 1001

# Copy built applications
COPY --from=build --chown=campus:nodejs /app/backend ./backend
COPY --from=build --chown=campus:nodejs /app/frontend/build ./frontend/build

# Set working directory to backend
WORKDIR /app/backend

# Create data directory for SQLite database
RUN mkdir -p data && chown campus:nodejs data

# Switch to non-root user
USER campus

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
