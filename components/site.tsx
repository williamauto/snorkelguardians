// Shared, server-safe building blocks. No Next.js imports so they also render in plain React.
import type { ReactNode } from 'react';
import type { Crumb, ExperienceCard as Exp, TourCard as Tour } from '@/lib/model';
import { affiliateUrl, PROVIDER_NAME } from '@/lib/affiliate';
import { ACCESS } from '@/lib/model';
import type { AccessLabel, FaqItem } from '@/lib/types';

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <img src="/icon.svg" alt="" width={size} height={size} style={{ display: 'block' }} />
  );
}

const NAV = [
  { href: '/#destinations', label: 'Destinations' },
  { href: '/#encounters', label: 'Marine life' },
  { href: '/#conservation', label: 'Reef helpers' },
  { href: '/#snorkel-kind', label: 'Snorkel kind' },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? 'site-header site-header--overlay' : 'site-header'}>
      <div className="container site-header__inner">
        <a href="/" className="brand"><Logo size={overlay ? 40 : 32} /><span>Snorkel Guardians</span></a>
        <nav aria-label="Main" className="site-nav">
          {NAV.map(n => <a key={n.href} href={n.href}>{n.label}</a>)}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <a href="/" className="brand" style={{ color: '#F5FDFB' }}><Logo size={30} /><span>Snorkel Guardians</span></a>
            <p style={{ marginTop: 12, fontSize: 15, maxWidth: '30em' }}>
              Honest snorkel spot guides: how you get in, what it costs, what you&rsquo;ll meet, and who is protecting it.
            </p>
          </div>
          <div className="site-footer__cols">
            <div>
              <strong style={{ color: '#F5FDFB' }}>Destinations</strong>
              <a href="/hawaii/">Hawaii</a>
              <a href="/california/">Southern California</a>
              <a href="/florida/">Florida</a>
            </div>
            <div>
              <strong style={{ color: '#F5FDFB' }}>About</strong>
              <a href="/about/how-we-research/">How we research spots</a>
              <a href="/about/affiliate-disclosure/">Affiliate disclosure</a>
              <a href="/about/contact/">Contact</a>
              <a href="/about/privacy/">Privacy</a>
            </div>
          </div>
        </div>
        <p className="site-footer__note">
          Water temperature and forecasts come from public ocean data and refresh hourly. Some links are affiliate links;
          partners never pay to be listed as conservation experiences. Always check local conditions before entering the water.
        </p>
      </div>
    </footer>
  );
}

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        {items.map((c, i) => (
          <li key={c.url}>{i === items.length - 1 ? <span aria-current="page">{c.name}</span> : <a href={c.url}>{c.name}</a>}</li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: data }} />;
}

export function AccessBadge({ access, short = true }: { access: AccessLabel; short?: boolean }) {
  const a = ACCESS[access];
  return <span className={`badge badge--${access}`}><span aria-hidden="true">{a.icon}</span>{short ? a.short : a.label}</span>;
}

export function Byline({ author, reviewer, updated }: { author: string | null; reviewer: string | null; updated: string | null }) {
  const name = author ?? 'Snorkel Guardians team';
  const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  // Date-only values (YYYY-MM-DD) are read at noon UTC so they never shift a day in US time zones.
  const parsed = updated ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(updated) ? `${updated}T12:00:00Z` : updated) : null;
  const date = parsed ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  return (
    <div className="byline">
      <span className="byline__avatar" aria-hidden="true">{initials}</span>
      <div>
        <div>By <strong>{name}</strong></div>
        <div className="byline__meta">
          {reviewer ? <>Reviewed by {reviewer} · </> : null}
          {date ? <>Updated <time dateTime={updated!}>{date}</time> · </> : null}
          <a href="/about/how-we-research/" style={{ color: 'inherit' }}>How we research</a>
        </div>
      </div>
    </div>
  );
}

