import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mrsaqib.me';
  const routes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' }[] = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/whatsapp-bot', priority: 0.9, changeFrequency: 'daily' },
    { path: '/about', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/faq', priority: 0.85, changeFrequency: 'weekly' },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    images: [`${baseUrl}/og-image.png`],
  }));
}
