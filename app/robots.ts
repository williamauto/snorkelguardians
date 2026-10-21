import type { MetadataRoute } from 'next';
import { isPreview } from '@/lib/data';
import { abs } from '@/lib/seo';

// Explicitly welcome the AI search/citation crawlers (they decide what ChatGPT, Claude and
// Perplexity cite). Training-only crawlers (GPTBot, ClaudeBot) follow the default rule;
// change that line if you decide to opt out of training.
export default function robots(): MetadataRoute.Robots {
  if (isPreview) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [
      { userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Googlebot', 'Bingbot'], allow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    sitemap: abs('/sitemap.xml'),
    host: abs('/'),
  };
}
