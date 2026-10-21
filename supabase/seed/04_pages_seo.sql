-- Pages: SEO/GEO metadata, H2 outlines (written as real search questions), FAQs, internal links.
-- All pages start as draft + not indexable; publishing is a human decision.

-- ---------- spot pages ----------
insert into pages (page_type, url_path, region_id, spot_id, target_keyword, secondary_keywords, search_volume, keyword_difficulty,
                   keyword_data_source, priority, title, meta_description)
select 'spot', '/' || r.path || '/' || s.slug || '/', r.id, s.id, v.kw, v.sec::text[], v.vol, v.kd, v.src, v.prio, v.title, v.meta
from (values
 ('hanauma-bay','hanauma bay snorkeling','{"hanauma bay reservation","hanauma bay snorkeling tour","hanauma bay hours","hanauma bay entry fee"}',null,null,null,1,
  'Hanauma Bay Snorkeling Guide 2026: Reservations, Fees & Tips',
  'Snorkel Hanauma Bay on your own: book 2 days ahead at 7 a.m. HST, $25 non-resident entry, closed Mon–Tue. Turtles, 400+ fish, live water temp.'),
 ('sharks-cove','sharks cove oahu','{"sharks cove snorkeling","pupukea snorkeling","sharks cove winter"}',6600,1,'semrush',1,
  'Sharks Cove Oahu Snorkeling: When It''s Safe & What You''ll See',
  'Free shore snorkel on Oahu''s North Shore: lava arches, tide pools and turtles. Calm only in summer; winter surf makes it dangerous.'),
 ('kuilima-cove','kuilima cove snorkeling','{"turtle bay snorkeling"}',null,null,null,3,
  'Kuilima Cove Snorkeling at Turtle Bay: Calm Beginner Spot',
  'A reef-sheltered cove at Turtle Bay on Oahu''s North Shore: free, shallow and calm for beginners. Parking, conditions and tips.'),
 ('electric-beach','electric beach snorkeling','{"kahe point snorkeling"}',null,null,null,3,
  'Electric Beach Snorkeling (Kahe Point): Fish, Turtles & Safety',
  'Advanced shore snorkel on Oahu''s west side: huge fish schools and turtles at the outflow pipes, but strong currents. How to go safely.'),
 ('ko-olina-lagoons','ko olina lagoon snorkeling','{"ko olina snorkeling","family snorkeling oahu"}',null,null,null,2,
  'Ko Olina Lagoons Snorkeling: Easy, Calm Spot for Kids',
  'Four calm, free lagoons on Oahu''s west side, ideal for first-time snorkelers and families. Public parking tips and what you''ll see.'),
 ('turtle-canyon','turtle canyon snorkel','{"turtle canyon waikiki","snorkel with turtles waikiki"}',null,null,null,2,
  'Turtle Canyon Snorkel Tours from Waikiki: What to Expect',
  'Turtle Canyon is a boat-only reef off Waikiki where green sea turtles visit a cleaning station. Compare tours, rules and the best time.'),
 ('maunalua-bay','maunalua bay snorkeling','{"maunalua bay turtle tour"}',null,null,null,3,
  'Maunalua Bay Snorkeling: Turtle Tours East of Diamond Head',
  'Snorkel with green sea turtles in Maunalua Bay by small boat, with daily sightings and few crowds. Tours, conditions and turtle rules.'),
 ('molokini-crater','molokini crater snorkeling','{"molokini snorkel tour","molokini crater"}',null,null,null,1,
  'Molokini Crater Snorkeling: Tours, Visibility & Rules',
  'Molokini is a boat-only marine reserve off South Maui with some of Hawaii''s clearest water. Compare snorkel tours, best times and rules.'),
 ('honolua-bay','honolua bay snorkeling','{"honolua bay parking"}',null,null,null,2,
  'Honolua Bay Snorkeling: Best Season, Parking & Reef Guide',
  'Free shore snorkel in West Maui''s Honolua Bay marine reserve: coral, turtles and clear water on calm summer days. Parking and safety tips.'),
 ('black-rock','black rock snorkeling maui','{"black rock kaanapali","kaanapali snorkeling"}',null,null,null,2,
  'Black Rock Maui Snorkeling at Kaanapali Beach: Easy Turtles',
  'Snorkel the lava point at the north end of Kaanapali Beach: turtles, reef fish and an easy sand entry. Parking, conditions and current tips.'),
 ('kapalua-bay','kapalua bay snorkeling','{"west maui snorkeling"}',null,null,null,3,
  'Kapalua Bay Snorkeling: Calm Family Reef in West Maui',
  'A sheltered crescent bay with reef on both points, one of West Maui''s easiest snorkels. Free access, parking tips and eco tours.'),
 ('olowalu','olowalu snorkeling','{"olowalu reef","mile marker 14 snorkeling"}',null,null,null,3,
  'Olowalu Reef Snorkeling: Turtles on Maui''s Oldest Reef',
  'Shore snorkel at mile marker 14 on one of Maui''s oldest reefs, with turtles and coral heads. Visibility tips and biologist-guided tours.'),
 ('ahihi-kinau','ahihi kinau snorkeling','{"ahihi cove","ahihi kinau parking fee"}',null,null,null,2,
  'Ahihi-Kinau Snorkeling: Hours, $5 Fee & Reef Tips',
  'South Maui''s lava-fringed reserve: dense coral, turtles and clear coves. Open 5:30 a.m.–7:30 p.m., $5 non-resident vehicle fee.'),
 ('maluaka-turtle-town','turtle town maui snorkeling','{"maluaka beach snorkeling","turtle town maui"}',null,null,null,2,
  'Turtle Town Maui Snorkeling at Maluaka Beach: Shore or Boat',
  'Snorkel with green sea turtles at Turtle Town in Makena, from the beach at Maluaka or by boat. Free parking, best time and turtle rules.'),
 ('kealakekua-bay','kealakekua bay snorkeling','{"captain cook monument snorkeling","kealakekua bay kayak tour"}',null,null,null,1,
  'Kealakekua Bay Snorkeling: Captain Cook Monument Guide',
  'Snorkel below the Captain Cook Monument: reach it by steep hike, permitted kayak tour or boat. Permits, hours and dolphin etiquette.'),
 ('two-step','two step snorkeling big island','{"honaunau bay snorkeling","two step hawaii"}',null,null,null,1,
  'Two Step Snorkeling at Honaunau Bay: Big Island Guide',
  'Lava steps lead straight into a clear coral garden next to Puuhonua o Honaunau. Free entry, parking etiquette, turtles and dolphins.'),
 ('kahaluu-beach-park','kahaluu beach snorkeling','{"kahaluu bay","kona snorkeling beginners"}',null,null,null,2,
  'Kahaluu Beach Park Snorkeling: Turtles in a Calm Kona Bay',
  'Kona''s easiest snorkel: a shallow, reef-protected bay with turtles almost daily and Reef Teach volunteers. Parking, rip current and tips.'),
 ('kona-manta-night-snorkel','manta ray night snorkel kona','{"manta ray snorkel hawaii","kona manta ray tour"}',null,null,null,1,
  'Manta Ray Night Snorkel in Kona: How It Works & Tours',
  'Float above reef manta rays feeding under lights off Keauhou, Kona. Boat tours only. What to expect, manta-safe rules and choosing a tour.'),
 ('waialea-bay','beach 69 snorkeling','{"waialea bay snorkeling"}',null,null,null,3,
  'Beach 69 Snorkeling (Waialea Bay): Kohala Coast Guide',
  'A shaded Kohala Coast beach with coral and turtles close to shore, calmest in the morning. Access, conditions and what you''ll see.'),
 ('la-jolla-cove','la jolla cove snorkeling','{"la jolla underwater park","la jolla snorkeling"}',null,null,null,1,
  'La Jolla Cove Snorkeling: Garibaldi, Sea Lions & Kelp',
  'Snorkel the San Diego-La Jolla Underwater Park from a sandy cove: orange garibaldi, kelp and sea lions. Wetsuit tips, parking, conditions.'),
 ('la-jolla-shores-leopard-sharks','la jolla shores snorkeling','{"snorkel with leopard sharks","leopard shark season la jolla"}',null,null,null,1,
  'La Jolla Shores Snorkeling: Swim with Leopard Sharks',
  'Harmless leopard sharks gather off the south end of La Jolla Shores in summer. Easy beach entry, best months, tours and shark-safe rules.'),
 ('la-jolla-sea-caves','la jolla sea caves kayak','{"la jolla kayak snorkel tour"}',null,null,null,2,
  'La Jolla Sea Caves Kayak & Snorkel: Tour Guide',
  'See the seven La Jolla sea caves by guided kayak with a snorkel stop. When to go, what you''ll see in the marine reserve and how to book.'),
 ('lovers-cove','lovers cove catalina snorkeling','{"catalina snorkeling avalon"}',null,null,null,1,
  'Lovers Cove Catalina Snorkeling: Garibaldi in Avalon',
  'A free shore snorkel just east of Avalon in a marine conservation area: garibaldi, kelp bass and clear water. Ferry, wetsuit and gear tips.'),
 ('casino-point-dive-park','casino point snorkeling','{"avalon underwater park"}',null,null,null,2,
  'Casino Point Dive Park Snorkeling: Avalon, Catalina',
  'Stairs lead straight into a kelp forest at Avalon''s underwater park: garibaldi, horn sharks and a small wreck. Rentals, rules and safety.'),
 ('descanso-beach','descanso beach snorkeling','{"descanso beach club catalina"}',null,null,null,3,
  'Descanso Beach Snorkeling on Catalina Island',
  'A pebbly beach-club cove next to the Avalon Casino with fish along the rocks and the occasional sea lion. Access, costs and what to expect.'),
 ('biscayne-national-park','biscayne national park snorkeling','{"biscayne national park snorkel tour","maritime heritage trail snorkeling"}',3600,1,'semrush',1,
  'Biscayne National Park Snorkeling: Reefs, Wrecks & Tours',
  'Biscayne''s coral reefs and wrecks are boat-only. Guided snorkel trips from $209 leave Homestead. What you''ll see and best conditions.'),
 ('emerald-reef','emerald reef key biscayne','{"emerald reef snorkeling"}',null,null,null,3,
  'Emerald Reef Snorkeling off Key Biscayne, Miami',
  'A shallow patch reef (10–20 ft) a mile off Key Biscayne with coral, spadefish and dolphins. Reach it by boat; safety and best conditions.'),
 ('bill-baggs-cape-florida','bill baggs snorkeling','{"key biscayne snorkeling"}',null,null,null,2,
  'Bill Baggs Cape Florida Snorkeling: Easy Key Biscayne Beach',
  'Easy shore snorkeling at Bill Baggs Cape Florida State Park on Key Biscayne: $8 per vehicle, open 8 a.m. to sunset. Conditions and tips.'),
 ('reefline-miami-beach','reefline miami beach','{"miami beach underwater sculpture park"}',null,null,null,3,
  'The ReefLine Miami Beach: Underwater Sculpture Snorkel',
  'The ReefLine is a planned 7-mile underwater sculpture park and coral reef off Miami Beach. What''s built, how to visit, how it helps coral.')
) as v(slug, kw, sec, vol, kd, src, prio, title, meta)
join spots s on s.slug = v.slug
join regions r on r.id = s.region_id
on conflict (url_path) do nothing;

