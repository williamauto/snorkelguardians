// Row shapes as stored in Supabase (only the columns the site reads).

export type EntryMethod = 'shore' | 'boat' | 'shore_or_boat';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Status = 'draft' | 'reviewed' | 'published' | 'archived';
export type AccessLabel = 'on_your_own' | 'fee_or_reservation' | 'boat_only' | 'guide_required';

export interface Region {
  id: string;
  parent_id: string | null;
  kind: 'state' | 'island' | 'city' | 'area';
  slug: string;
  path: string;
  name: string;
  summary: string | null;
  lat: number | null;
  lng: number | null;
  map_zoom: number | null;
  sort_order: number;
}

export interface Spot {
  id: string;
  region_id: string;
  slug: string;
  name: string;
  alt_names: string[];
  area_label: string | null;
  lat: number;
  lng: number;
  entry_method: EntryMethod;
  guide_required: boolean;
  reservation_required: boolean;
  entry_fee_usd: number | null;
  entry_fee_text: string | null;
  reservation_text: string | null;
  parking_text: string | null;
  hours_text: string | null;
  closed_weekdays: number[];
  getting_there_text: string | null;
  level: Level | null;
  depth_text: string | null;
  best_season_text: string | null;
  seasonal_warning: string | null;
  hazards_text: string | null;
  gear_text: string | null;
  protected_area_name: string | null;
  protected_area_type: string | null;
  rules_text: string | null;
  summary: string | null;
  answer_block: string | null;
  webcam_url: string | null;
  hero_image_url: string | null;
  status: Status;
  data_confidence: 'verified_official' | 'verified_secondary' | 'needs_verification';
  last_checked_at: string | null;
  updated_at: string;
}

export interface Species {
  id: string;
  slug: string;
  common_name: string;
  local_name: string | null;
  scientific_name: string | null;
  grp: string;
  protection_text: string | null;
  distance_rule: string | null;
  description: string | null;
}

export interface SpotSpecies {
  spot_id: string;
  species_id: string;
  odds: 'very_likely' | 'often' | 'seasonal' | 'occasional' | 'rare';
  season_text: string | null;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  kind: string;
  is_conservation_partner: boolean;
  website_url: string | null;
}

export interface Experience {
  id: string;
  slug: string;
  name: string;
  kind: string;
  is_conservation: boolean;
  organization_id: string | null;
  region_id: string;
  description: string | null;
  price_from_usd: number | null;
  price_text: string | null;
  donation_text: string | null;
  duration_text: string | null;
  season_text: string | null;
  min_age: number | null;
  group_size_text: string | null;
  meeting_point: string | null;
  booking_url: string | null;
  status: Status;
}

export interface SpotExperience {
  spot_id: string;
  experience_id: string;
  link_kind: 'goes_to' | 'nearby' | 'alternative';
}

export interface Page {
  id: string;
  page_type: 'home' | 'state' | 'region' | 'spot' | 'species' | 'encounter' | 'experience';
  url_path: string;
  region_id: string | null;
  spot_id: string | null;
  species_id: string | null;
  target_keyword: string;
  priority: number | null;
  title: string | null;
  meta_description: string | null;
  h1: string | null;
  h2_outline: string[];
  author: string | null;
  reviewer: string | null;
  indexable: boolean;
  status: Status;
  published_at: string | null;
  last_content_reviewed_at: string | null;
  og_image_url: string | null;
  updated_at: string;
}

export interface FaqItem {
  page_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface PageLink {
  from_page_id: string;
  to_page_id: string;
  role: 'parent' | 'child' | 'sibling' | 'related';
  anchor_text: string;
  sort_order: number;
}

export interface Source {
  spot_id: string | null;
  experience_id: string | null;
  url: string;
  title: string | null;
  publisher: string | null;
  is_official: boolean;
  accessed_on: string;
}

export interface SpotConditions {
  spot_id: string;
  fetched_at: string;
  water_temp_c: number | null;
  wave_height_m: number | null;
  air_temp_c: number | null;
  wind_kmh: number | null;
  precip_prob_pct: number | null;
  forecast: ForecastDay[] | null;
  source: string;
}

export interface ForecastDay {
  date: string;          // YYYY-MM-DD
  air_max_c?: number;
  wind_max_kmh?: number;
  precip_prob_pct?: number;
  wave_max_m?: number;
  summary?: string;
}

export type TourProvider = 'viator' | 'getyourguide';

/** A bookable tour listed on Viator or GetYourGuide. product_url has no affiliate params. */
export interface ProviderTour {
  id: string;
  provider: TourProvider;
  product_code: string;
  title: string;
  product_url: string;
  region_id: string;
  price_from_usd: number | null;
  price_basis: string | null;
  duration_text: string | null;
  rating: number | null;
  review_count: number | null;
  free_cancellation: boolean | null;
  image_url: string | null;
  status: Status;
  sort_order: number;
  fetched_at: string;
}

export interface SpotTour {
  spot_id: string;
  tour_id: string;
  link_kind: 'goes_to' | 'nearby' | 'alternative';
  sort_order: number;
}

export interface Dataset {
  regions: Region[];
  spots: Spot[];
  species: Species[];
  spotSpecies: SpotSpecies[];
  organizations: Organization[];
  experiences: Experience[];
  spotExperiences: SpotExperience[];
  pages: Page[];
  faqs: FaqItem[];
  links: PageLink[];
  sources: Source[];
  conditions: SpotConditions[];
  tours: ProviderTour[];
  spotTours: SpotTour[];
}
