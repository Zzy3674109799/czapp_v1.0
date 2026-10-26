const CACHE_NAME = 'cunzai-pwa-v26';
const APP_SHELL = [
  '/',
  '/index.html',
  '/app.webmanifest',
  '/app-icon.svg',
  '/xlsx.full.min.js?v=20260603',
  '/tweaks-panel.jsx',
  '/pet.jsx',
  '/icons.jsx?v=20260606a',
  '/data.jsx?v=20260606b',
  '/ui.jsx',
  '/home.jsx?v=20260605a',
  '/record.jsx?v=20260608d',
  '/bills.jsx?v=20260606d',
  '/petpage.jsx?v=20260603b',
  '/goals.jsx?v=20260605a',
  '/celebrate.jsx',
  '/checkin.jsx',
  '/import.jsx?v=20260606b',
  '/insights.jsx?v=20260603c',
  '/onboarding.jsx',
  '/editsheet.jsx',
  '/categories.jsx?v=20260606c',
  '/monthly.jsx',
  '/app.jsx?v=20260608a'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin && /\.(html|js|jsx|css)$/.test(url.pathname)) {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html'))));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        if (new URL(request.url).origin === self.location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