-- ---------- region, state, encounter, home pages ----------
insert into pages (page_type, url_path, region_id, species_id, target_keyword, secondary_keywords, search_volume, keyword_difficulty,
                   keyword_data_source, priority, title, meta_description, h1)
select v.ptype::page_type, v.path, r.id, sp.id, v.kw, v.sec::text[], v.vol, v.kd, v.src, v.prio, v.title, v.meta, v.h1
from (values
 ('home','/',null,null,'snorkeling guide','{"best snorkeling spots","snorkel spots near me","reef conservation trips"}',null,null,null,1,
  'Snorkel Guardians: Snorkel Spots Guide & Reef Conservation',
  'Honest guides to the best snorkel spots in Hawaii, California and Florida: can you go on your own, what it costs, what you''ll see, who protects it.',
  'Put your face in the water. The reef will do the rest.'),
 ('state','/hawaii/','hawaii',null,'snorkeling hawaii','{"best snorkeling in hawaii","hawaii snorkel spots"}',null,null,null,1,
  'Snorkeling in Hawaii: Best Spots on Oahu, Maui & Big Island',
  'Hawaii snorkel guide: 19 spots across Oahu, Maui and the Big Island, with access, fees, turtles and live water temperature for each.',
  'Snorkeling in Hawaii: the best spots on Oahu, Maui and the Big Island'),
 ('state','/california/','california',null,'snorkeling southern california','{"best snorkeling in california"}',null,null,null,2,
  'Snorkeling in Southern California: La Jolla & Catalina',
  'Where to snorkel in Southern California: La Jolla''s underwater park, leopard sharks in summer and Catalina''s kelp forests off Avalon.',
  'Snorkeling in Southern California: La Jolla and Catalina Island'),
 ('state','/florida/','florida',null,'snorkeling florida','{"best snorkeling in florida"}',null,null,null,2,
  'Snorkeling in Florida: Reefs, Springs & Conservation Trips',
  'Florida snorkel guide: Biscayne National Park reefs, Key Biscayne beaches and coral restoration trips you can join. Map, tours and tips.',
  'Snorkeling in Florida: reefs, wrecks and the people restoring them'),
 ('region','/hawaii/oahu/','hawaii/oahu',null,'snorkeling oahu','{"best snorkeling oahu","oahu snorkeling spots","snorkeling oahu without a tour"}',6600,0,'semrush',1,
  'Best Snorkeling in Oahu: 7 Spots, Map & Live Conditions',
  'Where to snorkel on Oahu, from free shore coves to Hanauma Bay and turtle boats. Map, fees, beginner spots and live water temperature.',
  'Snorkeling in Oahu: 7 spots, from shore coves to turtle boats'),
 ('region','/hawaii/maui/','hawaii/maui',null,'snorkeling maui','{"best snorkeling maui","maui snorkeling spots"}',null,null,null,1,
  'Best Snorkeling in Maui: 7 Spots from Molokini to Makena',
  'Maui snorkel spots on one map: Molokini by boat, plus free reef coves from Kapalua to Ahihi-Kinau. Fees, turtles, beginner picks, tours.',
  'Snorkeling in Maui: 7 spots from Molokini Crater to Makena'),
 ('region','/hawaii/big-island/','hawaii/big-island',null,'snorkeling big island','{"best snorkeling big island","kona snorkeling"}',null,null,null,1,
  'Best Snorkeling on the Big Island: 5 Kona Spots & Mantas',
  'Big Island snorkeling: Captain Cook Monument, Two Step, Kahaluu and the manta ray night snorkel. Access, permits, turtles and tours.',
  'Snorkeling on the Big Island: Kona coves, Captain Cook and manta rays'),
 ('region','/california/san-diego/','california/san-diego',null,'snorkeling san diego','{"la jolla snorkeling","best snorkeling san diego"}',null,null,null,1,
  'Snorkeling in San Diego: La Jolla Cove, Shores & Sea Caves',
  'Snorkel La Jolla''s underwater park: garibaldi at the Cove, leopard sharks off the Shores in summer, and sea caves by kayak. Map and tips.',
  'Snorkeling in San Diego: La Jolla Cove, La Jolla Shores and the sea caves'),
 ('region','/california/catalina-island/','california/catalina-island',null,'snorkeling catalina island','{"catalina island snorkeling avalon"}',null,null,null,1,
  'Snorkeling Catalina Island: Avalon Spots, Kelp & Garibaldi',
  'Catalina snorkeling from Avalon: Lovers Cove, Casino Point and Descanso Beach. Ferry, gear rental, wetsuit tips and marine reserve rules.',
  'Snorkeling Catalina Island: 3 spots a short walk from Avalon'),
 ('region','/florida/miami/','florida/miami',null,'snorkeling miami','{"best snorkeling miami","miami snorkeling tours"}',2900,8,'semrush',1,
  'Snorkeling in Miami: Biscayne Reefs, Key Biscayne & More',
  'Where to snorkel near Miami: Biscayne National Park reefs by boat, Emerald Reef and easy Key Biscayne beaches. Map, tours and conditions.',
  'Snorkeling in Miami: Biscayne reefs, Key Biscayne and the ReefLine'),
 ('encounter','/encounters/snorkel-with-turtles-hawaii/','hawaii','green-sea-turtle','snorkel with turtles hawaii','{"where to snorkel with turtles in hawaii","honu snorkeling"}',null,null,null,1,
  'Snorkel with Turtles in Hawaii: Best Spots & Honu Rules',
  'Where to snorkel with green sea turtles on Oahu, Maui and the Big Island, from shore or boat, and the 10-foot rule that keeps honu safe.',
  'Snorkel with sea turtles in Hawaii: where to go and how to do it right'),
 ('encounter','/encounters/leopard-sharks-la-jolla/','california/san-diego','leopard-shark','leopard sharks la jolla','{"leopard shark snorkel san diego","when are leopard sharks in la jolla"}',null,null,null,1,
  'Leopard Sharks in La Jolla: When & Where to Snorkel',
  'Every summer harmless leopard sharks gather off La Jolla Shores. When they arrive, where to swim, guided options and shark-safe rules.',
  'Snorkel with leopard sharks in La Jolla')
) as v(ptype, path, rpath, sp, kw, sec, vol, kd, src, prio, title, meta, h1)
left join regions r on r.path = v.rpath
left join species sp on sp.slug = v.sp
on conflict (url_path) do nothing;

