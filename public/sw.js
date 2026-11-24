/* Minimal service worker: satisfies PWA installability and provides a basic offline shell. */
const CACHE_NAME = 'madeiapp-shell-v1';
const PRECACHE_URLS = ['/', '/manifest.json', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        const shell = await caches.match('/');
        if (shell) return shell;
      }
      return new Response('You are offline and this resource is not cached.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});
