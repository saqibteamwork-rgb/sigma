import type { Metadata, Viewport } from 'next';
import '../index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://mrsaqib.me'),
  title: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
  description:
    'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes (10 Heroku + 1 Railway). Explore 700+ commands.',
  keywords: [
    'SIGMA MD',
    'WhatsApp Bot',
    'Pairing Code',
    'WhatsApp Multi-Device',
    'Muhammad Saqib',
    'Heroku WhatsApp Bot',
    'Free WhatsApp Bot',
  ],
  authors: [{ name: 'Muhammad Saqib', url: 'https://mrsaqib.me' }],
  creator: 'Muhammad Saqib',
  openGraph: {
    title: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
    description:
      'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes (10 Heroku + 1 Railway).',
    siteName: 'SIGMA MD Bot Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
    description:
      'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes.',
  },
};

export const viewport: Viewport = {
  themeColor: '#eef5fc',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
