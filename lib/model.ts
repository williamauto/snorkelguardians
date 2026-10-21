// Pure functions: Dataset -> view models for each page type.
// No framework imports, so the same logic runs in Next.js and in local render checks.

import type {
  AccessLabel, Dataset, Experience, FaqItem, Page, Region, Source, Species, Spot, SpotConditions, SpotSpecies,
} from './types';

export interface Crumb { name: string; url: string }
export interface LinkOut { name: string; url: string }

export interface SpotSummary {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  url: string;
  area: string | null;
  lat: number;
  lng: number;
  access: AccessLabel;
  level: Spot['level'];
  summary: string | null;
  feeText: string | null;
  bestSeason: string | null;
  turtles: boolean;
  highlights: string[];
  confidence: Spot['data_confidence'];
}

export interface GlanceRow { icon: string; label: string; value: string; tone?: 'warn' }

export interface ExperienceCard {
  slug: string;
  name: string;
  kind: string;
  isConservation: boolean;
  orgName: string | null;
  description: string | null;
  priceText: string | null;
  donationText: string | null;
  durationText: string | null;
  seasonText: string | null;
  minAge: number | null;
  meetingPoint: string | null;
  bookingUrl: string | null;
  linkKind?: 'goes_to' | 'nearby' | 'alternative';
  regionName: string | null;
}

export interface SpeciesSighting {
  name: string;
  localName: string | null;
  odds: string;
  season: string | null;
  rule: string | null;
  description: string | null;
}

// ---------- labels ----------

export const ACCESS: Record<AccessLabel, { label: string; short: string; icon: string }> = {
  on_your_own:        { label: 'On your own, from the beach', short: 'On your own', icon: '🏖️' },
  fee_or_reservation: { label: 'On your own, with a fee or reservation', short: 'Fee or reservation', icon: '🎟️' },
  boat_only:          { label: 'Boat or tour only', short: 'Boat or tour', icon: '⛵' },
  guide_required:     { label: 'Licensed guide required', short: 'Guide required', icon: '🧭' },
};

export const LEVEL: Record<NonNullable<Spot['level']>, string> = {
  beginner: 'Beginner and family',
  intermediate: 'Confident swimmers',
  advanced: 'Experienced only',
};

