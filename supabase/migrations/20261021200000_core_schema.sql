-- Snorkel Guardians: core schema
-- Regions -> spots -> species / experiences / pages, plus a conditions cache.
-- Content rows are never public until status = 'published'.

create extension if not exists pgcrypto;

-- ---------- enums ----------
create type region_kind      as enum ('state', 'island', 'city', 'area');
create type entry_method     as enum ('shore', 'boat', 'shore_or_boat');
create type skill_level      as enum ('beginner', 'intermediate', 'advanced');
create type content_status   as enum ('draft', 'reviewed', 'published', 'archived');
create type data_confidence  as enum ('verified_official', 'verified_secondary', 'needs_verification');
create type species_group    as enum ('turtle', 'marine_mammal', 'shark_ray', 'fish', 'invertebrate', 'coral', 'algae');
create type sighting_odds    as enum ('very_likely', 'often', 'seasonal', 'occasional', 'rare');
create type org_kind         as enum ('nonprofit', 'government', 'research', 'operator', 'community');
create type experience_kind  as enum ('coral_restoration', 'turtle_nesting', 'hatchling_release', 'reef_survey',
                                      'reef_education', 'guided_snorkel', 'boat_snorkel', 'kayak_snorkel',
                                      'night_snorkel', 'shuttle_entry', 'gear_rental', 'beach_cleanup');
create type spot_link_kind   as enum ('goes_to', 'nearby', 'alternative');
create type page_type        as enum ('home', 'state', 'region', 'spot', 'species', 'encounter', 'experience');

-- ---------- shared trigger ----------
create or replace function set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------- regions (state > island/city) ----------
create table regions (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references regions(id) on delete restrict,
  kind        region_kind not null,
  slug        text not null,
  path        text not null unique,          -- e.g. 'hawaii/oahu', used in URLs
  name        text not null,
  summary     text,
  lat         double precision,
  lng         double precision,
  map_zoom    smallint,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (parent_id, slug)
);
create index regions_parent_idx on regions(parent_id);

-- ---------- spots: one named snorkel spot ----------
create table spots (
  id                    uuid primary key default gen_random_uuid(),
  region_id             uuid not null references regions(id) on delete restrict,
  slug                  text not null,
  name                  text not null,
  alt_names             text[] not null default '{}',
  area_label            text,                         -- 'North Shore', 'South Maui'
  lat                   double precision not null,
  lng                   double precision not null,
  conditions_lat        double precision,             -- offshore point for the marine API
  conditions_lng        double precision,

  -- how you get in (drives the access label)
  entry_method          entry_method not null,
  guide_required        boolean not null default false,
  reservation_required  boolean not null default false,
  entry_fee_usd         numeric(8,2),                 -- adult non-resident, null = free/unknown
  entry_fee_text        text,
  reservation_text      text,
  parking_text          text,
  hours_text            text,
  closed_weekdays       smallint[] not null default '{}',  -- 0 = Sunday ... 6 = Saturday
  getting_there_text    text,

  -- the water
  level                 skill_level,
  depth_text            text,
  best_season_text      text,
  seasonal_warning      text,
  hazards_text          text,
  gear_text             text,
  protected_area_name   text,
  protected_area_type   text,                         -- MLCD, SMR, SMCA, NAR, National Park ...
  rules_text            text,

  -- content
  summary               text,                         -- one line for cards and map panel
  answer_block          text,                         -- 134-167 word AEO intro
  webcam_url            text,
  hero_image_url        text,

  status                content_status not null default 'draft',
  data_confidence       data_confidence not null default 'needs_verification',
  last_checked_at       date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (region_id, slug),
  constraint closed_weekdays_range check (closed_weekdays <@ array[0,1,2,3,4,5,6]::smallint[])
);
create index spots_region_idx on spots(region_id);
create index spots_status_idx on spots(status);

