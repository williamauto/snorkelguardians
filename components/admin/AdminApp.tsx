'use client';

// Snorkel Guardians admin: verify facts, publish spots one by one, approve Viator /
// GetYourGuide tours and conservation experiences, and publish hub pages.
// Every write goes through RLS + is_admin() (or a SECURITY DEFINER admin_* function).

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createAdminClient, type AdminClient } from './supabase-lite';

// ---------- row types (admin sees every column) ----------

type Status = 'draft' | 'reviewed' | 'published' | 'archived';
type Confidence = 'verified_official' | 'verified_secondary' | 'needs_verification';

interface ASpot {
  id: string; slug: string; name: string; region_id: string; area_label: string | null;
  entry_method: 'shore' | 'boat' | 'shore_or_boat'; guide_required: boolean; reservation_required: boolean;
  entry_fee_usd: number | null; entry_fee_text: string | null; reservation_text: string | null; parking_text: string | null;
  hours_text: string | null; closed_weekdays: number[]; getting_there_text: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | null; depth_text: string | null; best_season_text: string | null;
  seasonal_warning: string | null; hazards_text: string | null; gear_text: string | null; rules_text: string | null;
  protected_area_name: string | null; summary: string | null; answer_block: string | null;
  webcam_url: string | null; hero_image_url: string | null; google_place_id: string | null;
  lat: number; lng: number;
  status: Status; data_confidence: Confidence; last_checked_at: string | null; updated_at: string;
  region?: { name: string; path: string } | null;
}
interface APage {
  id: string; page_type: string; url_path: string; spot_id: string | null; region_id: string | null;
  target_keyword: string; title: string | null; meta_description: string | null; h1: string | null;
  status: Status; indexable: boolean; published_at: string | null; last_content_reviewed_at: string | null; priority: number | null;
}
interface ATour {
  id: string; provider: 'viator' | 'getyourguide'; product_code: string; title: string; product_url: string; region_id: string;
  price_from_usd: number | null; price_basis: string | null; duration_text: string | null; rating: number | null;
  review_count: number | null; free_cancellation: boolean | null; image_url: string | null; status: Status;
  admin_note: string | null; fetched_at: string;
}
interface ASpotTour { spot_id: string; tour_id: string; link_kind: string; sort_order: number }
interface AExperience {
  id: string; slug: string; name: string; kind: string; is_conservation: boolean; region_id: string;
  price_text: string | null; booking_url: string | null; status: Status; data_confidence: Confidence; last_checked_at: string | null;
}
interface ASource { spot_id: string | null; experience_id: string | null; url: string; title: string | null; publisher: string | null; is_official: boolean; accessed_on: string }
interface ARegion { id: string; name: string; path: string; parent_id: string | null }
interface ALog { id: number; entity: string; entity_id: string; action: string; note: string | null; actor_email: string; created_at: string }

interface Data {
  regions: ARegion[]; spots: ASpot[]; pages: APage[]; tours: ATour[]; spotTours: ASpotTour[];
  experiences: AExperience[]; sources: ASource[]; log: ALog[];
}

async function loadAll(c: AdminClient): Promise<Data> {
  const [regions, spots, pages, tours, spotTours, experiences, sources, log] = await Promise.all([
    c.select<ARegion>('regions', 'select=id,name,path,parent_id&order=path'),
    c.select<ASpot>('spots', 'select=*,region:regions(name,path)&order=name'),
    c.select<APage>('pages', 'select=id,page_type,url_path,spot_id,region_id,target_keyword,title,meta_description,h1,status,indexable,published_at,last_content_reviewed_at,priority&order=url_path'),
    c.select<ATour>('provider_tours', 'select=*&order=sort_order'),
    c.select<ASpotTour>('spot_tours', 'select=*'),
    c.select<AExperience>('experiences', 'select=id,slug,name,kind,is_conservation,region_id,price_text,booking_url,status,data_confidence,last_checked_at&order=name'),
    c.select<ASource>('sources', 'select=spot_id,experience_id,url,title,publisher,is_official,accessed_on'),
    c.select<ALog>('review_log', 'select=*&order=created_at.desc&limit=60'),
  ]);
  return { regions, spots, pages, tours, spotTours, experiences, sources, log };
}

// ---------- labels ----------

const CONF: Record<Confidence, { label: string; cls: string }> = {
  needs_verification: { label: 'Needs verification', cls: 'warn' },
  verified_secondary: { label: 'Verified (secondary)', cls: 'ok2' },
  verified_official: { label: 'Verified (official)', cls: 'ok' },
};
const STATUS: Record<Status, string> = { draft: 'Draft', reviewed: 'Reviewed', published: 'Live', archived: 'Hidden' };
const PROVIDER = { viator: 'Viator', getyourguide: 'GetYourGuide' } as const;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Stage = 'verify' | 'ready' | 'live' | 'hidden';
function stageOf(s: ASpot): Stage {
  if (s.status === 'archived') return 'hidden';
  if (s.status === 'published') return 'live';
  return s.data_confidence === 'needs_verification' ? 'verify' : 'ready';
}
const STAGES: { id: Stage | 'all'; label: string }[] = [
  { id: 'verify', label: 'Needs verification' },
  { id: 'ready', label: 'Ready to publish' },
  { id: 'live', label: 'Live' },
  { id: 'all', label: 'All' },
];