const ODDS: Record<SpotSpecies['odds'], string> = {
  very_likely: 'Very likely', often: 'Often seen', seasonal: 'Seasonal', occasional: 'Sometimes', rare: 'Rare',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function accessLabel(s: Spot): AccessLabel {
  if (s.guide_required) return 'guide_required';
  if (s.entry_method === 'boat') return 'boat_only';
  if (s.reservation_required || (s.entry_fee_usd ?? 0) > 0) return 'fee_or_reservation';
  return 'on_your_own';
}

export function shortName(name: string): string {
  return name.replace(/\s*\(.*\)$/, '');
}

export function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

// ---------- lookups ----------

function by<T, K extends keyof T>(rows: T[], key: K) {
  const m = new Map<T[K], T>();
  for (const r of rows) m.set(r[key], r);
  return m;
}

export class Model {
  readonly regionById: Map<string, Region>;
  readonly regionByPath: Map<string, Region>;
  readonly spotById: Map<string, Spot>;
  readonly speciesById: Map<string, Species>;
  readonly pageById: Map<string, Page>;
  readonly pageByPath: Map<string, Page>;
  readonly expById: Map<string, Experience>;

  constructor(readonly d: Dataset) {
    this.regionById = by(d.regions, 'id');
    this.regionByPath = by(d.regions, 'path');
    this.spotById = by(d.spots, 'id');
    this.speciesById = by(d.species, 'id');
    this.pageById = by(d.pages, 'id');
    this.pageByPath = by(d.pages, 'url_path');
    this.expById = by(d.experiences, 'id');
  }

  page(path: string): Page | undefined {
    return this.pageByPath.get(path);
  }

  spotPage(spotId: string): Page | undefined {
    return this.d.pages.find(p => p.page_type === 'spot' && p.spot_id === spotId);
  }

  regionPage(regionId: string): Page | undefined {
    return this.d.pages.find(p => (p.page_type === 'region' || p.page_type === 'state') && p.region_id === regionId);
  }

  faqs(pageId: string): FaqItem[] {
    return this.d.faqs.filter(f => f.page_id === pageId).sort((a, b) => a.sort_order - b.sort_order);
  }

  links(pageId: string, role?: string): LinkOut[] {
    return this.d.links
      .filter(l => l.from_page_id === pageId && (!role || l.role === role) && this.pageById.has(l.to_page_id))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(l => ({ name: l.anchor_text, url: this.pageById.get(l.to_page_id)!.url_path }));
  }

  breadcrumbs(region: Region | undefined, last?: Crumb): Crumb[] {
    const chain: Crumb[] = [];
    let r = region;
    while (r) {
      const p = this.regionPage(r.id);
      if (p) chain.unshift({ name: r.name, url: p.url_path });
      r = r.parent_id ? this.regionById.get(r.parent_id) : undefined;
    }
    const out = [{ name: 'Home', url: '/' }, ...chain];
    if (last) out.push(last);
    return out;
  }

  sightings(spotId: string): SpeciesSighting[] {
    // Lead with the encounters people travel for (turtles, mammals, sharks and rays), then by odds.
    const order: SpotSpecies['odds'][] = ['very_likely', 'often', 'seasonal', 'occasional', 'rare'];
    const groupRank = (id: string) => {
      const g = this.speciesById.get(id)?.grp;
      return g === 'turtle' || g === 'marine_mammal' || g === 'shark_ray' ? 0 : 1;
    };
    const flagship = (ss: SpotSpecies) => groupRank(ss.species_id) === 0 && ['very_likely', 'often', 'seasonal'].includes(ss.odds) ? 0 : 1;
    return this.d.spotSpecies
      .filter(ss => ss.spot_id === spotId)
      .sort((a, b) => flagship(a) - flagship(b) || order.indexOf(a.odds) - order.indexOf(b.odds))
      .map(ss => {
        const sp = this.speciesById.get(ss.species_id)!;
        return {
          name: sp.common_name, localName: sp.local_name, odds: ODDS[ss.odds], season: ss.season_text,
          rule: sp.distance_rule, description: sp.description,
        };
      });
  }

  summary(s: Spot): SpotSummary | undefined {
    const p = this.spotPage(s.id);
    if (!p) return undefined;
    const sights = this.d.spotSpecies.filter(ss => ss.spot_id === s.id);
    const turtle = this.d.species.find(x => x.slug === 'green-sea-turtle');
    return {
      id: s.id, slug: s.slug, name: s.name, shortName: shortName(s.name), url: p.url_path, area: s.area_label,
      lat: s.lat, lng: s.lng, access: accessLabel(s), level: s.level, summary: s.summary, feeText: s.entry_fee_text,
      bestSeason: s.best_season_text,
      turtles: !!turtle && sights.some(ss => ss.species_id === turtle.id && ['very_likely', 'often'].includes(ss.odds)),
      highlights: this.sightings(s.id).filter(x => x.odds !== 'Sometimes' && x.odds !== 'Rare').slice(0, 3).map(x => x.name),
      confidence: s.data_confidence,
    };
  }

  experienceCard(e: Experience, linkKind?: ExperienceCard['linkKind']): ExperienceCard {
    const org = e.organization_id ? this.d.organizations.find(o => o.id === e.organization_id) : undefined;
    return {
      slug: e.slug, name: e.name, kind: e.kind, isConservation: e.is_conservation, orgName: org?.name ?? null,
      description: e.description, priceText: e.price_text, donationText: e.donation_text, durationText: e.duration_text,
      seasonText: e.season_text, minAge: e.min_age, meetingPoint: e.meeting_point, bookingUrl: e.booking_url ?? org?.website_url ?? null,
      linkKind, regionName: this.regionById.get(e.region_id)?.name ?? null,
    };
  }

  /** Spots in a region (or in all child regions of a state) that have a page. */
  spotsIn(regionId: string): SpotSummary[] {
    const ids = new Set([regionId, ...this.d.regions.filter(r => r.parent_id === regionId).map(r => r.id)]);
    return this.d.spots
      .filter(s => ids.has(s.region_id))
      .map(s => this.summary(s))
      .filter((x): x is SpotSummary => !!x)
      .sort((a, b) => {
        const pa = this.spotPage(a.id)?.priority ?? 9, pb = this.spotPage(b.id)?.priority ?? 9;
        return pa - pb || a.name.localeCompare(b.name);
      });
  }

  experiencesIn(regionId: string): ExperienceCard[] {
    const ids = new Set([regionId, ...this.d.regions.filter(r => r.parent_id === regionId).map(r => r.id)]);
    return this.d.experiences.filter(e => ids.has(e.region_id)).map(e => this.experienceCard(e));
  }

  conditions(spotId: string): SpotConditions | undefined {
    return this.d.conditions.find(c => c.spot_id === spotId);
  }

  sources(spotId: string): Source[] {
    return this.d.sources.filter(s => s.spot_id === spotId);
  }
}

// ---------- page view models ----------

export interface SpotViewModel {
  page: Page;
  spot: Spot;
  region: Region;
  state: Region | undefined;
  crumbs: Crumb[];
  access: AccessLabel;
  glance: GlanceRow[];
  sightings: SpeciesSighting[];
  conditions: SpotConditions | null;
  canGoAlone: boolean;
  tours: ExperienceCard[];
  conservation: ExperienceCard[];
  nearby: SpotSummary[];
  related: LinkOut[];
  regionLink: LinkOut | null;
  faqs: FaqItem[];
  sources: Source[];
}

export function spotView(m: Model, path: string): SpotViewModel | undefined {
  const page = m.page(path);
  if (!page || page.page_type !== 'spot' || !page.spot_id) return undefined;
  const spot = m.spotById.get(page.spot_id);
  if (!spot) return undefined;
  const region = m.regionById.get(spot.region_id)!;
  const state = region.parent_id ? m.regionById.get(region.parent_id) : undefined;
  const access = accessLabel(spot);
  const sightings = m.sightings(spot.id);

  const glance: GlanceRow[] = [];
  const getIn = spot.entry_method === 'shore_or_boat' ? 'From shore or by boat' : ACCESS[access].label;
  glance.push({ icon: spot.entry_method === 'boat' ? '⛵' : '🏖️', label: 'Getting in', value: getIn });
  if (spot.entry_fee_text) glance.push({ icon: '🎟️', label: 'Entry', value: spot.entry_fee_text });
  if (spot.reservation_required && spot.reservation_text) glance.push({ icon: '📲', label: 'Reservation', value: spot.reservation_text });
  if (spot.hours_text) glance.push({ icon: '🕕', label: 'Open', value: spot.hours_text });
  if (spot.closed_weekdays.length && !/closed/i.test(spot.hours_text ?? '')) {
    glance.push({ icon: '🚫', label: 'Closed', value: spot.closed_weekdays.map(d => WEEKDAYS[d]).join(' and '), tone: 'warn' });
  }
  if (spot.parking_text) glance.push({ icon: '🅿️', label: 'Parking', value: spot.parking_text });
  if (spot.level) glance.push({ icon: '🧒', label: 'Level', value: LEVEL[spot.level] + (spot.depth_text ? ` · ${spot.depth_text}` : '') });
  if (sightings.length) glance.push({ icon: '🐢', label: 'Wildlife', value: sightings.slice(0, 3).map(s => s.name).join(', ') });
  if (spot.best_season_text) glance.push({ icon: '📅', label: 'Best time', value: spot.best_season_text });
  if (spot.seasonal_warning) glance.push({ icon: '⚠️', label: 'Heads-up', value: spot.seasonal_warning, tone: 'warn' });
  if (spot.protected_area_name) glance.push({ icon: '🛡️', label: 'Protected area', value: spot.protected_area_name });
  if (spot.gear_text) glance.push({ icon: '🤿', label: 'Gear', value: spot.gear_text });

  const links = m.d.spotExperiences.filter(se => se.spot_id === spot.id);
  const cards = links
    .map(se => {
      const e = m.expById.get(se.experience_id);
      return e ? m.experienceCard(e, se.link_kind) : undefined;
    })
    .filter((x): x is ExperienceCard => !!x);

  const siblingIds = m.d.links
    .filter(l => l.from_page_id === page.id && l.role === 'sibling')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(l => m.pageById.get(l.to_page_id)?.spot_id)
    .filter((x): x is string => !!x);
  const nearby = siblingIds.map(id => m.summary(m.spotById.get(id)!)).filter((x): x is SpotSummary => !!x);

  const rp = m.regionPage(region.id);
  return {
    page, spot, region, state,
    crumbs: m.breadcrumbs(region, { name: shortName(spot.name), url: page.url_path }),
    access, glance, sightings,
    conditions: m.conditions(spot.id) ?? null,
    canGoAlone: spot.entry_method !== 'boat' && !spot.guide_required,
    tours: cards.filter(c => !c.isConservation || c.kind === 'boat_snorkel' || c.kind === 'guided_snorkel' || c.kind === 'kayak_snorkel'),
    conservation: cards.filter(c => c.isConservation),
    nearby,
    related: m.links(page.id, 'related'),
    regionLink: rp ? { name: `Snorkeling in ${region.name}`, url: rp.url_path } : null,
    faqs: m.faqs(page.id),
    sources: m.sources(spot.id),
  };
}

export interface RegionViewModel {
  page: Page;
  region: Region;
  isState: boolean;
  crumbs: Crumb[];
  spots: SpotSummary[];
  childRegions: { name: string; url: string; summary: string | null; spotCount: number; highlights: string[] }[];
  experiences: ExperienceCard[];
  related: LinkOut[];
  faqs: FaqItem[];
  waterTempC: number | null;
}

export function regionView(m: Model, path: string): RegionViewModel | undefined {
  const page = m.page(path);
  if (!page || (page.page_type !== 'region' && page.page_type !== 'state') || !page.region_id) return undefined;
  const region = m.regionById.get(page.region_id)!;
  const spots = m.spotsIn(region.id);
  const childRegions = m.d.regions
    .filter(r => r.parent_id === region.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap(r => {
      const p = m.regionPage(r.id);
      if (!p) return [];
      const s = m.spotsIn(r.id);
      return [{ name: r.name, url: p.url_path, summary: r.summary, spotCount: s.length, highlights: s.slice(0, 3).map(x => x.shortName) }];
    });
  const temps = spots.map(s => m.conditions(s.id)?.water_temp_c).filter((t): t is number => typeof t === 'number');
  return {
    page, region, isState: page.page_type === 'state',
    crumbs: m.breadcrumbs(region),
    spots, childRegions,
    experiences: m.experiencesIn(region.id),
    related: m.links(page.id, 'related'),
    faqs: m.faqs(page.id),
    waterTempC: temps.length ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10 : null,
  };
}

export interface EncounterViewModel {
  page: Page;
  species: Species | undefined;
  crumbs: Crumb[];
  spots: (SpotSummary & { odds: string; season: string | null; regionName: string })[];
  faqs: FaqItem[];
}

export function encounterView(m: Model, path: string): EncounterViewModel | undefined {
  const page = m.page(path);
  if (!page || page.page_type !== 'encounter') return undefined;
  const species = page.species_id ? m.speciesById.get(page.species_id) : undefined;
  const childIds = new Set(m.links(page.id, 'child').map(l => m.pageByPath.get(l.url)?.spot_id).filter(Boolean) as string[]);
  const spots = m.d.spotSpecies
    .filter(ss => ss.species_id === species?.id && childIds.has(ss.spot_id))
    .map(ss => {
      const s = m.spotById.get(ss.spot_id)!;
      const sum = m.summary(s);
      return sum ? { ...sum, odds: ODDS[ss.odds], season: ss.season_text, regionName: m.regionById.get(s.region_id)!.name } : undefined;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  return {
    page, species,
    crumbs: [{ name: 'Home', url: '/' }, { name: page.h1 ?? page.target_keyword, url: page.url_path }],
    spots, faqs: m.faqs(page.id),
  };
}

export interface HomeViewModel {
  page: Page | undefined;
  states: { name: string; url: string; summary: string | null; regions: { name: string; url: string; summary: string | null; spotCount: number; highlights: string[] }[] }[];
  encounters: LinkOut[];
  conservation: ExperienceCard[];
  spotCount: number;
}

export function homeView(m: Model): HomeViewModel {
  const page = m.page('/');
  const states = m.d.regions
    .filter(r => r.kind === 'state')
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap(st => {
      const sp = m.regionPage(st.id);
      if (!sp) return [];
      const rv = regionView(m, sp.url_path);
      return [{ name: st.name, url: sp.url_path, summary: st.summary, regions: rv?.childRegions ?? [] }];
    });
  return {
    page,
    states,
    encounters: m.d.pages.filter(p => p.page_type === 'encounter').map(p => ({ name: p.h1 ?? p.target_keyword, url: p.url_path })),
    conservation: m.d.experiences.filter(e => e.is_conservation).map(e => m.experienceCard(e)),
    spotCount: m.d.spots.filter(s => m.spotPage(s.id)).length,
  };
}
