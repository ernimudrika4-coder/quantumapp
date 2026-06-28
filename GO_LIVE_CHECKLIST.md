# Quantum Signal — Go Live Checklist

## A. Backend
- [ ] `backend/.env` lengkap dan aman
- [ ] `DATABASE_URL` mengarah ke PostgreSQL production
- [ ] `REDIS_URL` mengarah ke Redis production
- [ ] `JWT_SECRET` diganti dengan secret kuat
- [ ] `TWELVE_DATA_API_KEY` aktif
- [ ] `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` aktif
- [ ] `npx prisma generate --schema=backend/prisma/schema.prisma`
- [ ] `npx prisma migrate deploy --schema=backend/prisma/schema.prisma`
- [ ] Jalankan seed hanya jika perlu demo user
- [ ] Cek `/api/health/ready`
- [ ] Cek `/api/ops/launch-readiness`

## B. Frontend / PWA
- [ ] `npm run build` sukses
- [ ] `manifest.webmanifest` terdeteksi browser
- [ ] service worker aktif
- [ ] add to homescreen berhasil
- [ ] login/register berhasil
- [ ] signals / markets / news tampil dari backend
- [ ] notifikasi in-app muncul

## C. Push Notification
- [ ] User login
- [ ] User izinkan notifikasi
- [ ] Subscription tersimpan ke backend
- [ ] Test endpoint `/api/notifications/test` sukses
- [ ] Push tampil di browser/device

## D. Android / Capacitor
- [ ] `npx cap add android`
- [ ] `npm run build && npx cap sync android`
- [ ] Buka Android Studio
- [ ] Test deep link `/app/*`
- [ ] Test permission Android 13+
- [ ] Integrasi FCM jika ingin push native Android

## E. QA Produk
- [ ] Market detail terbuka
- [ ] Watchlist sync backend
- [ ] History sync backend
- [ ] Performance analytics tampil
- [ ] Notification center DB-driven
- [ ] Health endpoint hijau

## F. Launch
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Jalankan smoke test
- [ ] Test di Android/iPhone/browser desktop
- [ ] Siapkan changelog & support contact
