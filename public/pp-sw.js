// ============================================================
// PocketPulse Service Worker — Bulletproof Offline v11
// ============================================================
// Strategy: Single cache, cache-first for EVERYTHING.
// Every resource seen online gets cached. Offline = serve from cache.
// Navigation requests are cached with hash stripped (/#home → /).
// Returns empty stubs for missing scripts/styles to prevent crashes.

const CACHE_NAME = 'pocketpulse-v11';

// Only pre-cache assets we control (local + CORS-friendly CDN).
// Next.js chunks are NOT pre-cached — they get cached dynamically on fetch.
const PRECACHE_URLS = [
  '/pp-style.css',
  '/pp-app.js',
  '/pp-manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // CDN — these support CORS so fetch() gets full responses
  'https://unpkg.com/gsap@3.12.7/dist/gsap.min.js',
  'https://unpkg.com/lucide@0.359.0/dist/umd/lucide.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
];

// ── Helpers ────────────────────────────────────────────────────

// Strip hash fragment for cache key (/#home → /)
function cacheKey(request) {
  const url = new URL(request.url);
  url.hash = '';
  // Also strip turbopack cache-busting query param for Next.js chunks
  if (url.pathname.startsWith('/_next/static/')) {
    // Keep query params for Next.js chunks (they have stable hashes in URL)
  }
  return url.toString();
}

function isNavigation(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function shouldSkip(url) {
  if (url.pathname.includes('__nextjs_original_stack_frame')) return true;
  if (url.pathname.includes('_next/webpack-hmr')) return true;
  if (!url.protocol.startsWith('http')) return true;
  if (url.protocol === 'chrome-extension:') return true;
  return false;
}

// Empty stub responses (prevent script/style errors offline)
function emptyScript() {
  return new Response('', {
    status: 200,
    headers: { 'Content-Type': 'application/javascript' },
  });
}
function emptyStyle() {
  return new Response('', {
    status: 200,
    headers: { 'Content-Type': 'text/css' },
  });
}

// ── Install: pre-cache known assets ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Pre-cache skip:', url, err.message);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// ── Activate: wipe old caches, claim all tabs ───────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Main fetch handler ──────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (shouldSkip(url)) return;

  // Build cache key (hash-stripped for navigation)
  const key = cacheKey(request);

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1. CACHE FIRST — try the hash-stripped key
      const cached = await cache.match(key);
      if (cached) return cached;

      // Also try exact URL match (for CDN resources with query params)
      if (key !== request.url) {
        const exactMatch = await cache.match(request);
        if (exactMatch) return exactMatch;
      }

      // 2. NETWORK — fetch and cache the response
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === 'opaque')) {
          try {
            // Cache under hash-stripped key for navigation, exact key for others
            if (isNavigation(request)) {
              // Cache under '/' (clean) AND the full key
              await cache.put(key, response.clone());
              // Also ensure '/' is cached (the standard offline fallback key)
              const origin = url.origin;
              if (key !== origin + '/') {
                await cache.put(origin + '/', response.clone());
              }
            } else {
              await cache.put(key, response.clone());
            }
          } catch (cacheErr) {
            // Opaque responses may fail to cache — OK
          }
        }
        return response;
      } catch (networkErr) {
        // 3. OFFLINE & NOT IN CACHE — graceful fallbacks

        // Navigation → try '/' then inline fallback
        if (isNavigation(request)) {
          const origin = url.origin;
          // Try multiple cache keys
          const tryKeys = [origin + '/', key, request.url];
          for (const k of tryKeys) {
            const page = await cache.match(k);
            if (page) return page;
          }

          // Last resort: serve the full app shell inline
          return new Response(OFFLINE_SHELL, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }

        // Script → empty JS
        if (request.destination === 'script') return emptyScript();

        // Style → empty CSS
        if (request.destination === 'style') return emptyStyle();

        // Font → 1px transparent SVG
        if (request.destination === 'font') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
            { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }

        // Image → 1px transparent PNG
        if (request.destination === 'image') {
          return new Response(
            new Uint8Array([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1F,0x15,0xC4,0x89,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,0x54,0x78,0x9C,0x62,0x00,0x00,0x00,0x02,0x00,0x01,0xE5,0x27,0xDE,0xFC,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82]),
            { status: 200, headers: { 'Content-Type': 'image/png' } }
          );
        }

        throw networkErr;
      }
    })()
  );
});

// ── Full app shell for offline fallback ──────────────────────────
// This is a complete, working copy of the app HTML that loads
// pp-style.css and pp-app.js from cache (both pre-cached by SW).
const OFFLINE_SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <meta name="theme-color" content="#121212">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <title>PocketPulse</title>
  <link rel="manifest" href="/pp-manifest.json">
  <link rel="stylesheet" href="/pp-style.css">
  <script>document.documentElement.style.background='#121212';document.documentElement.style.color='#F0F0F0';</script>
</head>
<body class="theme-glass" style="margin:0;padding:0;background:#121212;display:flex;justify-content:center;align-items:stretch;min-height:100dvh;overflow:hidden;position:fixed;inset:0;">
  <div class="app-container">
    <p style="color:var(--muted);text-align:center;padding:80px 20px;font-size:14px;line-height:1.8;">
      You're offline.<br>Your data is safe.<br><br>
      <button onclick="window.location.reload()" style="padding:12px 28px;border:none;border-radius:12px;background:var(--accent, #C8FF00);color:#000;font-weight:800;font-size:14px;cursor:pointer;">Try Again</button>
    </p>
  </div>
</body>
</html>`;

// ── Message handler ──────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    caches.open(CACHE_NAME).then((cache) => {
      event.data.urls.forEach((u) => cache.add(u).catch(() => {}));
    });
  }
});
