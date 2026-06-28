# Capacitor Android Packaging Guide

## Install Android project
```bash
npx cap add android
```

## Sync assets setelah build web
```bash
npm run build
npx cap sync android
```

## Buka Android Studio
```bash
npx cap open android
```

## Plugin yang sudah disiapkan
- `@capacitor/app`
- `@capacitor/preferences`
- `@capacitor/local-notifications`
- `@capacitor/push-notifications`

## Checklist APK / AAB
- set `applicationId` sesuai `appId`
- update app icon / splash assets
- isi Firebase config jika mau FCM native
- testing notification permission Android 13+
- cek deep links ke `/#/app/*`

## Catatan
Karena project ini memakai `HashRouter`, route app tetap aman saat dibungkus native WebView.
