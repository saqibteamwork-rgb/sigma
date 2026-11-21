import type { Metadata } from 'next';
import App from '../../App';

export const metadata: Metadata = {
  title: 'SIGMA MD WhatsApp Bot Guide – 8-Digit Pair Code, QR & 700+ Commands',
  description:
    'Complete step-by-step tutorial on linking SIGMA MD WhatsApp Bot using an official 8-digit pairing code or QR scan. Learn top media, group admin, and AI commands.',
  alternates: {
    canonical: 'https://mrsaqib.me/whatsapp-bot',
  },
  openGraph: {
    title: 'SIGMA MD WhatsApp Bot Guide – 8-Digit Pair Code, QR & 700+ Commands',
    description:
      'Step-by-step guide to linking SIGMA MD WhatsApp Bot using an 8-digit pairing code or QR scan across Heroku nodes.',
    url: 'https://mrsaqib.me/whatsapp-bot',
    siteName: 'SIGMA MD Bot Hub',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIGMA MD WhatsApp Bot Guide – 8-Digit Pair Code, QR & 700+ Commands',
    description:
      'Step-by-step guide to linking SIGMA MD WhatsApp Bot using an 8-digit pairing code or QR scan.',
  },
};

export default function WhatsAppBotPage() {
  return <App />;
}
