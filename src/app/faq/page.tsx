import type { Metadata } from 'next';
import App from '../../App';

export const metadata: Metadata = {
  title: 'SIGMA MD FAQ – WhatsApp Bot Pairing, Uptime & Security Answers',
  description:
    'Frequently asked questions about SIGMA MD 8-digit WhatsApp pairing codes, QR scanning, 11-node failover servers, privacy protection, and zero downtime.',
  alternates: {
    canonical: 'https://mrsaqib.me/faq',
  },
  openGraph: {
    title: 'SIGMA MD FAQ – WhatsApp Bot Pairing, Uptime & Security Answers',
    description:
      'Answers about SIGMA MD 8-digit WhatsApp pairing codes, QR scanning, failover servers, and security.',
    url: 'https://mrsaqib.me/faq',
    siteName: 'SIGMA MD Bot Hub',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIGMA MD FAQ – WhatsApp Bot Pairing, Uptime & Security Answers',
    description:
      'Answers about SIGMA MD 8-digit WhatsApp pairing codes, QR scanning, failover servers, and security.',
  },
};

export default function FaqPage() {
  return <App />;
}
