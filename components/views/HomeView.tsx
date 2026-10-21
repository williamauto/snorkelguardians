import type { HomeViewModel } from '@/lib/model';
import { ExperienceCard, JsonLd, SiteFooter, SiteHeader, DraftBanner } from '@/components/site';

const ENCOUNTERS = [
  { icon: '🐢', name: 'Sea turtles', where: 'Hanauma Bay, Kahaluu, Black Rock, Maunalua Bay', when: 'Year-round', how: 'From shore at most Hawaii spots; boat for offshore reefs', rule: 'Stay at least 10 ft (3 m) away. Never touch or chase.', href: '/encounters/snorkel-with-turtles-hawaii/', cta: 'Snorkel with turtles in Hawaii', tint: '#1C5A60' },
  { icon: '🐆', name: 'Leopard sharks', where: 'La Jolla Shores, San Diego', when: 'Summer', how: 'Shore entry, beginner friendly', rule: 'Harmless and shy. Watch from above.', href: '/encounters/leopard-sharks-la-jolla/', cta: 'When and where to see them', tint: '#2C6E5A' },
  { icon: '🌙', name: 'Manta rays at night', where: 'Keauhou, Kona, Big Island', when: 'Year-round, after dark', how: 'Night boat tour only', rule: 'Float at the surface. Let the mantas come to you.', href: '/hawaii/big-island/kona-manta-night-snorkel/', cta: 'How the manta snorkel works', tint: '#14304A' },
  { icon: '🐬', name: 'Spinner dolphins', where: 'Kealakekua Bay, Two Step', when: 'Mornings, resting in the bays', how: 'Watch from a distance', rule: 'In Hawaii it is illegal to approach within 50 yards.', href: '/hawaii/big-island/two-step/', cta: 'Snorkel Two Step', tint: '#123F57' },
  { icon: '🐠', name: 'Garibaldi and kelp forests', where: 'La Jolla Cove, Catalina Island', when: 'Warmest late summer', how: 'Shore entry with a wetsuit', rule: 'Protected marine reserves: take nothing.', href: '/california/', cta: 'Snorkel Southern California', tint: '#2C6E5A' },
  { icon: '🪸', name: 'Coral reefs and wrecks', where: 'Biscayne National Park, Molokini Crater', when: 'Calm, low-wind days', how: 'Boat only', rule: 'Float, never stand. One kick can break decades of growth.', href: '/florida/miami/biscayne-national-park/', cta: 'Snorkel Biscayne', tint: '#1A6A73' },
];

