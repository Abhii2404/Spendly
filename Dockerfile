# ================================
# Stage 1: Builder
# Installs deps and builds Next.js
# ================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Build args for Supabase
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build the Next.js application
RUN npm run build

# ================================
# Stage 2: Runner
# Minimal production image
# ================================
FROM node:20-alpine AS runner
WORKDIR /app

# Image metadata
LABEL maintainer="Abhii2404"
LABEL version="1.0.0"
LABEL description="Spendly Personal Finance Tracker"
LABEL org.opencontainers.image.source="https://github.com/Abhii2404/Spendly"

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs \
  /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs \
  /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=30s \
            --retries=3 \
  CMD wget --no-verbose --tries=1 \
      --spider http://localhost:3000/ \
      || exit 1

# Start the application
CMD ["node", "server.js"]