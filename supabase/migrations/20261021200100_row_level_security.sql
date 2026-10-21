-- Row-level security.
-- Public (anon) can read taxonomy, and only published content.
-- Every write goes through the service role (content pipeline, admin). No anon/authenticated write policies.

alter table regions          enable row level security;
alter table spots            enable row level security;
alter table species          enable row level security;
alter table spot_species     enable row level security;
alter table organizations    enable row level security;
alter table experiences      enable row level security;
alter table spot_experiences enable row level security;
alter table pages            enable row level security;
alter table faq_items        enable row level security;
alter table sources          enable row level security;
alter table spot_conditions  enable row level security;

-- taxonomy: public
create policy "public read regions"       on regions       for select to anon, authenticated using (true);
create policy "public read species"       on species       for select to anon, authenticated using (true);
create policy "public read organizations" on organizations for select to anon, authenticated using (true);

-- content: published only
create policy "public read published spots" on spots
  for select to anon, authenticated using (status = 'published');

create policy "public read published experiences" on experiences
  for select to anon, authenticated using (status = 'published');

create policy "public read species of published spots" on spot_species
  for select to anon, authenticated
  using (exists (select 1 from spots s where s.id = spot_id and s.status = 'published'));

create policy "public read links between published rows" on spot_experiences
  for select to anon, authenticated
  using (exists (select 1 from spots s where s.id = spot_id and s.status = 'published')
     and exists (select 1 from experiences e where e.id = experience_id and e.status = 'published'));

create policy "public read published indexable pages" on pages
  for select to anon, authenticated using (status = 'published' and indexable);

create policy "public read faq of published pages" on faq_items
  for select to anon, authenticated
  using (exists (select 1 from pages p where p.id = page_id and p.status = 'published' and p.indexable));

create policy "public read sources of published content" on sources
  for select to anon, authenticated
  using (
    (spot_id is not null and exists (select 1 from spots s where s.id = spot_id and s.status = 'published'))
    or (experience_id is not null and exists (select 1 from experiences e where e.id = experience_id and e.status = 'published'))
    or species_id is not null
  );

create policy "public read conditions of published spots" on spot_conditions
  for select to anon, authenticated
  using (exists (select 1 from spots s where s.id = spot_id and s.status = 'published'));