-- ---------- spot page H1, H2 outline, schema ----------
with sn as (
  select s.id, s.name,
    case s.slug
      when 'hanauma-bay' then 'Hanauma Bay' when 'biscayne-national-park' then 'Biscayne National Park'
      when 'ahihi-kinau' then 'Ahihi-Kinau' when 'bill-baggs-cape-florida' then 'Bill Baggs Cape Florida'
      when 'kealakekua-bay' then 'Kealakekua Bay' when 'la-jolla-shores-leopard-sharks' then 'La Jolla Shores'
      when 'kona-manta-night-snorkel' then 'the Kona manta site' when 'maluaka-turtle-town' then 'Turtle Town'
      when 'two-step' then 'Two Step' when 'waialea-bay' then 'Beach 69' when 'black-rock' then 'Black Rock'
      else regexp_replace(s.name, '\s*\(.*\)$', '') end as short
  from spots s
)
update pages p set
  h1 = initcap(left(sn.short, 1)) || substr(sn.short, 2) || ' snorkeling guide',
  h2_outline = jsonb_build_array(
    'Can you snorkel ' || sn.short || ' on your own?',
    sn.short || ' snorkeling conditions today',
    'Best time to snorkel ' || sn.short,
    'What you''ll see snorkeling ' || sn.short,
    'Where to snorkel at ' || sn.short || ', and where not to',
    'How to get to ' || sn.short,
    sn.short || ' snorkel tours and conservation experiences',
    'Nearby snorkel spots',
    sn.short || ' snorkeling FAQ'),
  schema_types = '{TouristAttraction,BreadcrumbList,FAQPage}',
  aeo_answer_ready = (p.spot_id in (select id from spots where answer_block is not null))
