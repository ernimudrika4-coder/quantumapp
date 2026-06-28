# Quantum Backend Production Skeleton

Backend ini adalah fondasi production untuk Quantum Signal.

## Tujuan
- Proxy & cache data provider eksternal
- Signal engine terpusat
- Auth + user persistence
- Push notification infrastructure
- Analytics & history signal

## Stack
- Fastify
- Prisma + PostgreSQL
- Redis
- BullMQ
- Web Push (VAPID)

## Struktur
- `src/server.ts` → bootstrap server
- `src/app.ts` → compose plugins + routes
- `src/config` → env, constants
- `src/plugins` → cors, rate limit, docs, auth
- `src/modules` → auth, users, markets, events, signals, notifications
- `src/providers` → Twelve Data, Forex Factory
- `src/engine` → indikator, confluence, signal engine
- `src/jobs` → cron/queue processors
- `prisma/schema.prisma` → schema database

## Catatan
Skeleton ini disiapkan agar bisa dikembangkan menjadi backend penuh tanpa mengganggu build frontend yang sekarang.

## Endpoint target
- `GET /api/health`
- `GET /api/markets/quotes`
- `GET /api/markets/quote/:symbol`
- `GET /api/markets/detail/:symbol`
- `GET /api/events/upcoming`
- `GET /api/signals/live`
- `GET /api/signals/history`
- `GET /api/signals/performance`
- `POST /api/signals/follow`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:symbol`
- `POST /api/notifications/subscribe`
- `GET /api/notifications/public-key`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`

## Tahap 6
- Prisma migration-ready setup
- generated signal disimpan ke DB (`origin=engine`)
- market detail API
- frontend backend-only mode
