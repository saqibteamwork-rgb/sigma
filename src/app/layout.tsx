import type { Metadata, Viewport } from 'next';
import '../index.css';
import { JsonLdSchemas } from '../components/JsonLdSchemas';

export const metadata: Metadata = {
  metadataBase: new URL('https://mrsaqib.me'),
  title: {
    default: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
    template: '%s | SIGMA MD Bot Hub',
  },
  description:
    'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes (10 Heroku + 1 Railway). Explore 700+ commands, live node status, and instant failover.',
  keywords: [
    'SIGMA MD',
    'WhatsApp Bot',
    '8-Digit Pairing Code',
    'WhatsApp Multi-Device Bot',
    'WhatsApp Bot Pair Code',
    'Muhammad Saqib',
    'Heroku WhatsApp Bot',
    'Free WhatsApp Bot',
    'Baileys WhatsApp Bot',
    'WhatsApp Bot Commands',
    'WhatsApp Bot 24/7 Uptime',
    'Node.js WhatsApp Bot',
  ],
  authors: [{ name: 'Muhammad Saqib', url: 'https://mrsaqib.me' }],
  creator: 'Muhammad Saqib',
  publisher: 'Muhammad Saqib',
  applicationName: 'SIGMA MD Bot Hub',
  category: 'Technology',
  alternates: {
    canonical: 'https://mrsaqib.me',
  },
  openGraph: {
    title: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
    description:
      'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes (10 Heroku + 1 Railway). Explore 700+ commands.',
    url: 'https://mrsaqib.me',
    siteName: 'SIGMA MD Bot Hub',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub by Muhammad Saqib',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
    description:
      'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes (10 Heroku + 1 Railway).',
    images: ['/og-image.png'],
    creator: '@mr_saqib242',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLdSchemas />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