from sn
where p.spot_id = sn.id and p.page_type = 'spot';

update pages p set
  h2_outline = jsonb_build_array(
    'Best snorkeling spots in ' || r.name,
    r.name || ' snorkel map',
    'Can you snorkel ' || r.name || ' without a tour?',
    'Best time to snorkel in ' || r.name,
    'Marine life you can see in ' || r.name,
    'Snorkel tours and conservation experiences in ' || r.name,
    'How to snorkel ' || r.name || ' responsibly',
    r.name || ' snorkeling FAQ'),
  schema_types = '{TouristDestination,ItemList,BreadcrumbList,FAQPage}'
from regions r
where p.region_id = r.id and p.page_type in ('region', 'state');

update pages set
  h2_outline = '["Where to snorkel with turtles in Hawaii","Turtle spots you can reach from shore","Turtle snorkel tours by boat","Honu rules: how close is too close?","Best time of day to see turtles","Turtle snorkeling FAQ"]'::jsonb,
  schema_types = '{Article,ItemList,BreadcrumbList,FAQPage}'
where url_path = '/encounters/snorkel-with-turtles-hawaii/';

update pages set
  h2_outline = '["When are leopard sharks in La Jolla?","Where to find leopard sharks at La Jolla Shores","Are leopard sharks dangerous?","Guided leopard shark snorkels","Leopard shark snorkeling FAQ"]'::jsonb,
  schema_types = '{Article,BreadcrumbList,FAQPage}'