export function Faq({ items, title }: { items: FaqItem[]; title: string }) {
  if (!items.length) return null;
  return (
    <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="faq-h">
      <h2 id="faq-h" className="h2">{title}</h2>
      <div className="faq">
        {items.map((f, i) => (
          <details key={f.question} open={i === 0}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const KIND_LABEL: Record<string, { icon: string; label: string }> = {
  coral_restoration: { icon: '🪸', label: 'Coral restoration' },
  turtle_nesting: { icon: '🐢', label: 'Turtle nesting' },
  hatchling_release: { icon: '🐢', label: 'Hatchling release' },
  reef_survey: { icon: '📋', label: 'Reef survey' },
  reef_education: { icon: '🔬', label: 'Reef education' },
  guided_snorkel: { icon: '🤿', label: 'Guided snorkel' },
  boat_snorkel: { icon: '⛵', label: 'Boat snorkel' },
  kayak_snorkel: { icon: '🛶', label: 'Kayak and snorkel' },
  night_snorkel: { icon: '🌙', label: 'Night snorkel' },
  shuttle_entry: { icon: '🚐', label: 'Shuttle and entry' },
  gear_rental: { icon: '🤿', label: 'Gear rental' },
  beach_cleanup: { icon: '🗑️', label: 'Beach clean-up' },
};

export function ExperienceCard({ e, light = false, headingLevel = 3 }: { e: Exp; light?: boolean; headingLevel?: 3 | 4 }) {
  const k = KIND_LABEL[e.kind] ?? { icon: '🌊', label: e.kind };
  const H = (headingLevel === 4 ? 'h4' : 'h3') as 'h3';
  const facts = [e.durationText, e.seasonText, e.minAge ? `Ages ${e.minAge}+` : null].filter(Boolean).join(' · ');
  return (
    <article className={light ? 'exp-card exp-card--light' : 'exp-card'}>
      <div className="exp-card__top"><span>{k.icon} {k.label}</span><span>{e.regionName}</span></div>
      <H>{e.name}</H>
      {e.description ? <p>{e.description}</p> : null}
      <div style={{ fontSize: 13.5 }}>
        {e.orgName ? <><strong>Run by</strong> {e.orgName}</> : null}
        {facts ? <>{e.orgName ? ' · ' : ''}{facts}</> : null}
      </div>
      {e.donationText ? <div style={{ fontSize: 13.5, color: 'var(--green-ink)', fontWeight: 700 }}>💚 {e.donationText}</div> : null}
      <div className="exp-card__foot">
        <span className="exp-card__price">{e.priceText ?? 'Check price'}</span>
        {e.bookingUrl
          ? <a className="btn btn--coral" style={{ minHeight: 40, padding: '9px 16px', fontSize: 14 }} href={e.bookingUrl} rel="noopener sponsored" target="_blank">Check dates</a>
          : <span className="badge badge--plain">Booking link coming</span>}
      </div>
    </article>
  );
}

const LINK_NOTE: Record<Tour['linkKind'], string | null> = {
  goes_to: null,
  nearby: 'Nearby',
  alternative: 'Alternative',
  region: null,
};

/** A Viator / GetYourGuide listing. The rating belongs to the provider: shown with attribution, never in structured data. */
export function TourCard({ t, headingLevel = 3 }: { t: Tour; headingLevel?: 3 | 4 }) {
  const H = (headingLevel === 4 ? 'h4' : 'h3') as 'h3';
  const name = PROVIDER_NAME[t.provider];
  const note = LINK_NOTE[t.linkKind];
  return (
    <article className="tour-card">
      <div className="tour-card__img">
        {t.imageUrl ? <img src={t.imageUrl} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : null}
        <span className={`tour-card__provider tour-card__provider--${t.provider}`}>{name}</span>
        {note ? <span className="tour-card__note">{note}</span> : null}
      </div>
      <div className="tour-card__body">
        <H>{t.title}</H>
        <div className="tour-card__meta">
          {t.rating != null && t.reviewCount > 0
            ? <span title={`Average rating on ${name}`}>★ {t.rating.toFixed(1)} <span className="muted">({t.reviewCount.toLocaleString('en-US')} on {name})</span></span>
            : <span className="muted">New on {name}</span>}
          {t.duration ? <span>⏱ {t.duration}</span> : null}
          {t.freeCancellation ? <span className="tour-card__free">✓ Free cancellation</span> : null}
        </div>
        <div className="tour-card__foot">
          <span className="tour-card__price">
            {t.priceFrom != null ? <>From <strong>${Math.round(t.priceFrom)}</strong> <span className="muted">{t.priceBasis ?? ''}</span></> : <span className="muted">See prices</span>}
          </span>
          <a className="btn btn--coral tour-card__btn" href={affiliateUrl(t.provider, t.productUrl)} rel="noopener sponsored nofollow" target="_blank">
            See on {name}
          </a>
        </div>
      </div>
    </article>
  );
}

export function NearbyTours({ tours, title, id = 'tours', intro }: { tours: Tour[]; title: string; id?: string; intro?: string }) {
  if (!tours.length) return null;
  return (
    <section id={id} className="section" style={{ paddingBottom: 0 }} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="h2">{title}</h2>
      {intro ? <p className="lede" style={{ marginTop: 6 }}>{intro}</p> : null}
      <div className="tour-grid">{tours.map(t => <TourCard key={t.id} t={t} />)}</div>
      <p className="tour-disclosure">
        Prices, ratings and review counts come from Viator and GetYourGuide and can change. We may earn a commission if you book through
        these links, at no extra cost to you. <a href="/about/affiliate-disclosure/">How we choose tours</a>.
      </p>
    </section>
  );
}

export function DraftBanner({ show }: { show: boolean }): ReactNode {
  if (!show) return null;
  return <div className="draft-banner">Preview build: draft content, not indexed by search engines.</div>;
}
