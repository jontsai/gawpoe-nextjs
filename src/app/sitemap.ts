import type { MetadataRoute } from 'next';
import { getContentByPath, sitemapRoutes, siteUrl } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes.map((route) => {
    const content = getContentByPath(route.path);

    return {
      url: `${siteUrl}${route.path}`,
      lastModified: content?.modified ? new Date(content.modified) : new Date(),
      changeFrequency: route.kind === 'post' ? ('monthly' as const) : ('weekly' as const),
      priority: route.path === '/' ? 1 : route.kind === 'post' ? 0.6 : 0.8,
    };
  });
}
