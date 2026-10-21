import type { RegionViewModel } from '@/lib/model';
import { ACCESS, LEVEL, cToF } from '@/lib/model';
import { Byline, Crumbs, DraftBanner, ExperienceCard, Faq, JsonLd, SiteFooter, SiteHeader } from '@/components/site';
import { SpotMap } from '@/components/client';

export function RegionView({ v, preview, jsonLd }: { v: RegionViewModel; preview: boolean; jsonLd: string }) {
  const h2 = (i: number, fallback: string) => v.page.h2_outline[i] ?? fallback;
  const shore = v.spots.filter(s => s.access === 'on_your_own' || s.access === 'fee_or_reservation').length;
  const beginner = v.spots.filter(s => s.level === 'beginner').length;
  const intro = [
    v.region.summary,
    v.spots.length
      ? `${shore} of the ${v.spots.length} spots in this guide are shore entries you can do on your own${beginner ? `, and ${beginner} suit beginners and families` : ''}.`
      : null,
  ].filter(Boolean).join(' ');
  return (
    <>
      <JsonLd data={jsonLd} />
      <DraftBanner show={preview} />
      <SiteHeader />
      <section className="page-hero">
        <div className="container">
          <Crumbs items={v.crumbs} />
          <h1>{v.page.h1 ?? `Snorkeling in ${v.region.name}`}</h1>
          <Byline author={v.page.author} reviewer={v.page.reviewer} updated={v.page.last_content_reviewed_at ?? v.page.updated_at} />
          <div className="hero-stats">
            <div className="hero-stat"><span>Snorkel spots</span><strong>{v.spots.length}</strong></div>
            <div className="hero-stat"><span>On your own</span><strong>{shore}</strong></div>
            {v.waterTempC != null ? <div className="hero-stat"><span>Water now</span><strong>{cToF(v.waterTempC)}°F</strong></div> : null}
          </div>
        </div>
      </section>

      <main className="container" style={{ paddingBottom: 64 }}>
        {intro ? <p className="answer" style={{ marginTop: 28 }}>{intro}</p> : null}

        {v.isState && v.childRegions.length ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="regions-h">
            <h2 id="regions-h" className="h2">Where to snorkel in {v.region.name}</h2>
            <div className="grid" style={{ marginTop: 16 }}>
              {v.childRegions.map(r => (
                <a key={r.url} href={r.url} className="dest-card card">
                  <div className="photo"><span className="photo__label">Photo: {r.name}</span></div>
                  <div className="dest-card__body">
                    <h3>{r.name}</h3>
                    <p>{r.summary}</p>
                    <p style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.spotCount} spots · {r.highlights.join(', ')}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {!v.isState && v.spots.length ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="map-h">
            <h2 id="map-h" className="h2">{h2(1, `${v.region.name} snorkel map`)}</h2>
            <SpotMap spots={v.spots} center={[v.region.lat ?? v.spots[0].lat, v.region.lng ?? v.spots[0].lng]} zoom={v.region.map_zoom ?? 10} />
          </section>
        ) : null}

        <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="list-h">
          <h2 id="list-h" className="h2">{h2(0, `Best snorkeling spots in ${v.region.name}`)}</h2>
          <ol className="spot-list">
            {v.spots.map((s, i) => (
              <li key={s.id} className="card spot-item">
                <span className="spot-item__num" aria-hidden="true">{i + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <h3><a href={s.url}>{s.name}</a></h3>
                  <div className="spot-item__meta">
                    {s.area}{s.area ? ' · ' : ''}{ACCESS[s.access].short}{s.level ? ` · ${LEVEL[s.level]}` : ''}
                  </div>
                  {s.summary ? <p>{s.summary}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {v.experiences.length ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="exp-h">
            <h2 id="exp-h" className="h2">{h2(5, `Snorkel tours and conservation experiences in ${v.region.name}`)}</h2>
            <div className="grid grid--wide" style={{ marginTop: 16 }}>
              {v.experiences.map(e => <ExperienceCard key={e.slug} e={e} light />)}
            </div>
          </section>
        ) : null}

        <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="kind-h">
          <h2 id="kind-h" className="h2">{h2(6, `How to snorkel ${v.region.name} responsibly`)}</h2>
          <div className="grid" style={{ marginTop: 16 }}>
            <div className="tip"><h3>🧴 Reef-safe sunscreen</h3><p>Use mineral sunscreen or a rash guard. In Hawaii, sunscreens with oxybenzone and octinoxate can&rsquo;t be sold.</p></div>
            <div className="tip"><h3>🐢 Give wildlife room</h3><p>At least 10 ft (3 m) from turtles; more for seals and sea lions. Never touch, chase or feed.</p></div>
            <div className="tip"><h3>🪸 Float, never stand</h3><p>Coral is alive. Rest on sand or wear a float vest, and keep your fins up off the reef.</p></div>
          </div>
        </section>

        {v.related.length ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="rel-h">
            <h2 id="rel-h" className="h2">Marine encounters</h2>
            <div className="nearby">
              {v.related.map(l => <a key={l.url} href={l.url} className="card"><strong>{l.name}</strong></a>)}
            </div>
          </section>
        ) : null}

        <Faq items={v.faqs} title={h2(7, `${v.region.name} snorkeling FAQ`)} />
      </main>
      <SiteFooter />
    </>
  );
}
