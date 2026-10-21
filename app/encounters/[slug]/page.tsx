import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDataset, isPreview } from '@/lib/data';
import { Model, encounterView } from '@/lib/model';
import { encounterLd, graph, pageMetadata } from '@/lib/seo';
import { EncounterView } from '@/components/views/EncounterView';

export const revalidate = 3600;
// true: a spot published from /admin renders on first visit, without a rebuild.
// Unpublished paths still 404 because RLS hides them and the page calls notFound().
export const dynamicParams = true;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const d = await loadDataset();
  return d.pages.filter(p => p.page_type === 'encounter').map(p => ({ slug: p.url_path.split('/')[2] }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = new Model(await loadDataset()).page(`/encounters/${slug}/`);
  return page ? pageMetadata(page, { preview: isPreview }) : {};
}

export default async function EncounterPage({ params }: { params: Params }) {
  const { slug } = await params;
  const v = encounterView(new Model(await loadDataset()), `/encounters/${slug}/`);
  if (!v) notFound();
  return <EncounterView v={v} preview={isPreview} jsonLd={graph(encounterLd(v))} />;
}
