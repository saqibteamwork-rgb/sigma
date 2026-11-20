import type { Metadata } from 'next';
import App from '../../App';

export const metadata: Metadata = {
  title: 'SIGMA MD FAQ – WhatsApp Bot Pairing, Uptime & Security Answers',
  description:
    'Answers about SIGMA MD 8-digit WhatsApp pairing codes, QR scanning, failover servers, and security.',
};

export default function FaqPage() {
  return <App />;
}
