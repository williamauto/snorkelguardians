import type { SpotViewModel } from '@/lib/model';
import { ACCESS, LEVEL, shortName } from '@/lib/model';
import { Byline, Crumbs, DraftBanner, ExperienceCard, Faq, JsonLd, SiteFooter, SiteHeader, NearbyTours } from '@/components/site';
import { Temperature, VisitTabs, type VisitTab } from '@/components/client';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function composedAnswer(v: SpotViewModel): string {
  const s = v.spot;
  const name = shortName(s.name);
  const parts: string[] = [];
  if (s.summary) parts.push(s.summary);
  if (s.entry_method === 'boat') parts.push(`You can only reach ${name} by boat, so plan on a tour or charter.`);
  else if (s.entry_method === 'shore_or_boat') parts.push(s.getting_there_text ?? `You can reach ${name} from shore or by boat.`);
  else parts.push(`You can snorkel ${name} on your own from the shore${s.level ? `, and it suits ${LEVEL[s.level].toLowerCase()} snorkelers` : ''}.`);
  if (s.entry_fee_text && s.entry_fee_text !== 'Free') parts.push(s.entry_fee_text);
  else if (s.entry_fee_text === 'Free') parts.push('There is no entry fee.');
  if (s.reservation_required && s.reservation_text) parts.push(s.reservation_text);
  if (s.best_season_text) parts.push(`Best time: ${s.best_season_text.charAt(0).toLowerCase()}${s.best_season_text.slice(1)}`);
  if (v.sightings.length) parts.push(`You might see ${v.sightings.slice(0, 3).map(x => x.name.toLowerCase()).join(', ')}.`);
  return parts.join(' ');
}