-- ---------- species ----------
create table species (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  common_name      text not null,
  local_name       text,                 -- e.g. honu, humuhumunukunukuapuaa
  scientific_name  text,
  grp              species_group not null,
  protection_text  text,                 -- ESA / state status in plain words
  distance_rule    text,                 -- the one rule that matters most
  description      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table spot_species (
  spot_id      uuid not null references spots(id) on delete cascade,
  species_id   uuid not null references species(id) on delete cascade,
  odds         sighting_odds not null default 'often',
  season_text  text,
  notes        text,
  primary key (spot_id, species_id)
);
create index spot_species_species_idx on spot_species(species_id);

-- ---------- organizations (conservation partners, operators, agencies) ----------
create table organizations (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique,
  name                     text not null,
  kind                     org_kind not null,
  is_conservation_partner  boolean not null default false,
  website_url              text,
  region_id                uuid references regions(id) on delete set null,
  description              text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index organizations_region_idx on organizations(region_id);

-- ---------- experiences (bookable or joinable) ----------
create table experiences (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  kind               experience_kind not null,
  is_conservation    boolean not null default false,
  organization_id    uuid references organizations(id) on delete set null,
  region_id          uuid not null references regions(id) on delete restrict,
  description        text,
  price_from_usd     numeric(8,2),
  price_text         text,
  donation_text      text,                -- where the money goes
  duration_text      text,
  season_text        text,
  min_age            smallint,
  group_size_text    text,
  meeting_point      text,
  booking_url        text,
  affiliate_network  text,                -- direct | viator | getyourguide | travelpayouts
  affiliate_ref      text,
  status             content_status not null default 'draft',
  data_confidence    data_confidence not null default 'needs_verification',
  last_checked_at    date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index experiences_org_idx on experiences(organization_id);
create index experiences_region_idx on experiences(region_id);
create index experiences_status_idx on experiences(status);

create table spot_experiences (
  spot_id        uuid not null references spots(id) on delete cascade,
  experience_id  uuid not null references experiences(id) on delete cascade,
  link_kind      spot_link_kind not null default 'goes_to',
  primary key (spot_id, experience_id)
);
create index spot_experiences_exp_idx on spot_experiences(experience_id);

-- ---------- pages: the programmatic content queue ----------
create table pages (
  id                        uuid primary key default gen_random_uuid(),
  page_type                 page_type not null,
  url_path                  text not null unique,      -- '/hawaii/oahu/hanauma-bay/'
  region_id                 uuid references regions(id) on delete set null,
  spot_id                   uuid references spots(id) on delete set null,
  species_id                uuid references species(id) on delete set null,
  experience_id             uuid references experiences(id) on delete set null,
  target_keyword            text not null unique,      -- one primary keyword per page (playbook 12.5)
  secondary_keywords        text[] not null default '{}',
  search_volume             integer,
  keyword_difficulty        smallint,
  keyword_data_source       text,                      -- semrush | serp_directional
  priority                  smallint,
  title                     text,
  meta_description          text,
  author                    text,
  reviewer                  text,
  unique_content_pct        numeric(5,2),
  aeo_answer_ready          boolean not null default false,
  indexable                 boolean not null default false,
  status                    content_status not null default 'draft',
  published_at              timestamptz,
  last_content_reviewed_at  timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index pages_region_idx on pages(region_id);
create index pages_spot_idx on pages(spot_id);
create index pages_species_idx on pages(species_id);
create index pages_experience_idx on pages(experience_id);
create index pages_status_idx on pages(status);

create table faq_items (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references pages(id) on delete cascade,
  question    text not null,
  answer      text not null,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index faq_items_page_idx on faq_items(page_id);

-- ---------- sources: citation trail (E-E-A-T) ----------
create table sources (
  id           uuid primary key default gen_random_uuid(),
  spot_id      uuid references spots(id) on delete cascade,
  experience_id uuid references experiences(id) on delete cascade,
  species_id   uuid references species(id) on delete cascade,
  url          text not null,
  title        text,
  publisher    text,
  is_official  boolean not null default false,
  accessed_on  date not null default current_date,
  notes        text,
  created_at   timestamptz not null default now(),
  constraint sources_one_owner check (num_nonnulls(spot_id, experience_id, species_id) = 1)
);
create index sources_spot_idx on sources(spot_id);
create index sources_experience_idx on sources(experience_id);
create index sources_species_idx on sources(species_id);

-- ---------- live conditions cache (written by a scheduled job) ----------
create table spot_conditions (
  spot_id          uuid primary key references spots(id) on delete cascade,
  fetched_at       timestamptz not null,
  water_temp_c     numeric(4,1),
  wave_height_m    numeric(4,2),
  swell_period_s   numeric(4,1),
  air_temp_c       numeric(4,1),
  wind_kmh         numeric(5,1),
  precip_prob_pct  smallint,
  forecast         jsonb,           -- 7-day daily array from Open-Meteo
  source           text not null default 'open-meteo (CC BY 4.0)'
);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['regions','spots','species','organizations','experiences','pages','faq_items'] loop
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- derived access label + card view ----------
create or replace function spot_access_label(s spots) returns text
language sql immutable set search_path = '' as $$
  select case
    when s.guide_required                                  then 'guide_required'
    when s.entry_method = 'boat'                            then 'boat_only'
    when s.reservation_required or coalesce(s.entry_fee_usd, 0) > 0 then 'fee_or_reservation'
    else 'on_your_own'
  end
$$;

create view spot_cards with (security_invoker = on) as
select
  s.id, s.slug, s.name, s.area_label, s.lat, s.lng, s.level, s.summary,
  s.entry_method, s.guide_required, s.reservation_required, s.entry_fee_usd, s.entry_fee_text,
  s.closed_weekdays, s.best_season_text, s.status,
  public.spot_access_label(s) as access_label,
  r.path as region_path, r.name as region_name,
  '/' || r.path || '/' || s.slug || '/' as url_path,
  c.water_temp_c, c.fetched_at as conditions_fetched_at
from spots s
join regions r on r.id = s.region_id
left join spot_conditions c on c.spot_id = s.id;