function fmtDate(d: string | null) {
  if (!d) return '—';
  const iso = d.length === 10 ? `${d}T12:00:00Z` : d;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// ---------- spot fields shown in the editor ----------

type FieldType = 'text' | 'textarea' | 'number' | 'bool' | 'weekdays' | 'select';
interface Field { key: keyof ASpot; label: string; type: FieldType; options?: string[]; hint?: string }
const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: 'Access and fees', fields: [
      { key: 'entry_method', label: 'Entry', type: 'select', options: ['shore', 'boat', 'shore_or_boat'] },
      { key: 'guide_required', label: 'Guide or tour required', type: 'bool' },
      { key: 'reservation_required', label: 'Reservation required', type: 'bool' },
      { key: 'entry_fee_usd', label: 'Entry fee (USD, adult)', type: 'number' },
      { key: 'entry_fee_text', label: 'Entry fee, as shown', type: 'text', hint: 'e.g. "$25 for visitors; free for Hawaii residents"' },
      { key: 'reservation_text', label: 'How to reserve', type: 'textarea' },
      { key: 'hours_text', label: 'Hours', type: 'text' },
      { key: 'closed_weekdays', label: 'Closed on', type: 'weekdays' },
      { key: 'parking_text', label: 'Parking', type: 'textarea' },
      { key: 'getting_there_text', label: 'Getting there', type: 'textarea' },
    ],
  },
  {
    title: 'Conditions and safety', fields: [
      { key: 'level', label: 'Level', type: 'select', options: ['', 'beginner', 'intermediate', 'advanced'] },
      { key: 'depth_text', label: 'Depth', type: 'text' },
      { key: 'best_season_text', label: 'Best time', type: 'text' },
      { key: 'seasonal_warning', label: 'Seasonal heads-up', type: 'textarea' },
      { key: 'hazards_text', label: 'Hazards', type: 'textarea' },
      { key: 'rules_text', label: 'Rules', type: 'textarea' },
      { key: 'gear_text', label: 'Gear', type: 'textarea' },
      { key: 'protected_area_name', label: 'Protected area', type: 'text' },
    ],
  },
  {
    title: 'Page content', fields: [
      { key: 'answer_block', label: 'Answer block (first paragraph, quoted by AI search)', type: 'textarea', hint: '40–60 words. Answer "can I go on my own, do I need a boat, is there a fee?"' },
      { key: 'summary', label: 'Card summary', type: 'textarea' },
      { key: 'area_label', label: 'Area label', type: 'text' },
    ],
  },
  {
    title: 'Live data and media', fields: [
      { key: 'webcam_url', label: 'Webcam page URL', type: 'text' },
      { key: 'google_place_id', label: 'Google Place ID', type: 'text', hint: 'Shown as a Google rating with attribution, never in schema markup.' },
      { key: 'hero_image_url', label: 'Hero image URL', type: 'text' },
    ],
  },
];

// ---------- top-level ----------

export function AdminApp({ supabaseUrl, anonKey, client: injected }: { supabaseUrl: string; anonKey: string; client?: AdminClient }) {
  const client = useMemo(() => injected ?? createAdminClient(supabaseUrl, anonKey), [injected, supabaseUrl, anonKey]);
  const [phase, setPhase] = useState<'boot' | 'signin' | 'denied' | 'ready'>('boot');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { await client.consumeRedirect(); } catch (e) { setAuthError((e as Error).message); }
      if (!client.session()) { setPhase('signin'); return; }
      try {
        setPhase((await client.rpc<boolean>('is_admin')) ? 'ready' : 'denied');
      } catch (e) {
        setAuthError((e as Error).message); setPhase('signin');
      }
    })();
  }, [client]);

  const signOut = async () => { await client.signOut(); setPhase('signin'); };

  if (phase === 'boot') return <Shell><p className="adm-muted">Loading…</p></Shell>;
  if (phase === 'signin') return <Shell><SignIn client={client} initialError={authError} /></Shell>;
  if (phase === 'denied') {
    return (
      <Shell email={client.session()?.email} onSignOut={signOut}>
        <div className="adm-card adm-narrow">
          <h2>This account isn&rsquo;t an admin</h2>
          <p>Signed in as <strong>{client.session()?.email}</strong>. Ask an existing admin to add this email to the <code>admins</code> table in Supabase.</p>
        </div>
      </Shell>
    );
  }
  return <Dashboard client={client} onSignOut={signOut} />;
}

