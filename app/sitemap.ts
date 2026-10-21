import type { MetadataRoute } from 'next';
import { loadDataset, isPreview } from '@/lib/data';
import { abs } from '@/lib/seo';

export const revalidate = 3600;

// Only published, indexable pages. lastModified reflects real content review, not build time.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreview) return [];
  const d = await loadDataset();
  return d.pages
    .filter(p => p.status === 'published' && p.indexable)
    .map((p): MetadataRoute.Sitemap[number] => ({
      url: abs(p.url_path),
      lastModified: p.last_content_reviewed_at ?? p.published_at ?? undefined,
      changeFrequency: p.page_type === 'spot' ? 'weekly' : 'monthly',
      priority: p.page_type === 'home' ? 1 : p.page_type === 'spot' ? 0.8 : 0.7,
    }));
}
