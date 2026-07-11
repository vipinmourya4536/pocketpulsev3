// ============================================================
// PocketPulse Service Worker — Full Offline Support v10
// ============================================================

const CACHE_VERSION = 'pocketpulse-v10';
const STATIC_CACHE = CACHE_VERSION + '-static';
const FONT_CACHE = CACHE_VERSION + '-fonts';
const PAGE_CACHE = CACHE_VERSION + '-pages';

// ── Pre-cache manifest: all local + CDN assets ──────────────
const PRECACHE_ASSETS = [
  // App shell
  '/',
  '/pp-style.css',
  '/pp-app.js',
  '/pp-manifest.json',
  // Icons
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // CDN libraries (critical for app to function)
  'https://unpkg.com/gsap@3.12.7/dist/gsap.min.js',
  'https://unpkg.com/lucide@0.359.0/dist/umd/lucide.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.js',
  // Google Fonts CSS
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
];

// ── Install: pre-cache all critical assets ───────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // If any CDN asset fails (network issue during dev), log but don't block
        console.warn('[SW] Pre-cache partial failure:', err);
        // Still try to cache local assets individually
        const localAssets = PRECACHE_ASSETS.filter(u => u.startsWith('/'));
        return cache.addAll(localAssets);
      });
    })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: clean old caches and claim all clients ────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('pocketpulse-') && key !== STATIC_CACHE && key !== FONT_CACHE && key !== PAGE_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ── URL classification helpers ───────────────────────────────
function isNavigation(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isFontRequest(url) {
  return url.hostname === 'fonts.gstatic.com' ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf');
}

function isGoogleFontsCSS(url) {
  return url.hostname === 'fonts.googleapis.com';
}

function isCDNAsset(url) {
  return url.hostname === 'unpkg.com' ||
    url.hostname === 'cdn.jsdelivr.net';
}

function isNextStatic(url) {
  return url.pathname.startsWith('/_next/static/');
}

function isLocalAsset(url) {
  return url.origin === self.location.origin;
}

// ── Stale-While-Revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  // Return cached if available, otherwise wait for network
  return cachedResponse || networkPromise;
}

// ── Cache-First: try cache, fallback to network ─────────────
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Offline fallback: return a minimal empty response for scripts
    if (request.destination === 'script') {
      return new Response('', {
        status: 200,
        headers: { 'Content-Type': 'application/javascript' },
      });
    }
    if (request.destination === 'style') {
      return new Response('', {
        status: 200,
        headers: { 'Content-Type': 'text/css' },
      });
    }
    throw err;
  }
}

// ── Network-First: try network, fallback to cache ───────────
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      // Cache the page for offline use
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // If no cache either, return a basic offline fallback page
    if (isNavigation(request)) {
      return caches.match('/').then((cached) => {
        if (cached) return cached;
        return new Response(offlinePage(), {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      });
    }
    throw err;
  }
}

// ── Offline fallback HTML ────────────────────────────────────
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PocketPulse</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#121212;color:#F0F0F0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      min-height:100dvh;padding:40px 20px;text-align:center}
    h1{font-size:48px;margin-bottom:16px}
    p{color:#666;font-size:14px;max-width:280px;line-height:1.6}
    button{margin-top:24px;padding:14px 32px;border:none;border-radius:12px;
      background:linear-gradient(135deg,#C8FF00,#a8d900);color:#000;
      font-weight:800;font-size:15px;cursor:pointer}
  </style>
</head>
<body>
  <h1>💸</h1>
  <h2>PocketPulse</h2>
  <p>You're offline. Your data is safe and stored locally.</p>
  <button onclick="window.location.reload()">Try Again</button>
</body>
</html>`;
}

// ── Main fetch handler ───────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s) protocols
  if (!url.protocol.startsWith('http')) return;

  // Skip chrome-extension and other non-web requests
  if (url.protocol === 'chrome-extension:') return;

  event.respondWith(
    (async () => {
      // 1. Navigation requests — network-first with cache fallback
      if (isNavigation(request)) {
        return networkFirst(request, PAGE_CACHE);
      }

      // 2. Font files from gstatic — cache-first in dedicated font cache
      if (isFontRequest(url)) {
        return cacheFirst(request, FONT_CACHE);
      }

      // 3. Google Fonts CSS — stale-while-revalidate (needs to be fresh for UA)
      if (isGoogleFontsCSS(url)) {
        return staleWhileRevalidate(request, FONT_CACHE);
      }

      // 4. CDN assets (unpkg, etc.) — cache-first
      if (isCDNAsset(url)) {
        return cacheFirst(request, STATIC_CACHE);
      }

      // 5. Next.js static chunks (hashed, immutable) — cache-first
      if (isNextStatic(url)) {
        return cacheFirst(request, STATIC_CACHE);
      }

      // 6. All other local assets — cache-first
      if (isLocalAsset(url)) {
        return cacheFirst(request, STATIC_CACHE);
      }

      // 7. Everything else — network with cache fallback
      return networkFirst(request, STATIC_CACHE);
    })()
  );
});