function SurfaceArt() {
  return (
    <div className="surface__art" aria-hidden="true">
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: '#9FD9E8' }} />
      <svg className="wave" viewBox="0 0 2880 60" preserveAspectRatio="none" style={{ position: 'absolute', top: 96, left: 0, width: '200%', height: 48 }}>
        <path d="M0 30 Q 90 0 180 30 T 360 30 T 540 30 T 720 30 T 900 30 T 1080 30 T 1260 30 T 1440 30 T 1620 30 T 1800 30 T 1980 30 T 2160 30 T 2340 30 T 2520 30 T 2700 30 T 2880 30 V60 H0Z" fill="#12AA9C" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 140, bottom: 0, background: '#0E7C82' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, bottom: 0, background: '#0B6870' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 580, bottom: 0, background: '#0A5257' }} />
      <svg className="rays" viewBox="0 0 1440 780" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g fill="#EAFBF8"><polygon points="300,140 380,140 560,780 340,780" /><polygon points="760,140 820,140 1000,780 820,780" /><polygon points="1120,140 1170,140 1320,780 1180,780" /></g>
      </svg>
      <svg className="drift" viewBox="0 0 160 90" style={{ position: 'absolute', top: 300, left: 0, width: 150, height: 85, opacity: .55 }}>
        <g fill="#062A2E"><ellipse cx="80" cy="45" rx="42" ry="26" /><ellipse cx="132" cy="42" rx="14" ry="10" /><path d="M60 26 L30 2 L48 30Z" /><path d="M60 64 L30 88 L48 60Z" /><path d="M104 28 L120 8 L112 32Z" /><path d="M104 62 L120 82 L112 58Z" /></g>
      </svg>
      <svg viewBox="0 0 1440 260" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 260 }}>
        <path d="M0 200 C160 170 260 215 420 190 S700 160 860 195 S1180 175 1440 190 V260 H0Z" fill="#C9B27E" />
        <g fill="#08464B">
          <path className="kelp" d="M90 210 C80 150 110 110 96 40 C120 100 112 160 112 210Z" />
          <path className="kelp" d="M130 210 C122 170 146 140 134 80 C156 130 150 175 150 210Z" style={{ animationDelay: '-2s' }} />
          <path className="kelp" d="M1300 200 C1290 140 1320 100 1306 20 C1334 90 1324 150 1324 200Z" style={{ animationDelay: '-3s' }} />
          <path className="kelp" d="M1350 205 C1342 160 1366 120 1356 70 C1378 120 1372 170 1372 205Z" style={{ animationDelay: '-1s' }} />
        </g>
        <g fill="#E67F5C" opacity=".9"><circle cx="320" cy="196" r="26" /><circle cx="352" cy="186" r="18" /><circle cx="1060" cy="190" r="30" /><circle cx="1100" cy="198" r="20" /></g>
        <g fill="#FF9E7F" opacity=".85"><path d="M560 200 L572 140 L584 200Z M590 200 L604 120 L618 200Z M624 200 L634 156 L644 200Z" /><path d="M880 200 L890 150 L900 200Z M906 200 L918 128 L930 200Z" /></g>
      </svg>
      {[[12, 10, 9, 0], [22, 6, 7, -3], [48, 14, 11, -5], [67, 8, 8, -1], [84, 12, 10, -6]].map(([left, size, dur, delay]) => (
        <span key={left} className="bubble" style={{ left: `${left}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `${delay}s` }} />
      ))}
    </div>
  );
}

export function HomeView({ v, preview, jsonLd }: { v: HomeViewModel; preview: boolean; jsonLd: string }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      <DraftBanner show={preview} />

      {/* SURFACE */}
      <section className="surface" aria-label="Snorkel Guardians">
        <SurfaceArt />
        <SiteHeader overlay />
        <div className="container surface__copy">
          <div className="eyebrow">Snorkeling for everyone</div>
          <h1>{v.page?.h1 ? <>Put your face in the water. <em>The reef will do the rest.</em></> : 'Snorkel Guardians'}</h1>
          <p>
            You don&rsquo;t need a boat, a certification or perfect swimming to meet a sea turtle. Plain, honest guides to {v.spotCount} snorkel
            spots in Hawaii, Southern California and Florida, and the people bringing reefs back.
          </p>
          <div className="cta-row">
            <a className="btn btn--coral" href="#destinations">Find a snorkel spot ↓</a>
            <a className="btn btn--ghost" href="#encounters">Meet marine life ↓</a>
            <a className="btn btn--ghost" href="#conservation">Help save reefs ↓</a>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden="true">SCROLL TO DIVE</div>
      </section>

      {/* 3 m: SHALLOWS */}
      <section className="scene scene--shallows caustic" aria-labelledby="shallows-h">
        <div className="container">
          <div className="eyebrow"><span className="depth-tag">3 m</span>The shallows</div>
          <h2 id="shallows-h" className="h-section">Snorkeling isn&rsquo;t only for strong swimmers</h2>
          <p className="lede" style={{ color: 'var(--ink)' }}>
            Plenty of the best spots are calm, shallow and a few steps from the sand. Every guide tells you up front how you get in, how deep
            it is, what it costs and whether it&rsquo;s calm today.
          </p>
          <div className="grid" style={{ marginTop: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="feature"><div className="feature__icon" aria-hidden="true">🏖️</div><h3>Walk in from the beach</h3><p>Free shore spots with the entry point, depth and best time of day.</p></div>
            <div className="feature"><div className="feature__icon" aria-hidden="true">🎟️</div><h3>Fees and reservations</h3><p>Protected parks that cap visitors: price, booking window, closed days.</p></div>
            <div className="feature"><div className="feature__icon" aria-hidden="true">⛵</div><h3>Boat or tour only</h3><p>Offshore reefs and big encounters, with the operators who go there.</p></div>
            <div className="feature"><div className="feature__icon" aria-hidden="true">🧭</div><h3>Permits and guides</h3><p>Where you need a permitted kayak or a licensed guide, and how to book one.</p></div>
          </div>
          <p style={{ marginTop: 20, fontWeight: 700 }}>
            Nervous in the water? Look for <span className="badge badge--plain">🧒 Beginner and family</span> spots and wear a float vest. It&rsquo;s what the guides do.
          </p>
        </div>
      </section>

      {/* 6 m: REEF / DESTINATIONS */}
      <section id="destinations" className="scene scene--reef" aria-labelledby="dest-h">
        <div className="container">
          <div className="eyebrow"><span className="depth-tag">6 m</span>The reef</div>
          <h2 id="dest-h" className="h-section">Where to snorkel next</h2>
          {v.states.map(st => (
            <div key={st.url} style={{ marginTop: 34 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <h3 style={{ fontSize: 26, color: '#F5FDFB' }}>{st.name}</h3>
                <a href={st.url} style={{ color: '#F5FDFB', fontWeight: 800 }}>Snorkeling in {st.name} →</a>
              </div>
              <div className="grid" style={{ marginTop: 14 }}>
                {st.regions.map(r => (
                  <a key={r.url} href={r.url} className="dest-card">
                    <div className="photo"><span className="photo__label">Photo: {r.name}</span></div>
                    <div className="dest-card__body">
                      <h4 style={{ fontSize: 24 }}>{r.name}</h4>
                      <p>{r.summary}</p>
                      <p style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.spotCount} spots · {r.highlights.join(', ')}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12 m: THE BLUE / ENCOUNTERS */}
      <section id="encounters" className="scene scene--blue" aria-labelledby="enc-h">
        <span className="bubble" aria-hidden="true" style={{ left: '6%', width: 9, height: 9, animationDuration: '12s' }} />
        <span className="bubble" aria-hidden="true" style={{ left: '93%', width: 12, height: 12, animationDuration: '14s', animationDelay: '-6s' }} />
        <div className="container">
          <div className="eyebrow"><span className="depth-tag">12 m</span>The blue</div>
          <h2 id="enc-h" className="h-section" style={{ color: '#F5FDFB' }}>Who you might meet, and how to meet them well</h2>
          <p className="lede">Where each encounter happens, the season, whether you need a boat, and the one rule that matters most.</p>
          <div className="grid" style={{ marginTop: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))' }}>
            {ENCOUNTERS.map(e => (
              <article key={e.name} className="enc-card">
                <div className="photo" style={{ backgroundColor: e.tint }}><span className="photo__label">Photo: {e.name.toLowerCase()}</span></div>
                <div className="enc-card__body">
                  <h3>{e.icon} {e.name}</h3>
                  <div>📍 {e.where}</div>
                  <div>🗓️ {e.when}</div>
                  <div>🚤 {e.how}</div>
                  <div className="enc-card__rule">💚 {e.rule}</div>
                  <a href={e.href}>{e.cta} →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 20 m: REBUILDERS / CONSERVATION */}
      <section id="conservation" className="scene scene--rebuild" aria-labelledby="cons-h">
        <div className="container">
          <div className="eyebrow"><span className="depth-tag">20 m</span>The rebuilders</div>
          <h2 id="cons-h" className="h-section" style={{ color: '#F5FDFB', maxWidth: '20em' }}>People are bringing reefs back. You can swim with them.</h2>
          <div className="grid" style={{ marginTop: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="stat"><strong>20 million+</strong><p>sea turtle hatchlings released by the Riviera Maya–Tulum program since 1996.</p></div>
            <div className="stat"><strong>~12,000</strong><p>turtle nests a year monitored on northern Palm Beach County beaches, Florida.</p></div>
            <div className="stat"><strong>3,000+</strong><p>farmed corals already planted around Culebra, Puerto Rico, with thousands more planned.</p></div>
          </div>
          <h3 style={{ fontSize: 26, color: '#F5FDFB', marginTop: 44 }}>Conservation experiences you can join</h3>
          <div className="grid grid--wide" style={{ marginTop: 16 }}>
            {v.conservation.map(e => <ExperienceCard key={e.slug} e={e} headingLevel={4} />)}
          </div>
        </div>
      </section>

      {/* 30 m: TWILIGHT / PLEDGE */}
      <section id="snorkel-kind" className="scene scene--twilight" aria-labelledby="kind-h">
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <div className="eyebrow"><span className="depth-tag">30 m</span>Twilight</div>
            <h2 id="kind-h" className="h-section" style={{ color: '#F5FDFB' }}>Snorkel kind: five habits that keep reefs open</h2>
            <p className="lede">Some spots cap visitors or close two days a week so the reef can rest. These habits are why they are still worth the trip.</p>
          </div>
          <ol className="pledge" style={{ flex: '1 1 440px', minWidth: 0 }}>
            <li>🧴 <strong>Mineral, reef-safe sunscreen.</strong> Hawaii bans the sale of oxybenzone and octinoxate sunscreens; a rash guard is even better.</li>
            <li>🪸 <strong>Float, never stand.</strong> Coral is alive. Rest on sand, or wear a float vest.</li>
            <li>🐢 <strong>Give wildlife room.</strong> At least 10 ft (3 m) from turtles. Never touch, chase or feed.</li>
            <li>🧑‍🤝‍🧑 <strong>Choose operators who protect.</strong> Small groups, briefings, no feeding.</li>
            <li>🗑️ <strong>Leave it better.</strong> Pack out your trash and one piece you find.</li>
          </ol>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
