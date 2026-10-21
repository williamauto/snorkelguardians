import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDataset, isPreview } from '@/lib/data';
import { Model, regionView } from '@/lib/model';
import { graph, pageMetadata, regionLd } from '@/lib/seo';
import { RegionView } from '@/components/views/RegionView';

export const revalidate = 3600;
// true: a spot published from /admin renders on first visit, without a rebuild.
// Unpublished paths still 404 because RLS hides them and the page calls notFound().
export const dynamicParams = true;

type Params = Promise<{ state: string; region: string }>;

export async function generateStaticParams() {
  const d = await loadDataset();
  return d.pages
    .filter(p => p.page_type === 'region')
    .map(p => { const [, state, region] = p.url_path.split('/'); return { state, region }; });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state, region } = await params;
  const page = new Model(await loadDataset()).page(`/${state}/${region}/`);
  return page ? pageMetadata(page, { preview: isPreview }) : {};
}

export default async function RegionPage({ params }: { params: Params }) {
  const { state, region } = await params;
  const v = regionView(new Model(await loadDataset()), `/${state}/${region}/`);
  if (!v) notFound();
  return <RegionView v={v} preview={isPreview} jsonLd={graph(regionLd(v))} />;
}
