import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDataset, isPreview } from '@/lib/data';
import { Model, spotView } from '@/lib/model';
import { graph, pageMetadata, spotLd } from '@/lib/seo';
import { SpotView } from '@/components/views/SpotView';

export const revalidate = 3600;
export const dynamicParams = false;

type Params = Promise<{ state: string; region: string; spot: string }>;

export async function generateStaticParams() {
  const d = await loadDataset();
  return d.pages
    .filter(p => p.page_type === 'spot')
    .map(p => { const [, state, region, spot] = p.url_path.split('/'); return { state, region, spot }; });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state, region, spot } = await params;
  const page = new Model(await loadDataset()).page(`/${state}/${region}/${spot}/`);
  return page ? pageMetadata(page, { preview: isPreview }) : {};
}

export default async function SpotPage({ params }: { params: Params }) {
  const { state, region, spot } = await params;
  const v = spotView(new Model(await loadDataset()), `/${state}/${region}/${spot}/`);
  if (!v) notFound();
  return <SpotView v={v} preview={isPreview} jsonLd={graph(spotLd(v))} />;
}
