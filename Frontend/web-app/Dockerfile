# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument
ARG NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL

# Copy package files
COPY package*.json ./

# Install dependencies with retry logic
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps --prefer-offline || \
    (sleep 5 && npm install --legacy-peer-deps --prefer-offline) || \
    (sleep 10 && npm install --legacy-peer-deps --prefer-offline)

# Copy source code
COPY . .

# Create icon.png from 192x192 icon
RUN cp public/icons/icon-192x192.png public/icon.png || echo "Icon copy skipped"

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]