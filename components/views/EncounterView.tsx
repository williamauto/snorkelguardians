import type { EncounterViewModel } from '@/lib/model';
import { ACCESS, LEVEL } from '@/lib/model';
import { Byline, Crumbs, DraftBanner, Faq, JsonLd, SiteFooter, SiteHeader } from '@/components/site';

export function EncounterView({ v, preview, jsonLd }: { v: EncounterViewModel; preview: boolean; jsonLd: string }) {
  const sp = v.species;
  const h2 = (i: number, fallback: string) => v.page.h2_outline[i] ?? fallback;
  const shore = v.spots.filter(s => s.access !== 'boat_only' && s.access !== 'guide_required');
  const boat = v.spots.filter(s => s.access === 'boat_only' || s.access === 'guide_required');
  const list = (items: typeof v.spots) => (
    <ol className="spot-list">
      {items.map((s, i) => (
        <li key={s.id} className="card spot-item">
          <span className="spot-item__num" aria-hidden="true">{i + 1}</span>
          <div style={{ minWidth: 0 }}>
            <h3><a href={s.url}>{s.name}</a></h3>
            <div className="spot-item__meta">{s.regionName} · {ACCESS[s.access].short}{s.level ? ` · ${LEVEL[s.level]}` : ''} · {s.odds}{s.season ? ` (${s.season})` : ''}</div>
            {s.summary ? <p>{s.summary}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <JsonLd data={jsonLd} />
      <DraftBanner show={preview} />
      <SiteHeader />
      <section className="page-hero">
        <div className="container">
          <Crumbs items={v.crumbs} />
          <h1>{v.page.h1 || v.page.title}</h1>
          <Byline author={v.page.author} reviewer={v.page.reviewer} updated={v.page.last_content_reviewed_at ?? v.page.updated_at} />
        </div>
      </section>
      <main className="container" style={{ paddingBottom: 64 }}>
        {sp ? (
          <p className="answer" style={{ marginTop: 28 }}>
            {v.page.meta_description} {sp.description} {sp.distance_rule ? `The rule that matters most: ${sp.distance_rule.charAt(0).toLowerCase()}${sp.distance_rule.slice(1)}` : ''}
          </p>
        ) : null}
        <section className="section" style={{ paddingBottom: 0 }}>
          <h2 className="h2">{h2(0, 'Where to go')}</h2>
          {shore.length ? <><h3 style={{ fontSize: 22, marginTop: 18 }}>{h2(1, 'From shore')}</h3>{list(shore)}</> : null}
          {boat.length ? <><h3 style={{ fontSize: 22, marginTop: 28 }}>{h2(2, 'By boat or tour')}</h3>{list(boat)}</> : null}
        </section>
        {sp ? (
          <section className="section" style={{ paddingBottom: 0 }}>
            <h2 className="h2">{h2(3, 'How close is too close?')}</h2>
            <div className="grid" style={{ marginTop: 16 }}>
              {sp.distance_rule ? <div className="tip"><h3>💚 The rule</h3><p>{sp.distance_rule}</p></div> : null}
              {sp.protection_text ? <div className="tip"><h3>🛡️ Protection</h3><p>{sp.protection_text}</p></div> : null}
              <div className="tip"><h3>📸 Photos</h3><p>No flash, no selfie sticks pushed toward the animal. Let it choose how close to come.</p></div>
            </div>
          </section>
        ) : null}
        <Faq items={v.faqs} title={v.page.h2_outline[v.page.h2_outline.length - 1] ?? 'FAQ'} />
      </main>
      <SiteFooter />
    </>
  );
}
