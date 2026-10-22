// Structured data (JSON-LD) and metadata helpers.
//
// Review stars: never mark up AggregateRating for spots (TouristAttraction is not an eligible
// review-snippet type) or ratings copied from Google/TripAdvisor (Google: "don't aggregate reviews
// or ratings from other websites"). Only first-party reviews of operators may carry ratings.

import type { Metadata } from 'next';
import type { Crumb, RegionViewModel, SpotViewModel, EncounterViewModel } from './model';
import type { FaqItem, Page } from './types';

export const SITE_NAME = 'Snorkel Guardians';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://snorkelguardians.com').replace(/\/$/, '');

export const abs = (path: string) => `${SITE_URL}${path}`;

type Json = Record<string, unknown>;

export function pageMetadata(page: Page, opts: { preview: boolean }): Metadata {
  const indexable = !opts.preview && page.status === 'published' && page.indexable;
  return {
    title: { absolute: page.title ?? page.target_keyword },
    description: page.meta_description ?? undefined,
    alternates: { canonical: abs(page.url_path) },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: abs(page.url_path),
      title: page.title ?? undefined,
      description: page.meta_description ?? undefined,
      images: page.og_image_url ? [{ url: abs(page.og_image_url) }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: page.title ?? undefined, description: page.meta_description ?? undefined },
  };
}

export function breadcrumbLd(crumbs: Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.url) })),
  };
}

export function faqLd(faqs: FaqItem[]): Json | null {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };
}

export function spotLd(v: SpotViewModel): Json[] {
  const s = v.spot;
  const free = !s.reservation_required && !(s.entry_fee_usd && s.entry_fee_usd > 0) && s.entry_method !== 'boat';
  const attraction: Json = {
    '@type': 'TouristAttraction',
    '@id': abs(v.page.url_path) + '#spot',
    name: s.name,
    alternateName: s.alt_names.length ? s.alt_names : undefined,
    description: s.summary ?? undefined,
    url: abs(v.page.url_path),
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    address: { '@type': 'PostalAddress', addressLocality: s.area_label ?? v.region.name, addressRegion: v.state?.name ?? v.region.name, addressCountry: 'US' },
    isAccessibleForFree: free,
    publicAccess: s.entry_method !== 'boat',
    touristType: ['Snorkeling'],
    containedInPlace: s.protected_area_name ? { '@type': 'Place', name: s.protected_area_name } : undefined,
    image: s.hero_image_url ? abs(s.hero_image_url) : undefined,
  };
  return [attraction, breadcrumbLd(v.crumbs), faqLd(v.faqs)].filter(Boolean) as Json[];
}

export function regionLd(v: RegionViewModel): Json[] {
  const dest: Json = {
    '@type': 'TouristDestination',
    name: v.region.name,
    description: v.region.summary ?? undefined,
    url: abs(v.page.url_path),
    geo: v.region.lat != null ? { '@type': 'GeoCoordinates', latitude: v.region.lat, longitude: v.region.lng } : undefined,
    includesAttraction: v.spots.map(s => ({ '@type': 'TouristAttraction', name: s.name, url: abs(s.url) })),
  };
  const list: Json = {
    '@type': 'ItemList',
    name: v.page.h2_outline[0] ?? `Snorkel spots in ${v.region.name}`,
    itemListElement: v.spots.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: abs(s.url) })),
  };
  return [dest, list, breadcrumbLd(v.crumbs), faqLd(v.faqs)].filter(Boolean) as Json[];
}

export function encounterLd(v: EncounterViewModel): Json[] {
  const article: Json = {
    '@type': 'Article',
    headline: v.page.h1 ?? v.page.title,
    description: v.page.meta_description ?? undefined,
    dateModified: v.page.last_content_reviewed_at ?? v.page.updated_at,
    author: v.page.author ? { '@type': 'Person', name: v.page.author } : { '@type': 'Organization', name: SITE_NAME },
    url: abs(v.page.url_path),
  };
  const list: Json = {
    '@type': 'ItemList',
    itemListElement: v.spots.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: abs(s.url) })),
  };
  return [article, list, breadcrumbLd(v.crumbs), faqLd(v.faqs)].filter(Boolean) as Json[];
}

export function homeLd(): Json[] {
  return [
    { '@type': 'WebSite', name: SITE_NAME, url: abs('/') },
    { '@type': 'Organization', name: SITE_NAME, url: abs('/'), logo: abs('/icon.svg') },
  ];
}

export function graph(items: Json[]): string {
  // Escape "<" so content can never close the script tag.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': items }).replace(/</g, '\\u003c');
}
