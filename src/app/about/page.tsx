import type { Metadata } from 'next';
import App from '../../App';

export const metadata: Metadata = {
  title: 'About SIGMA MD – 11-Node WhatsApp Multi-Device Bot Platform',
  description:
    'Learn how SIGMA MD powers 24/7 WhatsApp multi-device automation across 11 cloud nodes (10 Heroku + 1 Railway).',
};

export default function AboutPage() {
  return <App />;
}
