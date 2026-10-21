'use client';

// Interactive pieces. Each renders a complete, useful first paint on the server;
// interactivity is added on hydration.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SpotSummary } from '@/lib/model';
import { ACCESS, LEVEL, cToF } from '@/lib/model';

// ---------- °F / °C ----------

export function Temperature({ c, initialUnit = 'F' }: { c: number | null; initialUnit?: 'F' | 'C' }) {
  const [unit, setUnit] = useState<'F' | 'C'>(initialUnit);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <strong>{c == null ? '—' : unit === 'F' ? `${cToF(c)}°F` : `${c.toFixed(1).replace('.0', '')}°C`}</strong>
      <span role="group" aria-label="Temperature unit" className="unit-toggle">
        <button type="button" aria-pressed={unit === 'F'} onClick={() => setUnit('F')}>°F</button>
        <button type="button" aria-pressed={unit === 'C'} onClick={() => setUnit('C')}>°C</button>
      </span>
    </span>
  );
}

// ---------- three ways to go ----------

export interface VisitTab { id: string; title: string; sub: string; content: ReactNode }

export function VisitTabs({ tabs }: { tabs: VisitTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  if (!tabs.length) return null;
  const current = tabs.find(t => t.id === active) ?? tabs[0];
  return (
    <div>
      <div role="tablist" aria-label="Ways to visit" className="tabs">
        {tabs.map(t => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-controls={`panel-${t.id}`}
            aria-selected={t.id === current.id} className="tab" onClick={() => setActive(t.id)}>
            <strong>{t.title}</strong><span>{t.sub}</span>
          </button>
        ))}
      </div>
      {tabs.map(t => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} className="tabpanel" hidden={t.id !== current.id}>
          {t.content}
        </div>
      ))}
    </div>
  );
}

// ---------- region map ----------

type Filter = 'all' | 'own' | 'boat' | 'beginner' | 'turtles';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All spots' },
  { id: 'own', label: 'On your own' },
  { id: 'boat', label: 'Boat or tour' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'turtles', label: 'Turtles' },
];

function matches(s: SpotSummary, f: Filter) {
  switch (f) {
    case 'own': return s.access === 'on_your_own' || s.access === 'fee_or_reservation';
    case 'boat': return s.access === 'boat_only' || s.access === 'guide_required';
    case 'beginner': return s.level === 'beginner';
    case 'turtles': return s.turtles;
    default: return true;
  }
}

export function SpotMap({ spots, center, zoom }: { spots: SpotSummary[]; center: [number, number]; zoom: number }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState(spots[0]?.id);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const mapEl = useRef<HTMLDivElement>(null);
  const markers = useRef(new Map<string, import('leaflet').Marker>());
  const leaflet = useRef<typeof import('leaflet') | null>(null);
  const sel = spots.find(s => s.id === selected) ?? spots[0];
  const visible = useMemo(() => new Set(spots.filter(s => matches(s, filter)).map(s => s.id)), [spots, filter]);

  // Leaflet loads only in the browser. Tiles: OpenStreetMap (attribution required).
  useEffect(() => {
    let map: import('leaflet').Map | undefined;
    let cancelled = false;
    (async () => {
      let L: typeof import('leaflet');
      try {
        L = await import('leaflet');
      } catch {
        if (!cancelled) setMapFailed(true);
        return;
      }
      if (cancelled || !mapEl.current) return;
      leaflet.current = L;
      map = L.map(mapEl.current, { scrollWheelZoom: false }).setView(center, zoom);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const bounds = L.latLngBounds([]);
      spots.forEach((s, i) => {
        const m = L.marker([s.lat, s.lng], { icon: pinIcon(L, s, i + 1, false, false), title: s.name, keyboard: true })
          .addTo(map!)
          .on('click', () => setSelected(s.id));
        markers.current.set(s.id, m);
        bounds.extend([s.lat, s.lng]);
      });
      if (spots.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      setMapReady(true);
    })();
    return () => { cancelled = true; map?.remove(); markers.current.clear(); };
  }, [spots, center, zoom]);

  // Re-style pins when the filter or selection changes.
  useEffect(() => {
    const L = leaflet.current;
    if (!L || !mapReady) return;
    spots.forEach((s, i) => markers.current.get(s.id)?.setIcon(pinIcon(L, s, i + 1, s.id === selected, !visible.has(s.id))));
  }, [selected, visible, spots, mapReady]);

  return (
    <div>
      <div role="group" aria-label="Filter spots" className="filters">
        {FILTERS.map(f => (
          <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      <div className="map-wrap">
        <div className="map" ref={mapEl} role="region" aria-label="Map of snorkel spots">
          {!mapReady ? (
            <div className="map__fallback">
              {mapFailed ? (
                <ul style={{ listStyle: 'none', padding: 16, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {spots.filter(s => visible.has(s.id)).map((s, i) => (
                    <li key={s.id}><button type="button" className="chip" aria-pressed={s.id === sel?.id} onClick={() => setSelected(s.id)}>{i + 1}. {s.shortName}</button></li>
                  ))}
                </ul>
              ) : 'Loading map…'}
            </div>
          ) : null}
        </div>
        {sel ? (
          <aside className="card map-panel" aria-live="polite">
            <div className="photo" style={{ height: 140 }}><span className="photo__label">{sel.area ?? sel.shortName}</span></div>
            <div className="map-panel__body">
              <h3>{sel.name}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span className={`badge badge--${sel.access}`}>{ACCESS[sel.access].icon} {ACCESS[sel.access].short}</span>
                {sel.level ? <span className="badge badge--plain">{LEVEL[sel.level]}</span> : null}
              </div>
              <dl>
                {sel.bestSeason ? <><dt>Best time</dt><dd>{sel.bestSeason}</dd></> : null}
                {sel.highlights.length ? <><dt>You might see</dt><dd>{sel.highlights.join(', ')}</dd></> : null}
                {sel.feeText ? <><dt>Cost</dt><dd>{sel.feeText}</dd></> : null}
              </dl>
              {sel.summary ? <p style={{ fontSize: 14.5, color: 'var(--ink-soft)' }}>{sel.summary}</p> : null}
              <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                <a className="btn btn--coral" href={sel.url}>Open the full guide</a>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
      <div className="legend" aria-hidden="true">
        <span><i style={{ background: 'var(--green-ink)' }} />On your own</span>
        <span><i style={{ background: '#8A6A1E' }} />Fee or reservation</span>
        <span><i style={{ background: 'var(--lagoon-deep)', borderRadius: 3 }} />Boat or tour only</span>
      </div>
      <ul className="sr-only">
        {spots.filter(s => visible.has(s.id)).map(s => <li key={s.id}><button type="button" onClick={() => setSelected(s.id)}>{s.name}</button></li>)}
      </ul>
    </div>
  );
}

function pinIcon(L: typeof import('leaflet'), s: SpotSummary, n: number, active: boolean, dim: boolean) {
  const cls = ['pin', `pin--${s.access}`, active ? 'pin--active' : '', dim ? 'pin--dim' : ''].join(' ');
  return L.divIcon({ className: '', html: `<div class="${cls}">${n}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
}
