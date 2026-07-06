const CACHE_NAME = 'pocketpulse-v9';
const ASSETS = [
  '/pp-style.css',
  '/pp-app.js',
  '/pp-manifest.json',
  'https://unpkg.com/lucide@0.359.0/dist/umd/lucide.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', e => {
  // Non-navigation: cache-first fallback
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});