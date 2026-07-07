import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PocketPulse",
  description: "PocketPulse — A fast, mobile-first expense tracker PWA.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://unpkg.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
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
      </body>
    </html>
  );
}