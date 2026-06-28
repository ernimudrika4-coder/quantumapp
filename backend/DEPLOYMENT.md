# Deployment Readiness

## 1. Environment
Salin `backend/.env.example` ke `.env` dan sesuaikan:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

## 2. Prisma
Generate client:
```bash
npx prisma generate --schema=backend/prisma/schema.prisma
```
Jalankan migration:
```bash
npx prisma migrate dev --name init --schema=backend/prisma/schema.prisma
```

## 3. Run local infra
```bash
docker compose -f docker-compose.backend.yml up --build
```

## 4. Healthcheck
- `GET /api/health`
- `GET /api/health/ready`

## 5. Production checklist
- Gunakan PostgreSQL managed
- Gunakan Redis managed
- Isi VAPID key real
- Set APP_URL ke origin frontend
- Jalankan worker/scheduler di process yang sama atau process terpisah
- Tambahkan observability (Sentry, OpenTelemetry, log shipping)
- Aktifkan GitHub Actions (`frontend-ci`, `backend-ci`, `deploy-prep`)
- Jalankan `GET /api/health/ready` sebagai readiness probe
- Seed demo user hanya untuk environment non-production

## 6. Android / Capacitor
- pastikan `capacitor.config.ts` sinkron dengan domain/api produksi
- jalankan `npx cap add android` bila project native belum dibuat
- setelah build web: `npx cap sync android`
- untuk push native Android, lanjutkan integrasi FCM pada tahap berikutnya

## 7. Catatan
Dockerfile ini masih skeleton. Untuk production final, idealnya backend dipisah ke package tersendiri dengan build output Node yang dedicated.
