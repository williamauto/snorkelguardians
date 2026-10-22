import type { Metadata } from 'next';
import { Suspense } from 'react';
import { loadDataset, isPreview } from '@/lib/data';
import { Model } from '@/lib/model';
import { pageMetadata } from '@/lib/seo';
import { SpotsFinder } from '@/components/views/SpotsFinder';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const m = new Model(await loadDataset());
  const page = m.page('/spots/');
  return page ? pageMetadata(page, { preview: isPreview }) : { title: 'Find a snorkel spot | Snorkel Guardians' };
}

export default async function SpotsPage() {
  const d = await loadDataset();
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <SpotsFinder dataset={d} preview={isPreview} />
    </Suspense>
  );
}


