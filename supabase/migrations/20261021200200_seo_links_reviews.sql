-- SEO/GEO page fields, internal link graph, first-party reviews.
--
-- Review stars in Google: per Google's review-snippet guidelines, ratings must be
-- collected from our own users, may not be aggregated from other websites (no Google
-- or TripAdvisor ratings in markup), and TouristAttraction is not an eligible type.
-- So: stars come only from first-party reviews of operators/experiences
-- (LocalBusiness/Product reviewed on a third-party site = eligible).
-- Google Places ratings may be SHOWN with attribution via google_place_id, never marked up.

alter table pages
  add column h1              text,
  add column h2_outline      jsonb not null default '[]'::jsonb,   -- ordered H2s, written as real queries
  add column og_image_url    text,
  add column schema_types    text[] not null default '{}',
  add column word_count      integer,
  add constraint title_length check (title is null or char_length(title) <= 65),
  add constraint meta_length  check (meta_description is null or char_length(meta_description) <= 160);

alter table spots         add column google_place_id text;
alter table organizations add column google_place_id text;

create type link_role as enum ('parent', 'child', 'sibling', 'related');

create table page_links (
  from_page_id  uuid not null references pages(id) on delete cascade,
  to_page_id    uuid not null references pages(id) on delete cascade,
  role          link_role not null,
  anchor_text   text not null,
  sort_order    smallint not null default 0,
  primary key (from_page_id, to_page_id),
  constraint no_self_link check (from_page_id <> to_page_id)
);
create index page_links_to_idx on page_links(to_page_id);

alter table page_links enable row level security;
create policy "public read links between published pages" on page_links
  for select to anon, authenticated
  using (exists (select 1 from pages p where p.id = from_page_id and p.status = 'published' and p.indexable)
     and exists (select 1 from pages p where p.id = to_page_id and p.status = 'published' and p.indexable));

-- first-party reviews (moderated)
create type review_status as enum ('pending', 'approved', 'rejected');

create table reviews (
  id                uuid primary key default gen_random_uuid(),
  experience_id     uuid references experiences(id) on delete cascade,
  organization_id   uuid references organizations(id) on delete cascade,
  spot_id           uuid references spots(id) on delete cascade,
  user_id           uuid references auth.users(id) on delete set null,
  rating            smallint not null check (rating between 1 and 5),
  title             text check (char_length(title) <= 120),
  body              text check (char_length(body) <= 4000),
  reviewer_name     text not null check (char_length(reviewer_name) <= 60),
  visited_month     date,
  status            review_status not null default 'pending',
  created_at        timestamptz not null default now(),
  constraint reviews_one_target check (num_nonnulls(experience_id, organization_id, spot_id) = 1)
);
create index reviews_experience_idx on reviews(experience_id);
create index reviews_organization_idx on reviews(organization_id);
create index reviews_spot_idx on reviews(spot_id);
create index reviews_user_idx on reviews(user_id);

alter table reviews enable row level security;
create policy "public read approved reviews" on reviews
  for select to anon, authenticated using (status = 'approved');
create policy "signed-in users submit their own pending review" on reviews
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

create view review_aggregates with (security_invoker = on) as
select
  coalesce(experience_id, organization_id, spot_id) as target_id,
  case when experience_id is not null then 'experience'
       when organization_id is not null then 'organization'
       else 'spot' end as target_type,
  round(avg(rating)::numeric, 1) as rating_value,
  count(*)                       as review_count
from reviews
where status = 'approved'
group by 1, 2;
