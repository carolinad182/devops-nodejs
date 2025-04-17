# Build stage
FROM node:18.15.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm ci --ignore-scripts \
  && rm -rf node_modules/sqlite3 \
  && npm install sqlite3 --ignore-scripts=false

#Copy only necessary files
COPY index.js ./
COPY shared/ ./shared/
COPY users/ ./users/
COPY .babelrc ./


# COPY . .


# Production stage
FROM node:18.15.0-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/users ./users
COPY --from=builder /app/.babelrc ./

# Create directory for SQLite database and set permissions
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/users || exit 1

# Start the application
CMD ["npm", "start"] 