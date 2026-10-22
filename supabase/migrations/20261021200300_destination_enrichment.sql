-- Destination enrichment: highlights, wetsuit guidance, do/avoid etiquette, hero images.
--
-- Everything added here is additive and nullable, so existing rows keep working and
-- the site can render partial data while new content is still being verified.
--
-- Content rules for these columns:
--   highlights        - short, concrete things a snorkeler actually sees (not adjectives)
--   natural_features  - what the habitat is made of: coral, kelp, sand, rock, seagrass, mangrove
--   wetsuit_*         - gear advice in plain language, always with a temperature or season anchor
--   rules_do/avoid    - split from the existing prose rules_text so the UI can show a
--                       "do this / never do that" pair instead of a wall of text
--   hero_image_*      - the image and its attribution; images are derived from the
--                       licensed photo library, so the credit is kept next to the URL

-- ---------- regions ----------
alter table regions
  add column if not exists hero_image_url   text,
  add column if not exists hero_image_credit text,
  add column if not exists highlights        text[] not null default '{}',
  add column if not exists wetsuit_note      text,
  add column if not exists rules_do          text[] not null default '{}',
  add column if not exists rules_avoid       text[] not null default '{}';

comment on column regions.highlights is 'Short, concrete things a snorkeler sees in this destination.';
comment on column regions.hero_image_credit is 'Attribution for hero_image_url (derived from the licensed photo library).';

-- ---------- spots ----------
alter table spots
  add column if not exists highlights            text[] not null default '{}',
  add column if not exists natural_features      text,
  add column if not exists wetsuit_recommendation text,
  add column if not exists water_temp_note        text,
  add column if not exists rules_do               text[] not null default '{}',
  add column if not exists rules_avoid            text[] not null default '{}',
  add column if not exists hero_image_credit      text,
  add column if not exists conservation_note      text;

comment on column spots.wetsuit_recommendation is 'Gear advice for this spot, e.g. "3mm full suit; water holds 68-72F (20-22C) from November to March."';
comment on column spots.rules_do is 'Short do-this rules shown in the etiquette panel.';
comment on column spots.rules_avoid is 'Short never-do rules shown in the etiquette panel.';
comment on column spots.hero_image_credit is 'Attribution for hero_image_url (derived from the licensed photo library).';

-- ---------- spot cards view: surface the new summary fields ----------
create or replace view spot_cards with (security_invoker = on) as
select
  s.id, s.slug, s.name, s.area_label, s.lat, s.lng, s.level, s.summary,
  s.entry_method, s.guide_required, s.reservation_required, s.entry_fee_usd, s.entry_fee_text,
  s.closed_weekdays, s.best_season_text, s.status,
  public.spot_access_label(s) as access_label,
  r.path as region_path, r.name as region_name,
  '/' || r.path || '/' || s.slug || '/' as url_path,
  c.water_temp_c, c.fetched_at as conditions_fetched_at,
  s.highlights, s.wetsuit_recommendation, s.natural_features
from spots s
join regions r on r.id = s.region_id
left join spot_conditions c on c.spot_id = s.id;
