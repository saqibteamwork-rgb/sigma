import { FAQ_ITEMS } from '../data/seoPagesData';
import { DEFAULT_CREATOR_PROFILE } from '../data/botHubData';

/**
 * JsonLdSchemas
 * Injects Schema.org structured data for Search Engines (Google, Bing) and AI Answer Engines (Perplexity, ChatGPT, AI Overviews).
 * Includes: WebSite, Person, WebApplication, HowTo, FAQPage, BreadcrumbList.
 */
export function JsonLdSchemas() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://mrsaqib.me/#website',
    url: 'https://mrsaqib.me',
    name: 'SIGMA MD',
    alternateName: [
      'SIGMA MD Bot Hub',
      'SIGMA WhatsApp Bot',
      'Muhammad Saqib WhatsApp Bot Hub',
      'SIGMA Multi-Device WhatsApp Engine',
    ],
    description:
      'Official 11-Node WhatsApp Multi-Device Bot Hub. Connect in seconds using an 8-digit pairing code or QR scan across 10 Heroku nodes and 1 Railway cloud node.',
    inLanguage: 'en-US',
    publisher: {
      '@id': 'https://mrsaqib.me/#person',
    },
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://mrsaqib.me/#person',
    name: DEFAULT_CREATOR_PROFILE.name,
    alternateName: DEFAULT_CREATOR_PROFILE.short_name,
    url: DEFAULT_CREATOR_PROFILE.portfolio,
    jobTitle: DEFAULT_CREATOR_PROFILE.tagline,
    description:
      'Creator and architect of the SIGMA MD WhatsApp Multi-Device automation platform operating across an 11-node cloud cluster.',
    image: 'https://mrsaqib.me/assets/images/saqib_developer_avatar.jpg',
    sameAs: [
      DEFAULT_CREATOR_PROFILE.instagram,
      'https://github.com/saqibteamwork-rgb',
      DEFAULT_CREATOR_PROFILE.whatsapp,
    ],
    knowsAbout: [
      'WhatsApp Multi-Device Automation',
      'Baileys Protocol',
      'Cloud Load Balancing',
      'Cyber Security & Session Hardening',
      'Full-Stack Next.js & React Engineering',
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://mrsaqib.me/#software',
    name: 'SIGMA MD',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'WhatsApp Web, Android, iOS, Windows, macOS, Linux',
    url: 'https://mrsaqib.me',
    description:
      'High-availability WhatsApp multi-device bot system powered by an 11-node cloud cluster (10 Heroku + 1 Railway). Features 8-digit pairing code generation, QR scan linking, and 700+ commands.',
    softwareVersion: '3.5.0-MD',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@id': 'https://mrsaqib.me/#person',
    },
    featureList: [
      '8-Digit WhatsApp Pairing Code Generator',
      'Live QR Scan Session Connector',
      '11-Node Smart Load-Balanced Cloud Cluster',
      '700+ Multi-Device WhatsApp Commands (.play, .ytmp4, .tt, .ai, .antilink, .weather)',
      'Zero Serverless Fluid Compute Direct Browser Architecture',
      'Automatic Anti-Sleep Failover Routing',
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': 'https://mrsaqib.me/#howto-pair',
    name: 'How to Connect SIGMA MD to WhatsApp with an 8-Digit Pairing Code',
    description:
      'Step-by-step instructions to link SIGMA MD WhatsApp Multi-Device Bot using an 8-digit pairing code without scanning a QR code.',
    totalTime: 'PT1M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter WhatsApp Phone Number',
        text: 'Type your WhatsApp phone number with international country code (e.g. 923001234567) on the SIGMA MD pairing interface.',
        url: 'https://mrsaqib.me/#pair-workspace',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Generate 8-Digit Pairing Code',
        text: 'Tap Get Code. The Smart Auto Load-Balancer instantly queries the fastest healthy cloud node to generate your 8-digit code.',
        url: 'https://mrsaqib.me/#pair-workspace',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Open WhatsApp Linked Devices',
        text: 'On your phone, open WhatsApp > Settings > Linked Devices > Link a Device > Link with phone number instead.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Enter Code & Explore 700+ Commands',
        text: 'Enter the 8-digit pairing code on your phone to connect 24/7. Send .menu in WhatsApp to explore all commands.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://mrsaqib.me/#faq',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://mrsaqib.me',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About SIGMA MD',
        item: 'https://mrsaqib.me/about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'WhatsApp Bot Guide',
        item: 'https://mrsaqib.me/whatsapp-bot',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'FAQ',
        item: 'https://mrsaqib.me/faq',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
