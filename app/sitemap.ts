import type { MetadataRoute } from 'next';

const SITE_URL = process.env.URL ?? 'https://salon-divina.netlify.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/services', '/professionnelles', '/reservation', '/contact'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));
}