function Shell({ children, email, onSignOut }: { children: ReactNode; email?: string; onSignOut?: () => void }) {
  return (
    <div className="adm">
      <header className="adm-top">
        <a href="/" className="adm-brand">🐢 Snorkel Guardians <span>admin</span></a>
        {email ? <div className="adm-user">{email} <button type="button" className="adm-link" onClick={onSignOut}>Sign out</button></div> : null}
      </header>
      <main className="adm-main">{children}</main>
    </div>
  );
}

function SignIn({ client, initialError }: { client: AdminClient; initialError: string | null }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(initialError);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending'); setError(null);
    try {
      await client.sendMagicLink(email, `${window.location.origin}/admin/`);
      setState('sent');
    } catch (err) {
      setError((err as Error).message); setState('idle');
    }
  };
  return (
    <form className="adm-card adm-narrow" onSubmit={submit}>
      <h1>Sign in</h1>
      {state === 'sent' ? (
        <p>Check <strong>{email}</strong> for a sign-in link. It opens this page and signs you in.</p>
      ) : (
        <>
          <p className="adm-muted">We&rsquo;ll email you a one-time sign-in link. Only admin accounts can sign in.</p>
          <label className="adm-field"><span>Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <button className="adm-btn adm-btn--primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Email me a link'}</button>
        </>
      )}
      {error ? <p className="adm-error" role="alert">{error}</p> : null}
    </form>
  );
}

// ---------- dashboard ----------

type Tab = 'spots' | 'tours' | 'pages' | 'experiences' | 'activity';

function Dashboard({ client, onSignOut }: { client: AdminClient; onSignOut: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('spots');
  const [openSpot, setOpenSpot] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try { setData(await loadAll(client)); setError(null); } catch (e) { setError((e as Error).message); }
  }, [client]);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }, [toast]);

  /** Run a change, reload, and refresh the public site. */
  const act = useCallback(async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      await reload();
      const live = await client.revalidateSite();
      setToast(live ? `${label}. The site is updated.` : `${label}. The site picks it up within the hour.`);
    } catch (e) {
      setToast(`Couldn't do that: ${(e as Error).message}`);
    }
  }, [client, reload]);

  const counts = useMemo(() => {
    const c = { verify: 0, ready: 0, live: 0, tours: 0 };
    data?.spots.forEach(s => { const st = stageOf(s); if (st !== 'hidden') c[st]++; });
    c.tours = data?.tours.filter(t => t.status === 'draft').length ?? 0;
    return c;
  }, [data]);

  const spot = openSpot ? data?.spots.find(s => s.id === openSpot) : undefined;

  return (
    <Shell email={client.session()?.email} onSignOut={onSignOut}>
      <div className="adm-stats">
        <button type="button" className="adm-stat adm-stat--warn" onClick={() => { setTab('spots'); setOpenSpot(null); }}><strong>{counts.verify}</strong><span>spots to verify</span></button>
        <button type="button" className="adm-stat" onClick={() => { setTab('spots'); setOpenSpot(null); }}><strong>{counts.ready}</strong><span>ready to publish</span></button>
        <button type="button" className="adm-stat adm-stat--ok" onClick={() => { setTab('spots'); setOpenSpot(null); }}><strong>{counts.live}</strong><span>live spots</span></button>
        <button type="button" className="adm-stat" onClick={() => { setTab('tours'); setOpenSpot(null); }}><strong>{counts.tours}</strong><span>tours to review</span></button>
      </div>

      <nav className="adm-tabs" role="tablist">
        {(['spots', 'tours', 'pages', 'experiences', 'activity'] as Tab[]).map(t => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className="adm-tab" onClick={() => { setTab(t); setOpenSpot(null); }}>
            {{ spots: 'Spots', tours: 'Nearby tours', pages: 'Hub pages', experiences: 'Experiences', activity: 'Activity' }[t]}
          </button>
        ))}
      </nav>

      {error ? <p className="adm-error" role="alert">{error} <button type="button" className="adm-link" onClick={reload}>Retry</button></p> : null}
      {!data ? <p className="adm-muted">Loading content…</p> : (
        <>
          {tab === 'spots' && !spot ? <SpotQueue data={data} onOpen={setOpenSpot} /> : null}
          {tab === 'spots' && spot ? <SpotEditor key={spot.id + spot.updated_at} data={data} spot={spot} client={client} act={act} onBack={() => setOpenSpot(null)} /> : null}
          {tab === 'tours' ? <ToursPanel data={data} client={client} act={act} /> : null}
          {tab === 'pages' ? <PagesPanel data={data} client={client} act={act} /> : null}
          {tab === 'experiences' ? <ExperiencesPanel data={data} client={client} act={act} /> : null}
          {tab === 'activity' ? <ActivityPanel data={data} /> : null}
        </>
      )}
      {toast ? <div className="adm-toast" role="status">{toast}</div> : null}
    </Shell>
  );
}

