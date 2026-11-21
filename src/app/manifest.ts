import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
    short_name: 'SIGMA MD',
    description:
      'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes (10 Heroku + 1 Railway).',
    start_url: '/',
    display: 'standalone',
    background_color: '#eef5fc',
    theme_color: '#eef5fc',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  };
}
