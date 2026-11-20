export type SeoRoutePath = '/about' | '/whatsapp-bot' | '/faq';

export interface SeoPageMeta {
  path: SeoRoutePath;
  navLabel: string;
  title: string;
  description: string;
  heading: string;
  subtitle: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const HOME_SEO_META = {
  path: '/',
  title: 'SIGMA MD – Official WhatsApp Multi-Device Bot Hub',
  description:
    'Connect SIGMA MD to WhatsApp with an 8-digit pairing code or QR scan across 11 cloud nodes. Explore 700+ bot commands and live routing.',
};

export const SEO_PAGES: Record<SeoRoutePath, SeoPageMeta> = {
  '/about': {
    path: '/about',
    navLabel: 'About',
    title: 'About SIGMA MD – 11-Node WhatsApp Multi-Device Bot Platform',
    description:
      'Learn how SIGMA MD powers 24/7 WhatsApp multi-device automation across 11 cloud nodes with instant failover, privacy-first pairing, and 700+ commands.',
    heading: 'About SIGMA MD',
    subtitle:
      'High-availability WhatsApp multi-device automation engineered for instant pairing, zero sleep downtime, and responsive mobile control.',
  },
  '/whatsapp-bot': {
    path: '/whatsapp-bot',
    navLabel: 'Bot Guide',
    title: 'SIGMA MD WhatsApp Bot – 8-Digit Pair Code, QR & 700+ Commands',
    description:
      'Step-by-step guide to linking SIGMA MD WhatsApp Bot using an 8-digit pairing code or QR scan. Explore AI chat, MP3/HD downloads, and group tools.',
    heading: 'SIGMA MD WhatsApp Bot Guide',
    subtitle:
      'Everything you need to connect WhatsApp Multi-Device with an 8-digit code or QR scan and unlock media, AI, and group administration commands.',
  },
  '/faq': {
    path: '/faq',
    navLabel: 'FAQ',
    title: 'SIGMA MD FAQ – WhatsApp Bot Pairing, Uptime & Security Answers',
    description:
      'Get answers about SIGMA MD 8-digit WhatsApp pairing codes, QR scanning, 11-node failover servers, privacy, and how to unlink anytime.',
    heading: 'Frequently Asked Questions',
    subtitle:
      'Clear answers about connecting SIGMA MD, 24/7 cloud cluster uptime, command usage, and device security.',
  },
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'how-to-pair',
    question: 'How do I connect SIGMA MD to my WhatsApp using an 8-digit pairing code?',
    answer:
      'Enter your WhatsApp phone number with country code (for example 923001234567) on the SIGMA MD homepage and tap Get Code. Copy the generated 8-digit code, open WhatsApp on your phone, go to Linked Devices, tap Link with phone number instead, and enter the code.',
  },
  {
    id: 'qr-vs-code',
    question: 'Can I link SIGMA MD using a QR code instead of a phone number?',
    answer:
      'Yes. Switch to the QR Scan tab in the pairing workspace and tap Generate QR Code. Open WhatsApp > Linked Devices > Link a Device on your phone and scan the live QR code displayed on screen.',
  },
  {
    id: 'eleven-node-cluster',
    question: 'How does the 11-node cloud cluster keep the WhatsApp bot online 24/7?',
    answer:
      'SIGMA MD runs across 10 Heroku nodes and 1 Railway cloud node managed by a Smart Auto Load-Balancer. It routes new sessions to the least-loaded online node and automatically fails over to a healthy backup node if any server is busy or restarting.',
  },
  {
    id: 'popular-commands',
    question: 'What features and commands does SIGMA MD support?',
    answer:
      'SIGMA MD includes 700+ multi-device commands covering MP3 song downloads (.play), HD video downloads (.ytmp4), watermark-free TikTok clips (.tt), smart AI replies (.ai), live weather (.weather), and group admin controls (.tagall, .hidetag, .antilink on). Type .menu in WhatsApp to view the full list.',
  },
  {
    id: 'privacy-unlink',
    question: 'Is SIGMA MD safe, and how can I disconnect the bot anytime?',
    answer:
      'SIGMA MD connects through official WhatsApp Multi-Device Linked Devices sessions without needing your SIM card or account password. You stay in full control and can unlink the bot immediately anytime from WhatsApp > Linked Devices.',
  },
  {
    id: 'mobile-support',
    question: 'Does SIGMA MD work smoothly on mobile phones without a PC?',
    answer:
      'Yes. The 8-digit pairing code flow is built specifically for single-device mobile users—you can generate your code in your mobile browser, tap to copy it, and paste it directly inside WhatsApp Linked Devices on the same phone.',
  },
];

export const ARCHITECTURE_PILLARS = [
  {
    title: '11-Node Smart Auto Load Balancer',
    detail:
      'Traffic is distributed dynamically across 10 Heroku containers and a high-speed Railway scale node, keeping response latency low and preventing single-node congestion.',
  },
  {
    title: 'Instant 8-Digit & QR Multi-Device Linking',
    detail:
      'Connect from a single smartphone with an 8-digit phone pairing code or scan a live QR session from desktop without requiring third-party hosting setup.',
  },
  {
    title: '700+ Modular Bot Commands',
    detail:
      'Includes audio/video media downloaders, watermark-free social fetchers, AI chat assistants, weather lookups, greeting cards, and automated group moderation.',
  },
  {
    title: 'Zero-Clutter Liquid Glass Control',
    detail:
      'Monitor real-time node pings, switch between Smart Auto and dedicated nodes, inspect live browser APIs, and copy commands with one tap on desktop or mobile.',
  },
];

export const BOT_CAPABILITIES_GUIDE = [
  {
    category: 'Media & Downloads',
    commands: '.play <song> · .ytmp4 <video> · .tt <url>',
    summary:
      'Download crisp MP3 tracks, HD YouTube videos, and watermark-free TikTok clips directly inside any WhatsApp chat.',
  },
  {
    category: 'AI & Smart Utilities',
    commands: '.ai <query> · .weather <city> · .menu',
    summary:
      'Ask instant AI questions, check live city weather forecasts, and browse all 700+ SIGMA MD modules directly from chat.',
  },
  {
    category: 'Group Administration',
    commands: '.tagall · .hidetag <msg> · .antilink on',
    summary:
      'Mention all group participants cleanly, send silent broadcast announcements, and automatically remove unauthorized spam links.',
  },
  {
    category: 'Greetings & Engagement',
    commands: '.morning / .gm · .goodnight / .gn · .thanks / .wlcm',
    summary:
      'Send styled morning wishes, bedtime cards, and gratitude replies in personal chats and active WhatsApp communities.',
  },
];
