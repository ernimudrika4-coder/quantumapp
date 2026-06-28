# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace configurations
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies for the backend workspace
RUN npm ci --workspace=backend

# Copy source code and config files
COPY backend/tsconfig.json ./backend/
COPY backend/prisma ./backend/prisma/
COPY backend/src ./backend/src/

# Generate Prisma Client and compile TypeScript
WORKDIR /app/backend
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy workspace configurations
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies for the backend workspace
RUN npm ci --omit=dev --workspace=backend

# Copy compiled files and generated prisma client from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose port and configure start command
EXPOSE 4000
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
