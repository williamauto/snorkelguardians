-- Nearby tours from Viator / GetYourGuide, plus the admin role and the
-- review/publish workflow used by /admin.
--
-- Affiliate rule: product_url is the CLEAN product page (no partner params).
-- The site appends our own affiliate IDs from environment variables at render time.
-- Ratings are the provider's, shown with attribution ("on Viator") and NEVER put
-- into schema.org markup.

create type tour_provider as enum ('viator', 'getyourguide');

create table provider_tours (
  id               uuid primary key default gen_random_uuid(),
  provider         tour_provider not null,
  product_code     text not null,
  title            text not null,
  product_url      text not null
                   check (product_url ~ '^https://www\.(viator|getyourguide)\.com/'
                          and product_url !~ '[?&](pid|mcid|partner_id|visitor_id)='),
  region_id        uuid not null references regions(id),
  price_from_usd   numeric(8,2),
  price_basis      text,                       -- 'per person', 'per group up to 2'
  duration_text    text,
  rating           numeric(3,2) check (rating between 0 and 5),
  review_count     integer check (review_count >= 0),
  free_cancellation boolean,
  image_url        text,
  status           content_status not null default 'draft',
  admin_note       text,
  sort_order       integer not null default 100,
  fetched_at       timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (provider, product_code)
);
create index provider_tours_region_idx on provider_tours (region_id, status);
create trigger provider_tours_updated_at before update on provider_tours
  for each row execute function set_updated_at();

create table spot_tours (
  spot_id    uuid not null references spots(id) on delete cascade,
  tour_id    uuid not null references provider_tours(id) on delete cascade,
  link_kind  spot_link_kind not null default 'goes_to',
  sort_order integer not null default 100,
  primary key (spot_id, tour_id)
);
create index spot_tours_tour_idx on spot_tours (tour_id);

-- ---------- admins ----------

create table admins (
  email      text primary key check (email = lower(email)),
  added_at   timestamptz not null default now()
);
alter table admins enable row level security;
-- no policies: only readable through is_admin()

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated;

-- ---------- review log ----------

create table review_log (
  id          bigint generated always as identity primary key,
  entity      text not null check (entity in ('spot','page','experience','tour')),
  entity_id   uuid not null,
  action      text not null,
  note        text,
  actor_email text not null default lower(coalesce(auth.jwt() ->> 'email', 'system')),
  created_at  timestamptz not null default now()
);
create index review_log_entity_idx on review_log (entity, entity_id, created_at desc);
alter table review_log enable row level security;
create policy review_log_admin_read on review_log for select to authenticated using (is_admin());

-- ---------- RLS: public ----------

alter table provider_tours enable row level security;
alter table spot_tours enable row level security;

create policy provider_tours_public_read on provider_tours
  for select to anon, authenticated using (status = 'published');
create policy spot_tours_public_read on spot_tours
  for select to anon, authenticated using (
    exists (select 1 from provider_tours t where t.id = tour_id and t.status = 'published')
    and exists (select 1 from spots s where s.id = spot_id and s.status = 'published'));

-- ---------- RLS: admins see everything and can edit content ----------

create policy spots_admin_read        on spots          for select to authenticated using (is_admin());
create policy spots_admin_update      on spots          for update to authenticated using (is_admin()) with check (is_admin());
create policy pages_admin_read        on pages          for select to authenticated using (is_admin());
create policy pages_admin_update      on pages          for update to authenticated using (is_admin()) with check (is_admin());
create policy experiences_admin_read  on experiences    for select to authenticated using (is_admin());
create policy experiences_admin_update on experiences   for update to authenticated using (is_admin()) with check (is_admin());
create policy tours_admin_read        on provider_tours for select to authenticated using (is_admin());
create policy tours_admin_update      on provider_tours for update to authenticated using (is_admin()) with check (is_admin());
create policy spot_tours_admin_read   on spot_tours     for select to authenticated using (is_admin());
create policy spot_tours_admin_write  on spot_tours     for all    to authenticated using (is_admin()) with check (is_admin());
create policy faq_admin_read          on faq_items      for select to authenticated using (is_admin());
create policy faq_admin_write         on faq_items      for all    to authenticated using (is_admin()) with check (is_admin());
create policy sources_admin_read      on sources        for select to authenticated using (is_admin());
create policy sources_admin_write     on sources        for all    to authenticated using (is_admin()) with check (is_admin());
create policy spot_exp_admin_read     on spot_experiences for select to authenticated using (is_admin());
create policy spot_species_admin_read on spot_species   for select to authenticated using (is_admin());
create policy page_links_admin_read   on page_links     for select to authenticated using (is_admin());