type Act = (label: string, fn: () => Promise<unknown>) => Promise<void>;

// ---------- spots ----------

function SpotQueue({ data, onOpen }: { data: Data; onOpen: (id: string) => void }) {
  const [stage, setStage] = useState<Stage | 'all'>('verify');
  const [region, setRegion] = useState('');
  const [q, setQ] = useState('');
  const islands = data.regions.filter(r => r.parent_id);
  const rows = data.spots
    .filter(s => stage === 'all' || stageOf(s) === stage)
    .filter(s => !region || s.region_id === region)
    .filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <section>
      <div className="adm-filters">
        <div className="adm-seg" role="group" aria-label="Stage">
          {STAGES.map(s => (
            <button key={s.id} type="button" aria-pressed={stage === s.id} onClick={() => setStage(s.id)}>
              {s.label} <span>{s.id === 'all' ? data.spots.length : data.spots.filter(x => stageOf(x) === s.id).length}</span>
            </button>
          ))}
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)} aria-label="Region">
          <option value="">All destinations</option>
          {islands.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input type="search" placeholder="Search spots" value={q} onChange={e => setQ(e.target.value)} aria-label="Search spots" />
      </div>
      {rows.length === 0 ? <p className="adm-empty">Nothing here. {stage === 'verify' ? 'Every spot has been checked.' : ''}</p> : (
        <table className="adm-table">
          <thead><tr><th>Spot</th><th>Destination</th><th>Facts</th><th>Status</th><th>Last checked</th><th>Sources</th><th>Tours</th><th /></tr></thead>
          <tbody>
            {rows.map(s => {
              const srcs = data.sources.filter(x => x.spot_id === s.id);
              const tours = data.spotTours.filter(x => x.spot_id === s.id);
              const approved = tours.filter(x => data.tours.find(t => t.id === x.tour_id)?.status === 'published').length;
              return (
                <tr key={s.id} onClick={() => onOpen(s.id)} className="adm-row">
                  <td><strong>{s.name}</strong></td>
                  <td>{s.region?.name}</td>
                  <td><span className={`adm-pill adm-pill--${CONF[s.data_confidence].cls}`}>{CONF[s.data_confidence].label}</span></td>
                  <td><span className={`adm-pill adm-pill--${s.status}`}>{STATUS[s.status]}</span></td>
                  <td>{fmtDate(s.last_checked_at)}</td>
                  <td>{srcs.length}{srcs.some(x => x.is_official) ? ' · official' : ''}</td>
                  <td>{tours.length ? `${approved}/${tours.length} approved` : '—'}</td>
                  <td><button type="button" className="adm-btn adm-btn--small">Review</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

function SpotEditor({ data, spot, client, act, onBack }: { data: Data; spot: ASpot; client: AdminClient; act: Act; onBack: () => void }) {
  const page = data.pages.find(p => p.spot_id === spot.id);
  const [draft, setDraft] = useState<ASpot>(spot);
  const [pageDraft, setPageDraft] = useState({ title: page?.title ?? '', meta_description: page?.meta_description ?? '', h1: page?.h1 ?? '' });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const changed = (Object.keys(draft) as (keyof ASpot)[]).filter(k => k !== 'region' && JSON.stringify(draft[k]) !== JSON.stringify(spot[k]));
  const pageChanged = !!page && (pageDraft.title !== (page.title ?? '') || pageDraft.meta_description !== (page.meta_description ?? '') || pageDraft.h1 !== (page.h1 ?? ''));
  const dirty = changed.length > 0 || pageChanged;
  const sources = data.sources.filter(s => s.spot_id === spot.id).sort((a, b) => Number(b.is_official) - Number(a.is_official));
  const links = data.spotTours.filter(st => st.spot_id === spot.id).sort((a, b) => a.sort_order - b.sort_order);
  const log = data.log.filter(l => l.entity_id === spot.id || l.entity_id === page?.id);
  const stage = stageOf(spot);

  const run = async (label: string, fn: () => Promise<unknown>) => { setBusy(true); await act(label, fn); setBusy(false); };

  const save = () => run('Saved', async () => {
    if (changed.length) {
      const patch: Record<string, unknown> = {};
      changed.forEach(k => { patch[k] = draft[k] === '' ? null : draft[k]; });
      await client.update('spots', `id=eq.${spot.id}`, patch);
    }
    if (pageChanged && page) {
      await client.update('pages', `id=eq.${page.id}`, {
        title: pageDraft.title || null, meta_description: pageDraft.meta_description || null, h1: pageDraft.h1 || null,
      });
    }
  });

  const set = <K extends keyof ASpot>(k: K, v: ASpot[K]) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <section className="adm-editor">
      <div className="adm-editor__head">
        <button type="button" className="adm-link" onClick={onBack}>← All spots</button>
        <h1>{spot.name}</h1>
        <div className="adm-editor__badges">
          <span className={`adm-pill adm-pill--${CONF[spot.data_confidence].cls}`}>{CONF[spot.data_confidence].label}</span>
          <span className={`adm-pill adm-pill--${spot.status}`}>{STATUS[spot.status]}</span>
          <span className="adm-muted">{spot.region?.name} · last checked {fmtDate(spot.last_checked_at)}</span>
          {page ? <a className="adm-link" href={page.url_path} target="_blank" rel="noopener">{stage === 'live' ? 'View live page ↗' : page.url_path}</a> : null}
        </div>
      </div>

      <div className="adm-editor__grid">
        <div className="adm-editor__main">
          {GROUPS.map(g => (
            <fieldset key={g.title} className="adm-card adm-group">
              <legend>{g.title}</legend>
              {g.fields.map(f => <FieldInput key={String(f.key)} field={f} value={draft[f.key]} onChange={v => set(f.key, v as never)} changed={changed.includes(f.key)} />)}
            </fieldset>
          ))}

          {page ? (
            <fieldset className="adm-card adm-group adm-group--stack">
              <legend>Search listing</legend>
              <p className="adm-muted">Target keyword: <strong>{page.target_keyword}</strong></p>
              <Counted label="Title tag" max={65} value={pageDraft.title} onChange={v => setPageDraft(p => ({ ...p, title: v }))} />
              <Counted label="Meta description" max={160} min={120} value={pageDraft.meta_description} onChange={v => setPageDraft(p => ({ ...p, meta_description: v }))} textarea />
              <Counted label="H1" max={80} value={pageDraft.h1} onChange={v => setPageDraft(p => ({ ...p, h1: v }))} />
              <div className="adm-serp" aria-label="Google preview">
                <div className="adm-serp__url">snorkelguardians.com › {page.url_path.split('/').filter(Boolean).join(' › ')}</div>
                <div className="adm-serp__title">{pageDraft.title || page.target_keyword}</div>
                <div className="adm-serp__desc">{pageDraft.meta_description}</div>
              </div>
            </fieldset>
          ) : null}
        </div>

        <aside className="adm-editor__side">
          <div className="adm-card adm-sticky">
            <h2>Review</h2>
            <ol className="adm-steps">
              <li className={spot.data_confidence !== 'needs_verification' ? 'done' : ''}>Check the facts against the sources</li>
              <li className={spot.data_confidence !== 'needs_verification' ? 'done' : ''}>Mark as verified</li>
              <li className={stage === 'live' ? 'done' : ''}>Publish</li>
            </ol>
            <label className="adm-field"><span>Note for the activity log (optional)</span>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Fee confirmed on hanaumabaystatepark.com" />
            </label>
            {dirty ? <button type="button" className="adm-btn adm-btn--primary adm-block" disabled={busy} onClick={save}>Save {changed.length + (pageChanged ? 1 : 0)} change{changed.length + (pageChanged ? 1 : 0) === 1 ? '' : 's'}</button> : null}
            <div className="adm-actions">
              <button type="button" className="adm-btn" disabled={busy || dirty}
                onClick={() => run('Marked verified (official source)', () => client.rpc('admin_verify_spot', { p_spot: spot.id, p_confidence: 'verified_official', p_note: note || null }))}>
                ✓ Verified on official site
              </button>
              <button type="button" className="adm-btn" disabled={busy || dirty}
                onClick={() => run('Marked verified (secondary source)', () => client.rpc('admin_verify_spot', { p_spot: spot.id, p_confidence: 'verified_secondary', p_note: note || null }))}>
                ✓ Verified on a reliable secondary source
              </button>
              {stage !== 'live' ? (
                <button type="button" className="adm-btn adm-btn--go" disabled={busy || dirty || spot.data_confidence === 'needs_verification'}
                  title={spot.data_confidence === 'needs_verification' ? 'Verify first' : undefined}
                  onClick={() => run(`${spot.name} is live`, () => client.rpc('admin_publish_spot', { p_spot: spot.id, p_note: note || null }))}>
                  Publish spot
                </button>
              ) : (
                <button type="button" className="adm-btn adm-btn--danger" disabled={busy}
                  onClick={() => run(`${spot.name} unpublished`, () => client.rpc('admin_unpublish_spot', { p_spot: spot.id, p_note: note || null }))}>
                  Unpublish
                </button>
              )}
              {dirty ? <p className="adm-muted">Save your edits before verifying or publishing.</p> : null}
              {stage === 'verify' && !dirty ? <p className="adm-muted">Publishing unlocks once the facts are verified.</p> : null}
            </div>
          </div>

          <div className="adm-card">
            <h2>Sources ({sources.length})</h2>
            {sources.length ? (
              <ul className="adm-sources">
                {sources.map(s => (
                  <li key={s.url}>
                    {s.is_official ? <span className="adm-pill adm-pill--ok">Official</span> : null}{' '}
                    <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title ?? s.url}</a>
                    <div className="adm-muted">{s.publisher} · accessed {fmtDate(s.accessed_on)}</div>
                  </li>
                ))}
              </ul>
            ) : <p className="adm-muted">No sources yet. Add an official page before verifying.</p>}
            <AddSource client={client} spotId={spot.id} act={act} />
          </div>

          <div className="adm-card">
            <h2>Nearby tours ({links.length})</h2>
            {links.length ? links.map(l => {
              const t = data.tours.find(x => x.id === l.tour_id);
              return t ? <TourRow key={t.id} t={t} client={client} act={act} linkKind={l.link_kind} compact /> : null;
            }) : <p className="adm-muted">No tours linked. The page shows top-rated tours from {spot.region?.name} instead, once approved.</p>}
          </div>

          {log.length ? (
            <div className="adm-card">
              <h2>History</h2>
              <ul className="adm-log">{log.map(l => <li key={l.id}><strong>{l.action}</strong> · {l.actor_email} · {fmtDate(l.created_at)}{l.note ? <div className="adm-muted">{l.note}</div> : null}</li>)}</ul>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function FieldInput({ field, value, onChange, changed }: { field: Field; value: unknown; onChange: (v: unknown) => void; changed: boolean }) {
  const cls = `adm-field${changed ? ' adm-field--changed' : ''}`;
  if (field.type === 'bool') {
    return (
      <label className={`${cls} adm-field--check`}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} /> <span>{field.label}</span>
      </label>
    );
  }
  if (field.type === 'weekdays') {
    const days = (value as number[]) ?? [];
    return (
      <div className={cls}><span>{field.label}</span>
        <div className="adm-days">
          {WEEKDAYS.map((d, i) => (
            <button key={d} type="button" aria-pressed={days.includes(i)}
              onClick={() => onChange(days.includes(i) ? days.filter(x => x !== i) : [...days, i].sort())}>{d}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <label className={cls}>
      <span>{field.label}</span>
      {field.type === 'textarea' ? (
        <textarea rows={3} value={(value as string) ?? ''} onChange={e => onChange(e.target.value)} />
      ) : field.type === 'select' ? (
        <select value={(value as string) ?? ''} onChange={e => onChange(e.target.value || null)}>
          {field.options!.map(o => <option key={o} value={o}>{o ? o.replace(/_/g, ' ') : '—'}</option>)}
        </select>
      ) : field.type === 'number' ? (
        <input type="number" step="0.01" min="0" value={value == null ? '' : String(value)} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))} />
      ) : (
        <input value={(value as string) ?? ''} onChange={e => onChange(e.target.value)} />
      )}
      {field.hint ? <small>{field.hint}</small> : null}
    </label>
  );
}

function Counted({ label, value, onChange, max, min, textarea }: { label: string; value: string; onChange: (v: string) => void; max: number; min?: number; textarea?: boolean }) {
  const n = value.length;
  const tone = n > max ? 'bad' : min && n < min ? 'warn' : 'ok';
  return (
    <label className="adm-field">
      <span>{label} <em className={`adm-count adm-count--${tone}`}>{n}/{max}</em></span>
      {textarea ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} /> : <input value={value} onChange={e => onChange(e.target.value)} />}
    </label>
  );
}

function AddSource({ client, spotId, act }: { client: AdminClient; spotId: string; act: Act }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [official, setOfficial] = useState(true);
  if (!open) return <button type="button" className="adm-link" onClick={() => setOpen(true)}>+ Add a source</button>;
  return (
    <form className="adm-addsrc" onSubmit={async e => {
      e.preventDefault();
      let publisher = '';
      try { publisher = new URL(url).hostname.replace(/^www\./, ''); } catch { /* validated by input type=url */ }
      await act('Source added', () => client.insert('sources', {
        spot_id: spotId, url, title: title || null, publisher, is_official: official, accessed_on: new Date().toISOString().slice(0, 10),
      }));
      setOpen(false); setUrl(''); setTitle('');
    }}>
      <input type="url" required placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} aria-label="Source URL" />
      <input placeholder="Page title" value={title} onChange={e => setTitle(e.target.value)} aria-label="Source title" />
      <label className="adm-field--check"><input type="checkbox" checked={official} onChange={e => setOfficial(e.target.checked)} /> Official (park, agency, operator)</label>
      <button className="adm-btn adm-btn--small">Add</button>
    </form>
  );
}

// ---------- tours ----------

function TourRow({ t, client, act, linkKind, compact }: { t: ATour; client: AdminClient; act: Act; linkKind?: string; compact?: boolean }) {
  const set = (status: Status, label: string) => act(label, () => client.rpc('admin_set_tour_status', { p_tour: t.id, p_status: status }));
  return (
    <div className={`adm-tour${compact ? ' adm-tour--compact' : ''} adm-tour--${t.status}`}>
      {!compact ? <div className="adm-tour__img">{t.image_url ? <img src={t.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}</div> : null}
      <div className="adm-tour__body">
        <div className="adm-tour__top">
          <span className={`adm-prov adm-prov--${t.provider}`}>{PROVIDER[t.provider]}</span>
          {linkKind ? <span className="adm-muted">{linkKind.replace('_', ' ')}</span> : null}
          <span className={`adm-pill adm-pill--${t.status}`}>{STATUS[t.status]}</span>
        </div>
        <a href={t.product_url} target="_blank" rel="noopener noreferrer" className="adm-tour__title">{t.title}</a>
        <div className="adm-muted">
          {t.rating != null && (t.review_count ?? 0) > 0 ? `★ ${Number(t.rating).toFixed(1)} (${(t.review_count ?? 0).toLocaleString('en-US')})` : 'No reviews yet'}
          {t.price_from_usd != null ? ` · from $${Math.round(Number(t.price_from_usd))}` : ''}
          {t.duration_text ? ` · ${t.duration_text}` : ''}
          {t.free_cancellation ? ' · free cancellation' : ''}
        </div>
      </div>
      <div className="adm-tour__actions">
        {t.status !== 'published' ? <button type="button" className="adm-btn adm-btn--small adm-btn--go" onClick={() => set('published', 'Tour approved')}>Approve</button> : null}
        {t.status !== 'archived' ? <button type="button" className="adm-btn adm-btn--small" onClick={() => set('archived', 'Tour hidden')}>Hide</button> : null}
        {t.status === 'archived' ? <button type="button" className="adm-btn adm-btn--small" onClick={() => set('draft', 'Tour back in review')}>Restore</button> : null}
      </div>
    </div>
  );
}

function ToursPanel({ data, client, act }: { data: Data; client: AdminClient; act: Act }) {
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<Status | ''>('draft');
  const islands = data.regions.filter(r => r.parent_id);
  const rows = data.tours.filter(t => (!region || t.region_id === region) && (!status || t.status === status));
  const strong = rows.filter(t => t.status === 'draft' && Number(t.rating ?? 0) >= 4.5 && (t.review_count ?? 0) >= 100);
  return (
    <section>
      <p className="adm-muted adm-intro">
        Tours from Viator and GetYourGuide shown in the &ldquo;Tours near…&rdquo; section of spot and destination pages. Only approved tours appear.
        Links in the database are clean; the site adds your affiliate IDs from the <code>GYG_PARTNER_ID</code> and <code>VIATOR_PID</code> settings.
      </p>
      <div className="adm-filters">
        <div className="adm-seg" role="group" aria-label="Status">
          {(['draft', 'published', 'archived', ''] as const).map(s => (
            <button key={s || 'all'} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s ? STATUS[s] === 'Draft' ? 'To review' : STATUS[s] : 'All'} <span>{data.tours.filter(t => !s || t.status === s).length}</span>
            </button>
          ))}
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)} aria-label="Region">
          <option value="">All destinations</option>
          {islands.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {strong.length ? (
          <button type="button" className="adm-btn adm-btn--small"
            onClick={() => act(`${strong.length} tours approved`, async () => { for (const t of strong) await client.rpc('admin_set_tour_status', { p_tour: t.id, p_status: 'published' }); })}>
            Approve {strong.length} rated 4.5+ with 100+ reviews
          </button>
        ) : null}
      </div>
      {islands.filter(r => !region || r.id === region).map(r => {
        const list = rows.filter(t => t.region_id === r.id);
        if (!list.length) return null;
        return (
          <div key={r.id} className="adm-tourgroup">
            <h2>{r.name} <span className="adm-muted">({list.length})</span></h2>
            <div className="adm-tourlist">
              {list.map(t => {
                const spots = data.spotTours.filter(st => st.tour_id === t.id).map(st => data.spots.find(s => s.id === st.spot_id)?.name).filter(Boolean);
                return (
                  <div key={t.id}>
                    <TourRow t={t} client={client} act={act} />
                    <div className="adm-tour__spots">{spots.length ? `Shown on: ${spots.join(', ')}` : `Shown on the ${r.name} page`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {!rows.length ? <p className="adm-empty">No tours in this view.</p> : null}
    </section>
  );
}

// ---------- hub pages ----------

function PagesPanel({ data, client, act }: { data: Data; client: AdminClient; act: Act }) {
  const hubs = data.pages.filter(p => p.page_type !== 'spot').sort((a, b) => a.url_path.localeCompare(b.url_path));
  return (
    <section>
      <p className="adm-muted adm-intro">Home, state, island and encounter pages. Publishing a spot also publishes its island, state and the home page automatically.</p>
      <table className="adm-table">
        <thead><tr><th>Page</th><th>Type</th><th>Title</th><th>Meta</th><th>Status</th><th /></tr></thead>
        <tbody>
          {hubs.map(p => {
            const tl = (p.title ?? '').length, ml = (p.meta_description ?? '').length;
            return (
              <tr key={p.id}>
                <td><a href={p.url_path} target="_blank" rel="noopener">{p.url_path}</a><div className="adm-muted">{p.target_keyword}</div></td>
                <td>{p.page_type}</td>
                <td><span className={`adm-count adm-count--${tl > 65 || tl === 0 ? 'bad' : 'ok'}`}>{tl}/65</span></td>
                <td><span className={`adm-count adm-count--${ml > 160 || ml < 120 ? 'warn' : 'ok'}`}>{ml}/160</span></td>
                <td><span className={`adm-pill adm-pill--${p.status}`}>{STATUS[p.status]}</span></td>
                <td>
                  {p.status !== 'published'
                    ? <button type="button" className="adm-btn adm-btn--small adm-btn--go" onClick={() => act(`${p.url_path} is live`, () => client.rpc('admin_set_page_status', { p_page: p.id, p_status: 'published' }))}>Publish</button>
                    : <button type="button" className="adm-btn adm-btn--small" onClick={() => act(`${p.url_path} unpublished`, () => client.rpc('admin_set_page_status', { p_page: p.id, p_status: 'reviewed' }))}>Unpublish</button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

// ---------- experiences ----------

function ExperiencesPanel({ data, client, act }: { data: Data; client: AdminClient; act: Act }) {
  const region = (id: string) => data.regions.find(r => r.id === id)?.name ?? '';
  return (
    <section>
      <p className="adm-muted adm-intro">Conservation trips and local operators we recommend directly (coral restoration, turtle walks, reef talks). Check the booking link and price, then approve.</p>
      <table className="adm-table">
        <thead><tr><th>Experience</th><th>Destination</th><th>Price</th><th>Facts</th><th>Status</th><th /></tr></thead>
        <tbody>
          {data.experiences.map(e => {
            const src = data.sources.find(s => s.experience_id === e.id);
            return (
              <tr key={e.id}>
                <td>
                  <strong>{e.is_conservation ? '💚 ' : ''}{e.name}</strong>
                  <div className="adm-muted">{e.kind.replace(/_/g, ' ')}{e.booking_url ? <> · <a href={e.booking_url} target="_blank" rel="noopener noreferrer">booking page ↗</a></> : ' · no booking link'}{src ? <> · <a href={src.url} target="_blank" rel="noopener noreferrer">source ↗</a></> : null}</div>
                </td>
                <td>{region(e.region_id)}</td>
                <td>{e.price_text ?? '—'}</td>
                <td><span className={`adm-pill adm-pill--${CONF[e.data_confidence].cls}`}>{CONF[e.data_confidence].label}</span></td>
                <td><span className={`adm-pill adm-pill--${e.status}`}>{STATUS[e.status]}</span></td>
                <td className="adm-nowrap">
                  {e.status !== 'published'
                    ? <button type="button" className="adm-btn adm-btn--small adm-btn--go" onClick={() => act(`${e.name} approved`, () => client.rpc('admin_set_experience_status', { p_exp: e.id, p_status: 'published', p_confidence: e.data_confidence === 'needs_verification' ? 'verified_secondary' : e.data_confidence }))}>Verify &amp; approve</button>
                    : null}
                  {e.status !== 'archived'
                    ? <button type="button" className="adm-btn adm-btn--small" onClick={() => act(`${e.name} hidden`, () => client.rpc('admin_set_experience_status', { p_exp: e.id, p_status: 'archived' }))}>Hide</button>
                    : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function ActivityPanel({ data }: { data: Data }) {
  const name = (l: ALog) =>
    l.entity === 'spot' ? data.spots.find(s => s.id === l.entity_id)?.name
      : l.entity === 'tour' ? data.tours.find(t => t.id === l.entity_id)?.title
        : l.entity === 'page' ? data.pages.find(p => p.id === l.entity_id)?.url_path
          : data.experiences.find(e => e.id === l.entity_id)?.name;
  return (
    <section>
      {data.log.length ? (
        <table className="adm-table">
          <thead><tr><th>When</th><th>Who</th><th>What</th><th>Item</th><th>Note</th></tr></thead>
          <tbody>{data.log.map(l => (
            <tr key={l.id}><td className="adm-nowrap">{new Date(l.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{l.actor_email}</td><td>{l.action}</td><td>{name(l) ?? l.entity}</td><td>{l.note ?? ''}</td></tr>
          ))}</tbody>
        </table>
      ) : <p className="adm-empty">No activity yet. Verifications, publishes and tour approvals show up here.</p>}
    </section>
  );
}
