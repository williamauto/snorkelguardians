import 'server-only';
import { cache } from 'react';
import type { Dataset } from './types';

// Reads the whole content set from Supabase's REST API (a few hundred rows),
// cached per build and revalidated hourly so conditions stay fresh.
//
// Production: anon key + RLS, so only published rows come back.
// Staging:    PREVIEW_DRAFTS=1 + service role key renders drafts (every page gets noindex).

export const isPreview = process.env.PREVIEW_DRAFTS === '1';

const REVALIDATE_SECONDS = 3600;

function credentials() {
  const url = process.env.SUPABASE_URL;
  const key = isPreview ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      `Missing Supabase settings: SUPABASE_URL and ${isPreview ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_ANON_KEY'} must be set.`,
    );
  }
  return { url, key };
}

async function table<T>(name: string, select = '*', filter = ''): Promise<T[]> {
  const { url, key } = credentials();
  const res = await fetch(`${url}/rest/v1/${name}?select=${encodeURIComponent(select)}${filter}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    next: { revalidate: REVALIDATE_SECONDS, tags: ['content'] },
  });
  if (!res.ok) throw new Error(`Supabase ${name}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T[]>;
}

// In preview, skip archived rows; in production RLS already limits to published.
const notArchived = isPreview ? '&status=neq.archived' : '';

export const loadDataset = cache(async (): Promise<Dataset> => {
  const [regions, spots, species, spotSpecies, organizations, experiences, spotExperiences, pages, faqs, links, sources, conditions, tours, spotTours] =
    await Promise.all([
      table<Dataset['regions'][number]>('regions'),
      table<Dataset['spots'][number]>('spots', '*', notArchived),
      table<Dataset['species'][number]>('species'),
      table<Dataset['spotSpecies'][number]>('spot_species'),
      table<Dataset['organizations'][number]>('organizations'),
      table<Dataset['experiences'][number]>('experiences', '*', notArchived),
      table<Dataset['spotExperiences'][number]>('spot_experiences'),
      table<Dataset['pages'][number]>('pages', '*', notArchived),
      table<Dataset['faqs'][number]>('faq_items', 'page_id,question,answer,sort_order'),
      table<Dataset['links'][number]>('page_links'),
      table<Dataset['sources'][number]>('sources', 'spot_id,experience_id,url,title,publisher,is_official,accessed_on'),
      table<Dataset['conditions'][number]>('spot_conditions'),
      table<Dataset['tours'][number]>('provider_tours', '*', notArchived),
      table<Dataset['spotTours'][number]>('spot_tours'),
    ]);
  return { regions, spots, species, spotSpecies, organizations, experiences, spotExperiences, pages, faqs, links, sources, conditions, tours, spotTours };
});
