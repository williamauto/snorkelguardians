import { SiteFooter, SiteHeader } from '@/components/site';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container section">
        <h1 style={{ fontSize: 40 }}>That spot isn&rsquo;t on our map yet</h1>
        <p className="lede">The page may have moved, or the guide is still being checked before we publish it.</p>
        <div className="cta-row"><a className="btn btn--coral" href="/">Back to all snorkel spots</a></div>
      </main>
      <SiteFooter />
    </>
  );
}
