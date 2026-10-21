import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter, SiteHeader } from '@/components/site';
import { abs } from '@/lib/seo';

export const dynamicParams = false;

// Trust pages (E-E-A-T): who we are, how we research, how we make money, how to reach us.
// Text in [brackets] must be completed before launch.
const PAGES: Record<string, { title: string; description: string; body: string[] }> = {
  'how-we-research': {
    title: 'How We Research Snorkel Spots',
    description: 'How Snorkel Guardians checks access, fees, rules and conditions for every snorkel spot, and how often we update them.',
    body: [
      'Every spot guide starts from official sources first: the park, marine reserve or agency that manages the water (for example Hawaii DLNR, the National Park Service, California Department of Fish and Wildlife, Florida State Parks). We then cross-check with local operators and recent visitor reports.',
      'Each fact we publish is logged with its source and the date we checked it. You will find the source list at the bottom of each spot page.',
      'Fees, reservation rules and hours change. We review every published spot at least every three months, and sooner when a park announces a change. Live water temperature and forecasts refresh hourly from public ocean data.',
      'We never accept payment to be listed as a conservation experience. Tour listings may include affiliate links (see our affiliate disclosure).',
      'Spotted something out of date? Tell us at [contact email] and we will check it within a week.',
    ],
  },
  'affiliate-disclosure': {
    title: 'Affiliate Disclosure',
    description: 'How Snorkel Guardians earns money through affiliate links, and why that never changes which spots and experiences we recommend.',
    body: [
      'Some tour and activity links on this site are affiliate links. If you book through them, we may earn a commission at no extra cost to you.',
      'Commissions never decide which spots we cover or how we describe them. Free shore spots get the same care as paid tours, and conservation experiences are listed because of who runs them, not because of a commission.',
    ],
  },
  contact: {
    title: 'Contact Snorkel Guardians',
    description: 'Get in touch with Snorkel Guardians about a snorkel spot, a correction or a conservation partnership.',
    body: ['Email: [contact email]', 'Conservation organizations and operators: we would love to hear about your programs.'],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How Snorkel Guardians handles your data.',
    body: ['[Privacy policy to be completed before launch: analytics used, cookies, newsletter data, affiliate tracking, contact for data requests.]'],
  },
};

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return Object.keys(PAGES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = PAGES[slug];
  return p ? { title: { absolute: `${p.title} | Snorkel Guardians` }, description: p.description, alternates: { canonical: abs(`/about/${slug}/`) } } : {};
}

export default async function AboutPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = PAGES[slug];
  if (!p) notFound();
  return (
    <>
      <SiteHeader />
      <main className="container section" style={{ maxWidth: 820 }}>
        <h1 style={{ fontSize: 42 }}>{p.title}</h1>
        <div className="stack" style={{ marginTop: 20, fontSize: 17 }}>{p.body.map(t => <p key={t}>{t}</p>)}</div>
      </main>
      <SiteFooter />
    </>
  );
}
