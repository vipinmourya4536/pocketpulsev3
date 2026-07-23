import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#121212",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "PocketPulse",
  description: "PocketPulse — A fast, mobile-first expense tracker PWA that works offline.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-512.png',
  },
  manifest: '/pp-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PocketPulse',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Paint dark background immediately — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.style.background='#121212';document.documentElement.style.color='#F0F0F0';`,
          }}
        />

        {/* ── OFFLINE RESILIENCE ──────────────────────────────────────
            PocketPulse is a vanilla JS app (pp-app.js). Next.js is just
            the delivery shell. When offline, Next.js runtime chunks may
            be missing. This script suppresses those errors so pp-app.js
            (and the cached HTML) still work perfectly. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `;(function(){
  // Suppress script loading errors from Next.js chunks when offline.
  // The app's real logic is in pp-app.js — it doesn't need React.
  window.addEventListener('error', function(e) {
    if (e.target && e.target.tagName === 'SCRIPT') {
      var src = e.target.src || '';
      // Suppress errors from Next.js runtime, webpack, React, router chunks
      if (src.indexOf('_next') !== -1 || src.indexOf('webpack') !== -1) {
        e.preventDefault();
        e.stopPropagation();
        console.warn('[Offline] Suppressed missing chunk:', src.split('/').pop());
        return true;
      }
    }
  }, true); // capture phase — catches before React's handler

  // Suppress unhandled promise rejections from Next.js hydration
  window.addEventListener('unhandledrejection', function(e) {
    var reason = (e.reason && e.reason.message) || String(e.reason) || '';
    if (reason.indexOf('Loading chunk') !== -1 ||
        reason.indexOf('Failed to fetch') !== -1 ||
        reason.indexOf('NetworkError') !== -1 ||
        reason.indexOf('_next') !== -1 ||
        reason.indexOf('hydration') !== -1) {
      e.preventDefault();
      console.warn('[Offline] Suppressed:', reason.slice(0, 80));
      return true;
    }
  });

  // If React never hydrates, manually ensure the body is visible.
  // Next.js sets display:none on body until hydration completes.
  setTimeout(function() {
    var body = document.body;
    if (body && (body.style.display === 'none' || getComputedStyle(body).display === 'none')) {
      body.style.display = '';
      body.style.visibility = 'visible';
      console.log('[Offline] Force-showing body (React did not hydrate)');
    }
  }, 800);
})();`,
          }}
        />

        {/* PWA meta tags for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://unpkg.com" />

        {/* Google Fonts — non-blocking via script to avoid React onLoad warning */}
        <link
          id="gf-css"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          media="print"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `var _gf=document.getElementById('gf-css');if(_gf)_gf.onload=function(){this.media='all';};`,
          }}
        />

        {/* Critical app CSS — always loaded, cached by SW */}
        <link rel="stylesheet" href="/pp-style.css" />
      </head>
      <body
        className="theme-glass"
        style={{
          margin: 0,
          padding: 0,
          background: '#121212',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          minHeight: '100dvh',
          overflow: 'hidden',
          position: 'fixed',
          inset: 0,
        }}
      >
        {children}

        {/* ── CRITICAL APP SCRIPTS — raw <script> tags so they work offline ──
            These MUST be plain HTML script tags, NOT Next.js <Script> components.
            Next.js <Script> renders via React client-side — if React fails to
            hydrate offline, those scripts never load and the app is dead.
            Raw tags are in the server HTML and execute regardless of React. */}
        <script src="https://unpkg.com/gsap@3.12.7/dist/gsap.min.js" defer crossOrigin="anonymous"></script>
        <script src="https://unpkg.com/lucide@0.359.0/dist/umd/lucide.js" defer crossOrigin="anonymous"></script>
        <script src="https://unpkg.com/dexie@3.2.4/dist/dexie.js" defer crossOrigin="anonymous"></script>
        <script src="/pp-app.js" defer></script>

        {/* ── SERVICE WORKER REGISTRATION ────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `;(function(){
  if (!('serviceWorker' in navigator)) return;

  function register() {
    navigator.serviceWorker.register('/pp-sw.js', { scope: '/' })
      .then(function(reg) {
        console.log('[PWA] SW registered, scope:', reg.scope);

        // If there's a waiting SW, activate it immediately
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Watch for future updates
        reg.addEventListener('updatefound', function() {
          var newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — activate it
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(function(err) {
        console.warn('[PWA] SW registration failed:', err);
      });
  }

  // Register after page is interactive (not blocking render)
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register);
  }
})();`,
          }}
        />
      </body>
    </html>
  );
}
