FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY backend ./backend
COPY src ./src
COPY public ./public
COPY tsconfig.json ./

RUN npx prisma generate --schema=backend/prisma/schema.prisma

EXPOSE 4000
CMD ["npx", "tsx", "backend/src/server.ts"]
