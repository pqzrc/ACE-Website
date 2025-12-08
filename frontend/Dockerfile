FROM node:20-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs . .

# Build arguments for Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_HCAPTCHA_SITEKEY
ARG NEXT_PUBLIC_CTFD_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_HCAPTCHA_SITEKEY=$NEXT_PUBLIC_HCAPTCHA_SITEKEY
ENV NEXT_PUBLIC_CTFD_URL=$NEXT_PUBLIC_CTFD_URL

# Build Next.js
RUN npm run build

# Create cache directory for Next.js image optimization with correct permissions
RUN mkdir -p /app/.next/cache/images && chown -R nextjs:nodejs /app/.next/cache

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["npm", "start"]