where url_path = '/encounters/leopard-sharks-la-jolla/';

update pages set
  h2_outline = '["Snorkeling isn''t only for strong swimmers","Where to snorkel next","Who you might meet, and how to meet them well","People are bringing reefs back","Snorkel kind: five habits that keep reefs open"]'::jsonb,
  schema_types = '{WebSite,Organization,ItemList}'
where url_path = '/';

-- ---------- FAQs ----------
-- Hanauma Bay: written by hand
insert into faq_items (page_id, question, answer, sort_order)
select p.id, v.q, v.a, v.n
from pages p, (values
 (1,'Do you need a reservation for Hanauma Bay?','Yes, if you are not a Hawaii resident. Reservations open online two days ahead at 7:00 a.m. HST. Hawaii residents with ID enter free without one.'),
 (2,'How much does Hanauma Bay cost?','$25 per non-resident aged 13 and over, plus a 2.35% online fee. Children 12 and under are free. Parking is $3 for non-residents.'),
 (3,'What days is Hanauma Bay closed?','Every Monday and Tuesday, plus Christmas Day and New Year''s Day. The closures give the reef time to recover.'),
 (4,'Can you see turtles at Hanauma Bay?','Often. Green sea turtles feed in the bay, and Hawaiian monk seals haul out on the beach in spring and summer. Keep your distance from both.'),
 (5,'Is Hanauma Bay good for beginners?','Yes. The inner reef is shallow and sheltered, and you can rent gear on site. Leave the outer bay to experienced swimmers.')
) as v(n, q, a)
where p.url_path = '/hawaii/oahu/hanauma-bay/';

