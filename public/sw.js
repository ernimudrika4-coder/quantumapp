const CACHE_NAME = 'quantum-signal-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/'));
    })
  );
});

// Display local notification from app via postMessage
self.addEventListener('message', async (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = data.payload;
    await self.registration.showNotification(title, {
      badge: '/icons/icon-192.png',
      icon: '/icons/icon-192.png',
      image: options?.image,
      body: options?.body || '',
      tag: options?.tag || 'quantum-generic',
      data: options?.data || {},
      renotify: true,
      requireInteraction: false,
      vibrate: [120, 60, 120],
      ...options,
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = event.notification.data?.route || '/#/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(route).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(route);
      }
    })
  );
});
