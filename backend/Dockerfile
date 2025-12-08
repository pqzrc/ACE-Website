FROM node:20-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=nodejs:nodejs . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source files after build
RUN rm -rf src/ && \
    rm -rf node_modules/.cache

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start application in production mode
CMD ["npm", "run", "start"]