-- Other spots: generated from verified spot fields (drafts for human review)
with sn as (
  select s.*, p.id as page_id,
    regexp_replace(case s.slug when 'kona-manta-night-snorkel' then 'the Kona manta site' else s.name end, '\s*\(.*\)$', '') as short,
    (select string_agg(sp.common_name, ', ' order by ss.odds)
       from spot_species ss join species sp on sp.id = ss.species_id
      where ss.spot_id = s.id and ss.odds in ('very_likely','often','seasonal')) as seen
  from spots s join pages p on p.spot_id = s.id and p.page_type = 'spot'
  where s.slug <> 'hanauma-bay'
)
insert into faq_items (page_id, question, answer, sort_order)
select page_id, q, a, n from (
  select page_id, 1 as n, 'Do you need a tour to snorkel ' || short || '?' as q,
    case entry_method
      when 'boat' then 'Yes. ' || short || ' is only reachable by boat, so you need a tour or charter.' || coalesce(' ' || getting_there_text, '')
      when 'shore_or_boat' then 'Not necessarily. ' || coalesce(getting_there_text, 'You can go from shore or by boat.')
      else 'No. You can snorkel ' || short || ' on your own from the shore.' || coalesce(' ' || reservation_text, '') end as a
  from sn
  union all
  select page_id, 2, 'How much does it cost to snorkel ' || short || '?',
    entry_fee_text || coalesce(' Parking: ' || parking_text, '')
  from sn where entry_fee_text is not null
  union all
  select page_id, 3, 'Is ' || short || ' good for beginners?',
    case level
      when 'beginner' then 'Yes, it is one of the easier spots in the area.'
      when 'intermediate' then 'It suits confident swimmers better than first-timers.'
      else 'No. It is for experienced snorkelers only.' end || coalesce(' ' || hazards_text, '')
  from sn where level is not null
  union all
  select page_id, 4, 'When is the best time to snorkel ' || short || '?', best_season_text || coalesce(' ' || seasonal_warning, '')
  from sn where best_season_text is not null
  union all
  select page_id, 5, 'What can you see snorkeling ' || short || '?', 'Commonly seen: ' || lower(seen) || '.'
  from sn where seen is not null
) f;

