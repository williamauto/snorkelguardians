import type { Metadata } from 'next';
import { loadDataset, isPreview } from '@/lib/data';
import { Model, homeView } from '@/lib/model';
import { graph, homeLd, pageMetadata } from '@/lib/seo';
import { HomeView } from '@/components/views/HomeView';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const m = new Model(await loadDataset());
  const page = m.page('/');
  return page ? pageMetadata(page, { preview: isPreview }) : { title: 'Snorkel Guardians' };
}

export default async function HomePage() {
  const m = new Model(await loadDataset());
  return <HomeView v={homeView(m)} preview={isPreview} jsonLd={graph(homeLd())} />;
}