-- ---------- workflow functions (called from /admin) ----------

-- Mark a spot's facts as checked.
create or replace function admin_verify_spot(p_spot uuid, p_confidence data_confidence, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  update spots set data_confidence = p_confidence, last_checked_at = current_date where id = p_spot;
  if not found then raise exception 'spot not found'; end if;
  insert into review_log (entity, entity_id, action, note) values ('spot', p_spot, 'verify:' || p_confidence, p_note);
end $$;

-- Publish a spot and its page. Also publishes the parent island, state and home
-- pages if they aren't live yet, so breadcrumbs and internal links resolve.
create or replace function admin_publish_spot(p_spot uuid, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  s spots;
  r regions;
begin
  if not is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  select * into s from spots where id = p_spot;
  if not found then raise exception 'spot not found'; end if;
  if s.data_confidence = 'needs_verification' then
    raise exception 'verify this spot before publishing' using errcode = 'P0001';
  end if;

  update spots set status = 'published' where id = p_spot;
  update pages set status = 'published', indexable = true,
                   published_at = coalesce(published_at, now()),
                   last_content_reviewed_at = current_date
   where spot_id = p_spot;

  -- parents: island/city region, then state, then home
  select * into r from regions where id = s.region_id;
  while r.id is not null loop
    update pages set status = 'published', indexable = true,
                     published_at = coalesce(published_at, now()),
                     last_content_reviewed_at = coalesce(last_content_reviewed_at, current_date)
     where region_id = r.id and page_type in ('region','state') and status <> 'published';
    exit when r.parent_id is null;
    select * into r from regions where id = r.parent_id;
  end loop;
  update pages set status = 'published', indexable = true, published_at = coalesce(published_at, now())
   where page_type = 'home' and status <> 'published';

  insert into review_log (entity, entity_id, action, note) values ('spot', p_spot, 'publish', p_note);
end $$;

create or replace function admin_unpublish_spot(p_spot uuid, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  update spots set status = 'reviewed' where id = p_spot;
  update pages set status = 'reviewed' where spot_id = p_spot;
  insert into review_log (entity, entity_id, action, note) values ('spot', p_spot, 'unpublish', p_note);
end $$;

-- Publish any non-spot page (encounter hubs, about pages...).
create or replace function admin_set_page_status(p_page uuid, p_status content_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  update pages set status = p_status,
                   indexable = case when p_status = 'published' then true else indexable end,
                   published_at = case when p_status = 'published' then coalesce(published_at, now()) else published_at end,
                   last_content_reviewed_at = case when p_status = 'published' then current_date else last_content_reviewed_at end
   where id = p_page;
  insert into review_log (entity, entity_id, action, note) values ('page', p_page, 'status:' || p_status, p_note);
end $$;

create or replace function admin_set_tour_status(p_tour uuid, p_status content_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  update provider_tours set status = p_status, admin_note = coalesce(p_note, admin_note) where id = p_tour;
  insert into review_log (entity, entity_id, action, note) values ('tour', p_tour, 'status:' || p_status, p_note);
end $$;

create or replace function admin_set_experience_status(p_exp uuid, p_status content_status, p_confidence data_confidence default null, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  update experiences set status = p_status,
                         data_confidence = coalesce(p_confidence, data_confidence),
                         last_checked_at = case when p_confidence is not null then current_date else last_checked_at end
   where id = p_exp;
  insert into review_log (entity, entity_id, action, note) values ('experience', p_exp, 'status:' || p_status, p_note);
end $$;

revoke all on function admin_verify_spot(uuid, data_confidence, text), admin_publish_spot(uuid, text),
  admin_unpublish_spot(uuid, text), admin_set_page_status(uuid, content_status, text),
  admin_set_tour_status(uuid, content_status, text),
  admin_set_experience_status(uuid, content_status, data_confidence, text) from public, anon;
grant execute on function admin_verify_spot(uuid, data_confidence, text), admin_publish_spot(uuid, text),
  admin_unpublish_spot(uuid, text), admin_set_page_status(uuid, content_status, text),
  admin_set_tour_status(uuid, content_status, text),
  admin_set_experience_status(uuid, content_status, data_confidence, text) to authenticated;