-- Region FAQs: generated from the spots in each region
with rs as (
  select r.id as region_id, r.name, p.id as page_id,
    count(*) as n,
    count(*) filter (where s.entry_method = 'shore') as shore_n,
    string_agg(regexp_replace(s.name, '\s*\(.*\)$', ''), ', ' order by s.name) filter (where s.entry_method = 'shore') as shore_list,
    string_agg(regexp_replace(s.name, '\s*\(.*\)$', ''), ', ' order by s.name) filter (where s.level = 'beginner') as beginner_list,
    string_agg(regexp_replace(s.name, '\s*\(.*\)$', ''), ', ' order by s.name)
      filter (where exists (select 1 from spot_species ss join species sp on sp.id = ss.species_id
                            where ss.spot_id = s.id and sp.slug = 'green-sea-turtle' and ss.odds in ('very_likely','often'))) as turtle_list
  from regions r
  join spots s on s.region_id = r.id
  join pages p on p.region_id = r.id and p.page_type = 'region'
  group by r.id, r.name, p.id
)
insert into faq_items (page_id, question, answer, sort_order)
select page_id, q, a, n from (
  select page_id, 1 as n, 'Can you snorkel ' || name || ' without a tour?' as q,
    case when shore_n > 0 then 'Yes. ' || shore_n || ' of the ' || n || ' spots in this guide are shore entries you can do on your own: ' || shore_list || '.'
         else 'Mostly not: the best reefs here are reached by boat.' end as a
  from rs
  union all
  select page_id, 2, 'What is the best beginner snorkeling in ' || name || '?', 'Start with ' || beginner_list || '.'
  from rs where beginner_list is not null
  union all
  select page_id, 3, 'Where can you snorkel with turtles in ' || name || '?', 'Turtles are often seen at ' || turtle_list || '. Stay at least 10 ft (3 m) away.'
  from rs where turtle_list is not null
) f;

-- ---------- internal links ----------
-- spot -> its island/city page, and back
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select sp.id, rp.id, 'parent', 'Snorkeling in ' || r.name, 0
from pages sp join regions r on r.id = sp.region_id
join pages rp on rp.region_id = r.id and rp.page_type = 'region'
where sp.page_type = 'spot'
on conflict do nothing;

insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select rp.id, sp.id, 'child', regexp_replace(s.name, '\s*\(.*\)$', '') || ' snorkeling', coalesce(sp.priority, 9)
from pages sp join spots s on s.id = sp.spot_id
join pages rp on rp.region_id = sp.region_id and rp.page_type = 'region'
where sp.page_type = 'spot'
on conflict do nothing;

-- spot -> 3 nearest spots in the same region
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select a_page, b_page, 'sibling', anchor, rk from (
  select pa.id as a_page, pb.id as b_page,
    regexp_replace(b.name, '\s*\(.*\)$', '') || ' snorkeling' as anchor,
    row_number() over (partition by a.id order by (a.lat - b.lat)^2 + (a.lng - b.lng)^2) as rk
  from spots a join spots b on b.region_id = a.region_id and b.id <> a.id
  join pages pa on pa.spot_id = a.id and pa.page_type = 'spot'
  join pages pb on pb.spot_id = b.id and pb.page_type = 'spot'
) x where rk <= 3
on conflict do nothing;

-- island/city <-> state
insert into page_links (from_page_id, to_page_id, role, anchor_text)
select rp.id, stp.id, 'parent', 'Snorkeling in ' || st.name
from pages rp join regions r on r.id = rp.region_id
join regions st on st.id = r.parent_id
join pages stp on stp.region_id = st.id and stp.page_type = 'state'
where rp.page_type = 'region'
on conflict do nothing;

insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select stp.id, rp.id, 'child', 'Snorkeling in ' || r.name, r.sort_order
from pages rp join regions r on r.id = rp.region_id
join pages stp on stp.region_id = r.parent_id and stp.page_type = 'state'
where rp.page_type = 'region'
on conflict do nothing;

-- home -> states
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select h.id, stp.id, 'child', 'Snorkeling in ' || r.name, r.sort_order
from pages h, pages stp join regions r on r.id = stp.region_id
where h.url_path = '/' and stp.page_type = 'state'
on conflict do nothing;

-- encounter hubs <-> spots where that species is common
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select ep.id, sp.id, 'child', regexp_replace(s.name, '\s*\(.*\)$', '') || ' snorkeling', 0
from pages ep
join spot_species ss on ss.species_id = ep.species_id and ss.odds in ('very_likely','often','seasonal')
join spots s on s.id = ss.spot_id
join regions r on r.id = s.region_id
join regions er on er.id = ep.region_id
join pages sp on sp.spot_id = s.id and sp.page_type = 'spot'
where ep.page_type = 'encounter' and (r.id = er.id or r.parent_id = er.id)
on conflict do nothing;

insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select l.to_page_id, l.from_page_id, 'related', ep.h1, 5
from page_links l join pages ep on ep.id = l.from_page_id
where ep.page_type = 'encounter'
on conflict do nothing;
