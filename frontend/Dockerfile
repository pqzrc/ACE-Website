FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

# Build arguments for Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_HCAPTCHA_SITEKEY
ARG NEXT_PUBLIC_CTFD_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_HCAPTCHA_SITEKEY=$NEXT_PUBLIC_HCAPTCHA_SITEKEY
ENV NEXT_PUBLIC_CTFD_URL=$NEXT_PUBLIC_CTFD_URL

RUN npm run build

# Production image
FROM node:20-alpine AS runner

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
