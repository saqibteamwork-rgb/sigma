import type { Metadata } from 'next';
import App from '../../App';

export const metadata: Metadata = {
  title: 'About SIGMA MD – 11-Node WhatsApp Multi-Device Bot Platform',
  description:
    'Learn how SIGMA MD powers 24/7 WhatsApp multi-device automation across 11 cloud nodes (10 Heroku + 1 Railway) with automatic anti-sleep failover, zero downtime, and 700+ commands.',
  alternates: {
    canonical: 'https://mrsaqib.me/about',
  },
  openGraph: {
    title: 'About SIGMA MD – 11-Node WhatsApp Multi-Device Bot Platform',
    description:
      'Learn how SIGMA MD powers 24/7 WhatsApp multi-device automation across 11 cloud nodes (10 Heroku + 1 Railway).',
    url: 'https://mrsaqib.me/about',
    siteName: 'SIGMA MD Bot Hub',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About SIGMA MD – 11-Node WhatsApp Multi-Device Bot Platform',
    description:
      'Learn how SIGMA MD powers 24/7 WhatsApp multi-device automation across 11 cloud nodes.',
  },
};

export default function AboutPage() {
  return <App />;
}
