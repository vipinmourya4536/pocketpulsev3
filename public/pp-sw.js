const CACHE_NAME = 'pocketpulse-v9';
const ASSETS = [
  './',
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
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(response => {
        const base = response ? Promise.resolve(response) : fetch(e.request);
        return base.then(r => {
          const headers = new Headers(r.headers);
          headers.set('X-Content-Type-Options', 'nosniff');
          headers.set('X-Frame-Options', 'DENY');
          headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
          return new Response(r.body, {
            status: r.status,
            statusText: r.statusText,
            headers
          });
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});