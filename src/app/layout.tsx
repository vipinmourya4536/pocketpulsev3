import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PocketPulse",
  description: "PocketPulse — A fast, mobile-first expense tracker PWA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}