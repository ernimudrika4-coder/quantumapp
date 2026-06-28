# Prisma Migration Ready Guide

## 1. Copy env
Gunakan `backend/.env.example` lalu isi `DATABASE_URL` dan `REDIS_URL`.

## 2. Generate Prisma Client
```bash
npx prisma generate --schema=backend/prisma/schema.prisma
```

## 3. Jalankan migration pertama
```bash
npx prisma migrate dev --name init --schema=backend/prisma/schema.prisma
```

## 4. Seed demo user
```bash
node --loader ts-node/esm backend/prisma/seed.ts
```

## Demo Login
- email: `demo@quantum.local`
- password: `quantum12345`
