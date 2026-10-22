'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ACCESS, LEVEL } from '@/lib/model';
import { SiteHeader, SiteFooter, DraftBanner } from '@/components/site';
import { Photo } from '@/components/photos';
import { getPhoto, BEACH_PHOTOS } from '@/lib/photos';
import type { Dataset } from '@/lib/types';

type Props = { dataset: Dataset; preview: boolean };

const ACCESS_OPTS = [
  { id: 'all', label: 'Any access' },
  { id: 'on_your_own', label: 'On your own' },
  { id: 'fee_or_reservation', label: 'Fee or reservation' },
  { id: 'boat_only', label: 'Boat only' },
  { id: 'guide_required', label: 'Guide required' },
];

const LEVEL_OPTS = [
  { id: 'all', label: 'Any level' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const ANIMAL_OPTS = [
  { id: 'all', label: 'Any wildlife' },
  { id: 'turtles', label: 'Turtles' },
  { id: 'sharks', label: 'Sharks/rays' },
  { id: 'dolphins', label: 'Dolphins' },
  { id: 'fish', label: 'Reef fish' },
  { id: 'coral', label: 'Coral' },
];

export function SpotsFinder({ dataset: d, preview }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const regionById = useMemo(() => new Map(d.regions.map(r => [r.id, r])), [d]);
  const speciesById = useMemo(() => new Map(d.species.map(s => [s.id, s])), [d]);

  const [q, setQ] = useState(sp.get('q') ?? '');
  const [access, setAccess] = useState(sp.get('access') ?? 'all');
  const [level, setLevel] = useState(sp.get('level') ?? 'all');
  const [animals, setAnimals] = useState(sp.get('animals') ?? 'all');
  const [state, setState] = useState(sp.get('state') ?? 'all');
  const [webcam, setWebcam] = useState(sp.get('webcam') === '1');
  const [tours, setTours] = useState(sp.get('tours') === '1');
  const [fee, setFee] = useState(sp.get('fee') === '1');

  const states = useMemo(() => {
    const set = new Set<string>();
    for (const s of d.spots) {
      const r = regionById.get(s.region_id);
      if (r?.path) set.add(r.path.split('/')[0]);
    }
    return Array.from(set).sort();
  }, [d, regionById]);

  const spots = useMemo(() => {
    const all = d.spots;
    return all.filter(s => {
      const r = regionById.get(s.region_id);
      const st = r?.path?.split('/')[0] ?? '';
      if (state !== 'all' && st !== state) return false;
      const accessLabel = s.guide_required ? 'guide_required' : s.entry_method === 'boat' ? 'boat_only' : (s.reservation_required || s.entry_fee_usd != null) ? 'fee_or_reservation' : 'on_your_own';
      if (access !== 'all' && accessLabel !== access) return false;
      if (level !== 'all' && s.level !== level) return false;
      if (webcam && !s.webcam_url) return false;
      if (tours && d.spotTours.filter(st2 => st2.spot_id === s.id).length === 0) return false;
      if (fee && s.entry_fee_usd == null && !s.entry_fee_text) return false;
      if (animals !== 'all') {
        const grps = new Set(d.spotSpecies.filter(ss => ss.spot_id === s.id).map(ss => speciesById.get(ss.species_id)?.grp));
        if (animals === 'turtles' && !grps.has('turtle')) return false;
        if (animals === 'sharks' && !grps.has('shark_ray')) return false;
        if (animals === 'dolphins' && !grps.has('marine_mammal')) return false;
        if (animals === 'fish' && !grps.has('fish')) return false;
        if (animals === 'coral' && !grps.has('coral')) return false;
      }
      if (q.trim()) {
        const qq = q.toLowerCase();
        const hay = [s.name, s.area_label, s.summary, ...(s.alt_names || [])].join(' ').toLowerCase();
        if (!hay.includes(qq)) return false;
      }
      return true;
    });
  }, [d, q, access, level, animals, state, webcam, tours, fee, regionById, speciesById]);

  function update() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (access !== 'all') params.set('access', access);
    if (level !== 'all') params.set('level', level);
    if (animals !== 'all') params.set('animals', animals);
    if (state !== 'all') params.set('state', state);
    if (webcam) params.set('webcam', '1');
    if (tours) params.set('tours', '1');
    if (fee) params.set('fee', '1');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <>
      <DraftBanner show={preview} />
      <SiteHeader />
      <main>
        <section className="container" style={{ paddingTop: 40, paddingBottom: 20 }}>
          <div className="eyebrow">Spot finder</div>
          <h1 className="h-section">Find a snorkel spot</h1>
          <p className="lede">Filter by access, level, wildlife, location, webcams and tours. Every card links to a plain, honest guide.</p>
        </section>

        <section className="container" style={{ paddingBottom: 40 }}>
          <div className="finder">
            <aside className="finder__filters">
              <label className="finder__field">
                <span>Search</span>
                <input value={q} onChange={e => setQ(e.target.value)} onBlur={update} placeholder="Name, area, keyword…" />
              </label>
              <label className="finder__field">
                <span>State/region</span>
                <select value={state} onChange={e => { setState(e.target.value); setTimeout(update, 0); }}>
                  <option value="all">All</option>
                  {states.map(st => <option key={st} value={st}>{st.replace('-', ' ')}</option>)}
                </select>
              </label>
              <label className="finder__field">
                <span>Access</span>
                <select value={access} onChange={e => { setAccess(e.target.value); setTimeout(update, 0); }}>
                  {ACCESS_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </label>
              <label className="finder__field">
                <span>Level</span>
                <select value={level} onChange={e => { setLevel(e.target.value); setTimeout(update, 0); }}>
                  {LEVEL_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </label>
              <label className="finder__field">
                <span>Wildlife</span>
                <select value={animals} onChange={e => { setAnimals(e.target.value); setTimeout(update, 0); }}>
                  {ANIMAL_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </label>
              <div className="finder__checks">
                <label><input type="checkbox" checked={webcam} onChange={e => { setWebcam(e.target.checked); setTimeout(update, 0); }} /> Has webcam</label>
                <label><input type="checkbox" checked={tours} onChange={e => { setTours(e.target.checked); setTimeout(update, 0); }} /> Has tours</label>
                <label><input type="checkbox" checked={fee} onChange={e => { setFee(e.target.checked); setTimeout(update, 0); }} /> Has fee/reservation info</label>
              </div>
              <button className="btn btn--ghost" type="button" onClick={() => { setQ(''); setAccess('all'); setLevel('all'); setAnimals('all'); setState('all'); setWebcam(false); setTours(false); setFee(false); router.replace(pathname); }}>Clear filters</button>
            </aside>

            <div className="finder__results">
              <p style={{ fontWeight: 700 }}>{spots.length} spot{spots.length === 1 ? '' : 's'}</p>
              <div className="grid" style={{ marginTop: 16 }}>
                {spots.map((s, i) => {
                  const r = regionById.get(s.region_id);
                  const pc = getPhoto(BEACH_PHOTOS[i % BEACH_PHOTOS.length]);
                  const accessLabel = s.guide_required ? 'guide_required' : s.entry_method === 'boat' ? 'boat_only' : (s.reservation_required || s.entry_fee_usd != null) ? 'fee_or_reservation' : 'on_your_own';
                  const a = ACCESS[accessLabel as keyof typeof ACCESS];
                  const toursCount = d.spotTours.filter(st2 => st2.spot_id === s.id).length;
                  const page = d.pages.find(p => p.spot_id === s.id);
                  const href = page?.url_path ?? '#';
                  return (
                    <a key={s.id} href={href} className="dest-card">
                      <div className="photo">
                        {pc ? <Photo credit={pc} fill sizes="(max-width: 900px) 100vw, 33vw" /> : null}
                      </div>
                      <div className="dest-card__body">
                        <h3 style={{ fontSize: 22 }}>{s.name}</h3>
                        <p style={{ color: 'var(--ink-soft)' }}>{r?.name}{s.area_label ? ` · ${s.area_label}` : ''}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          <span className={`badge badge--${accessLabel}`}>{a.icon} {a.short}</span>
                          {s.level ? <span className="badge badge--plain">{LEVEL[s.level]}</span> : null}
                          {s.webcam_url ? <span className="badge badge--plain">📹 Webcam</span> : null}
                          {toursCount > 0 ? <span className="badge badge--plain">⛵ {toursCount} tour{toursCount === 1 ? '' : 's'}</span> : null}
                        </div>
                        {s.summary ? <p style={{ marginTop: 8 }}>{s.summary}</p> : null}
                      </div>
                    </a>
                  );
                })}
              </div>
              {spots.length === 0 ? <p style={{ marginTop: 20 }}>No spots match these filters. Try clearing some filters.</p> : null}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

