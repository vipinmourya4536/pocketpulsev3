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
        {/* Blocking: paint dark background before any content renders — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.style.background='#121212';document.documentElement.style.color='#F0F0F0';`,
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

        {/* Google Fonts — blocking render, cached by SW for offline */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />

        {/* Critical app CSS */}
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
        {/* Service Worker Registration — runs after page is interactive */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/pp-sw.js', { scope: '/' })
                      .then(function(reg) {
                        console.log('[PWA] Service Worker registered:', reg.scope);
                        // Check for updates
                        reg.addEventListener('updatefound', function() {
                          var newWorker = reg.installing;
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'activated') {
                              console.log('[PWA] New content cached, refresh available');
                            }
                          });
                        });
                      })
                      .catch(function(err) {
                        console.warn('[PWA] SW registration failed:', err);
                      });
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}