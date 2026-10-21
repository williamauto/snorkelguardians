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

type Params = Promise<{ state: string }>;

export async function generateStaticParams() {
  const d = await loadDataset();
  return d.pages.filter(p => p.page_type === 'state').map(p => ({ state: p.url_path.split('/')[1] }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state } = await params;
  const page = new Model(await loadDataset()).page(`/${state}/`);
  return page ? pageMetadata(page, { preview: isPreview }) : {};
}

export default async function StatePage({ params }: { params: Params }) {
  const { state } = await params;
  const v = regionView(new Model(await loadDataset()), `/${state}/`);
  if (!v) notFound();
  return <RegionView v={v} preview={isPreview} jsonLd={graph(regionLd(v))} />;
}
