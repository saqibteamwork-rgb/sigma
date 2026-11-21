import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot-Extended',
          'Bytespider',
          'cohere-ai',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://mrsaqib.me/sitemap.xml',
    host: 'https://mrsaqib.me',
  };
}