export function SpotView({ v, preview, jsonLd }: { v: SpotViewModel; preview: boolean; jsonLd: string }) {
  const s = v.spot;
  const name = shortName(s.name);
  const h2 = (i: number, fallback: string) => v.page.h2_outline[i] ?? fallback;
  const c = v.conditions;
  const forecast = c?.forecast ?? [];

  const tabs: VisitTab[] = [];
  if (v.canGoAlone) {
    tabs.push({
      id: 'own', title: 'Explore on your own', sub: s.reservation_required ? 'Reserve, park, snorkel from shore' : 'Free shore entry: here is how',
      content: (
        <>
          <ol className="steps">
            {s.reservation_required && s.reservation_text ? <li><strong>Reserve ahead.</strong> {s.reservation_text}</li> : null}
            {s.getting_there_text ? <li><strong>Getting there.</strong> {s.getting_there_text}</li> : null}
            {s.parking_text ? <li><strong>Parking.</strong> {s.parking_text}</li> : null}
            {s.hours_text ? <li><strong>Hours.</strong> {s.hours_text}</li> : null}
            {s.gear_text ? <li><strong>Gear.</strong> {s.gear_text}</li> : <li><strong>Gear.</strong> Bring a mask, snorkel and fins; a float vest makes it easy to rest without standing on the reef.</li>}
            {s.hazards_text ? <li><strong>Stay safe.</strong> {s.hazards_text}</li> : null}
          </ol>
          <div className="cta-row" style={{ marginTop: 18 }}>
            <a className="btn btn--outline" href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener">Get directions</a>
          </div>
        </>
      ),
    });
  }
  tabs.push({
    id: 'tour', title: v.canGoAlone ? 'Book a tour' : 'Book your trip', sub: v.canGoAlone ? 'Guides, gear and transport handled' : `${name} is reached by boat or tour`,
    content: v.tours.length ? (
      <>
        <div className="grid grid--wide">{v.tours.map(e => <ExperienceCard key={e.slug} e={e} light />)}</div>
        {v.providerTours.length ? <p style={{ marginTop: 14 }}><a href="#tours">Compare {v.providerTours.length} bookable tours near {name} ↓</a></p> : null}
      </>
    ) : v.providerTours.length ? (
      <p>Compare prices, reviews and free-cancellation options in <a href="#tours">tours near {name}</a> below.</p>
    ) : (
      <p>We&rsquo;re still checking which operators go to {name}. {s.getting_there_text}</p>
    ),
  });
  tabs.push({
    id: 'protect', title: 'Help preserve it', sub: 'Reef-safe habits and local partners',
    content: (
      <div className="grid">
        <div className="tip"><h3>🧴 Pack reef-safe</h3><p>Mineral sunscreen only, or a rash guard so less sunscreen ends up in the water.</p></div>
        <div className="tip"><h3>🪸 Float, don&rsquo;t stand</h3><p>{s.rules_text ?? 'Never stand on coral, touch wildlife or feed the fish.'}</p></div>
        {v.conservation.map(e => <ExperienceCard key={e.slug} e={e} light />)}
      </div>
    ),
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <DraftBanner show={preview} />
      <SiteHeader />

      <section className="spot-hero">
        <div className="container">
          <Crumbs items={v.crumbs} />
          <div className="spot-hero__grid">
            <div className="spot-hero__photo">
              {s.hero_image_url ? <img src={s.hero_image_url} alt={`Snorkeling at ${name}`} /> : null}
              <span className="photo__label" style={{ position: 'relative' }}>{s.hero_image_url ? name : `Photo: ${name}`}</span>
            </div>
            <div className="spot-hero__copy">
              <div className="eyebrow">Snorkel spot · {s.area_label ?? v.region.name}, {v.state?.name ?? v.region.name}</div>
              <h1>{v.page.h1 || `${name} snorkeling guide`}</h1>
              <Byline author={v.page.author} reviewer={v.page.reviewer} updated={v.page.last_content_reviewed_at ?? s.last_checked_at} />
              {s.summary ? <p className="spot-hero__lead">{s.summary}</p> : null}
              {v.highlights.length ? (
                <ul className="highlights" style={{ listStyle: 'none', padding: 0 }}>
                  {v.highlights.map(h => <li key={h} className="highlight-chip">{h}</li>)}
                </ul>
              ) : null}
              {v.heroCredit ? <p className="spot-hero__credit">{v.heroCredit}</p> : null}
              <div className="cta-row" style={{ marginTop: 18 }}>
                <a className="btn btn--coral" href="#go">Plan my visit</a>
                <a className="btn btn--ghost" href="#conditions">Today&rsquo;s conditions</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container" style={{ paddingBottom: 64 }}>
        {/* Answer + at a glance */}
        <section className="intro" aria-labelledby="answer-h">
          <div style={{ flex: '999 1 520px', minWidth: 0 }}>
            <h2 id="answer-h" className="h2" style={{ marginBottom: 12 }}>{h2(0, `Can you snorkel ${name} on your own?`)}</h2>
            <p className="answer" style={{ maxWidth: 'none' }}>{s.answer_block ?? composedAnswer(v)}</p>
          </div>
          <div className="card glance">
            <h2>At a glance</h2>
            <table>
              <tbody>
                {v.glance.map(r => (
                  <tr key={r.label}>
                    <th scope="row"><span aria-hidden="true">{r.icon}</span>{r.label}</th>
                    <td className={r.tone === 'warn' ? 'warn' : undefined}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* What makes it worth the trip */}
        {v.naturalFeatures || v.wetsuit || v.waterTempNote || v.conservationNote ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="facts-h">
            <h2 id="facts-h" className="h2">What makes {name} worth the trip</h2>
            <div className="facts" style={{ marginTop: 14 }}>
              {v.naturalFeatures ? (
                <div className="fact">
                  <span className="fact__label">Reef and habitat</span>
                  <h3>What you are swimming over</h3>
                  <p>{v.naturalFeatures}</p>
                </div>
              ) : null}
              {v.wetsuit ? (
                <div className="fact">
                  <span className="fact__label">Wetsuit</span>
                  <h3>What to wear</h3>
                  <p>{v.wetsuit}</p>
                </div>
              ) : null}
              {v.waterTempNote ? (
                <div className="fact">
                  <span className="fact__label">Water temperature</span>
                  <h3>How warm it really gets</h3>
                  <p>{v.waterTempNote}</p>
                </div>
              ) : null}
              {v.conservationNote ? (
                <div className="fact">
                  <span className="fact__label">Conservation</span>
                  <h3>Why this place matters</h3>
                  <p>{v.conservationNote}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* House rules for this specific spot */}
        {v.rulesDo.length || v.rulesAvoid.length ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="rules-h">
            <h2 id="rules-h" className="h2">House rules at {name}</h2>
            <div className="rules">
              {v.rulesDo.length ? (
                <div className="rules__panel rules__panel--do">
                  <h3>✅ Do this</h3>
                  <ul>{v.rulesDo.map(r => <li key={r}>{r}</li>)}</ul>
                </div>
              ) : null}
              {v.rulesAvoid.length ? (
                <div className="rules__panel rules__panel--avoid">
                  <h3>🚫 Never do this</h3>
                  <ul>{v.rulesAvoid.map(r => <li key={r}>{r}</li>)}</ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Conditions */}
        <section id="conditions" className="section" style={{ paddingBottom: 0 }} aria-labelledby="cond-h">
          <h2 id="cond-h" className="h2">{h2(1, `${name} snorkeling conditions today`)}</h2>
          <div className="cond-grid">
            <div className="card cond">
              <span>Water temperature</span>
              <Temperature c={c?.water_temp_c ?? null} />
              <p>{c?.water_temp_c != null && c.water_temp_c < 21 ? 'Cool: a wetsuit makes it comfortable.' : 'A rash guard is plenty for most people.'}</p>
            </div>
            <div className="card cond">
              <span>Waves offshore</span>
              <strong>{c?.wave_height_m != null ? `${(c.wave_height_m * 3.281).toFixed(1)} ft` : '—'}</strong>
              <p>Calm water and light wind mean better visibility.</p>
            </div>
            <div className="card cond">
              <span>Air and wind</span>
              <strong>{c?.air_temp_c != null ? `${Math.round(c.air_temp_c * 9 / 5 + 32)}°F` : '—'}</strong>
              <p>{c?.wind_kmh != null ? `Wind ${Math.round(c.wind_kmh / 1.609)} mph.` : 'Mornings are usually calmest.'}</p>
            </div>
            {s.webcam_url ? (
              <a className="webcam" href={s.webcam_url} target="_blank" rel="noopener">
                <div className="webcam__screen"><span className="webcam__live">LIVE</span>
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#F5FDFB" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></svg>
                </div>
                <div className="webcam__meta"><strong>Nearest webcam</strong> · Open stream ↗</div>
              </a>
            ) : null}
          </div>
          {forecast.length ? (
            <>
              <h3 style={{ fontSize: 21, marginTop: 24 }}>7-day outlook</h3>
              <ol className="forecast">
                {forecast.slice(0, 7).map(d => {
                  const day = new Date(`${d.date}T12:00:00`);
                  const closed = s.closed_weekdays.includes(day.getDay());
                  return (
                    <li key={d.date} className={closed ? 'closed' : undefined}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{WEEKDAYS[day.getDay()]} {day.getDate()}</div>
                      {d.air_max_c != null ? <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>{Math.round(d.air_max_c * 9 / 5 + 32)}°F</div> : null}
                      {d.summary ? <div style={{ fontSize: 13 }}>{d.summary}</div> : null}
                      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                        {d.wind_max_kmh != null ? `Wind ${Math.round(d.wind_max_kmh / 1.609)} mph` : ''}{d.precip_prob_pct != null ? ` · Rain ${d.precip_prob_pct}%` : ''}
                      </div>
                      {closed ? <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 4 }}>Closed</div> : null}
                    </li>
                  );
                })}
              </ol>
            </>
          ) : null}
          <p className="note">
            {c ? <>Updated {new Date(c.fetched_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} · {c.source}. </> : <>Live readings are refreshed hourly from public ocean data. </>}
            Always check posted warnings and lifeguard flags before going in.
          </p>
        </section>

        {/* Best time */}
        {s.best_season_text ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="time-h">
            <h2 id="time-h" className="h2">{h2(2, `Best time to snorkel ${name}`)}</h2>
            <p style={{ fontSize: 17, marginTop: 12, maxWidth: '46em' }}>{s.best_season_text}{s.seasonal_warning ? ` ${s.seasonal_warning}` : ''}</p>
          </section>
        ) : null}

        {/* Marine life */}
        {v.sightings.length ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="life-h">
            <h2 id="life-h" className="h2">{h2(3, `What you'll see snorkeling ${name}`)}</h2>
            <div className="grid" style={{ marginTop: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {v.sightings.map(x => (
                <div key={x.name} className="card life">
                  <div className="photo" style={{ height: 110 }}><span className="photo__label">Photo: {x.name.toLowerCase()}</span></div>
                  <div className="life__body">
                    <div className="life__odds">{x.odds}{x.season ? ` · ${x.season}` : ''}</div>
                    <h3>{x.name}{x.localName ? <span style={{ fontWeight: 400, fontSize: 15 }}> ({x.localName})</span> : null}</h3>
                    {x.rule ? <p>💚 {x.rule}</p> : x.description ? <p>{x.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Where / safety, and getting there */}
        <section className="section grid" style={{ paddingBottom: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          <div className="card" style={{ padding: 22 }}>
            <h2 className="h2" style={{ fontSize: 24 }}>{h2(4, `Where to snorkel at ${name}, and where not to`)}</h2>
            <ul style={{ margin: '12px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.depth_text ? <li><strong>The water:</strong> {s.depth_text}.</li> : null}
              {s.hazards_text ? <li><strong>Hazards:</strong> {s.hazards_text}</li> : null}
              {s.protected_area_name ? <li><strong>Protected area:</strong> {s.protected_area_name}{s.protected_area_type ? ` (${s.protected_area_type})` : ''}.</li> : null}
              {s.rules_text ? <li><strong>Rules:</strong> {s.rules_text}</li> : null}
            </ul>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h2 className="h2" style={{ fontSize: 24 }}>{h2(5, `How to get to ${name}`)}</h2>
            <ul style={{ margin: '12px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.getting_there_text ? <li>{s.getting_there_text}</li> : null}
              {s.parking_text ? <li><strong>Parking:</strong> {s.parking_text}</li> : null}
              {s.hours_text ? <li><strong>Hours:</strong> {s.hours_text}</li> : null}
              <li><a href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noopener">Open in Google Maps ↗</a></li>
            </ul>
          </div>
        </section>

        {/* Three ways to go */}
        <section id="go" className="section" style={{ paddingBottom: 0 }} aria-labelledby="go-h">
          <h2 id="go-h" className="h2">{h2(6, `${name} snorkel tours and conservation experiences`)}</h2>
          <VisitTabs tabs={tabs} />
        </section>

        <NearbyTours
          tours={v.providerTours}
          title={`Tours near ${name}`}
          intro={v.canGoAlone
            ? `You don't need a tour here, but these handle transport, gear or a guide. Picked from Viator and GetYourGuide.`
            : `Bookable trips that go to ${name} or nearby, picked from Viator and GetYourGuide.`}
        />

        {/* Nearby + related */}
        {v.nearby.length || v.related.length ? (
          <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="near-h">
            <h2 id="near-h" className="h2">{h2(7, 'Nearby snorkel spots')}</h2>
            <div className="nearby">
              {v.nearby.map(n => (
                <a key={n.url} href={n.url} className="card"><strong>{n.shortName}</strong><div>{ACCESS[n.access].short}{n.level ? ` · ${LEVEL[n.level]}` : ''}</div></a>
              ))}
              {v.related.map(l => <a key={l.url} href={l.url} className="card"><strong>{l.name}</strong><div>Marine encounter guide</div></a>)}
              {v.regionLink ? <a href={v.regionLink.url} className="card"><strong>All {v.region.name} spots on the map</strong><div>{v.regionLink.name}</div></a> : null}
            </div>
          </section>
        ) : null}

        <Faq items={v.faqs} title={h2(8, `${name} snorkeling FAQ`)} />

        {v.sources.length ? (
          <footer className="sources">
            <strong style={{ color: 'var(--ink)' }}>Sources</strong> (checked {s.last_checked_at ?? 'recently'}):
            <ul>
              {v.sources.map(src => (
                <li key={src.url}><a href={src.url} rel="noopener nofollow" target="_blank">{src.title ?? src.url}</a>{src.publisher ? `, ${src.publisher}` : ''}{src.is_official ? ' (official)' : ''}</li>
              ))}
            </ul>
          </footer>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
