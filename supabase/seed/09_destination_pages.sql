-- Destination pages, FAQs and hierarchy-aware internal links for the expanded
-- destination set.
--
-- The internal link statements below use a recursive region walk rather than a
-- single parent hop, so a page can link to everything beneath it however deep
-- the region tree goes (Florida > South Florida > Florida Keys).

-- ---------- region pages ----------
insert into pages (page_type, url_path, region_id, target_keyword, secondary_keywords, search_volume, keyword_difficulty,
                   keyword_data_source, priority, title, meta_description, h1)
select 'region', v.path, r.id, v.kw, v.sec::text[], v.vol::int, v.kd::int, v.src, v.prio::int, v.title, v.meta, v.h1
from (values
 ('florida/south-florida','/florida/south-florida/','snorkeling south florida',
  '{"south florida snorkeling","miami snorkeling spots","florida keys snorkeling guide"}',null,null,null,1,
  'Snorkeling in South Florida: Miami, Lauderdale & the Keys',
  'South Florida snorkeling guide: Biscayne, the Lauderdale reef and shipwreck trail, and the Keys reef tract. Spots, fees and conservation trips.',
  'Snorkeling in South Florida: Miami, Lauderdale-by-the-Sea and the Florida Keys'),
 ('florida/lauderdale-by-the-sea','/florida/lauderdale-by-the-sea/','lauderdale by the sea snorkeling',
  '{"lauderdale snorkeling","shipwreck snorkel trail","ss copenhagen dive"}',null,null,null,2,
  'Lauderdale-by-the-Sea Snorkeling: Reef and Shipwreck Trail',
  'Snorkel the three-tier reef off Datura Avenue, follow the 2002 Shipwreck Snorkel Trail, and dive the SS Copenhagen. Access, depth and rules.',
  'Snorkeling in Lauderdale-by-the-Sea: the natural reef and the shipwreck trail'),
 ('florida/florida-keys','/florida/florida-keys/','florida keys snorkeling',
  '{"florida keys snorkeling spots","john pennekamp snorkeling","dry tortugas snorkeling"}',null,null,null,1,
  'Florida Keys Snorkeling: Pennekamp, the Tortugas & Reef Tract',
  'Where to snorkel in the Florida Keys: the world’s first undersea park at John Pennekamp, Dry Tortugas, the old Seven Mile Bridge and the marine sanctuary.',
  'Snorkeling in the Florida Keys: from John Pennekamp to the Dry Tortugas'),
 ('florida/florida-springs','/florida/florida-springs/','florida springs snorkeling',
  '{"florida springs swimming","rainbow springs snorkeling","fanning springs swim"}',null,null,null,1,
  'Florida Springs: Where to Swim in Crystal-Clear 72°F Water',
  'Rainbow, Gilchrist, Fanning and Manatee Springs: 72°F water all year, what it costs, the caves, the manatees and how to swim without harming the springs.',
  'Snorkeling and swimming in the Florida Springs')
) as v(rpath, path, kw, sec, vol, kd, src, prio, title, meta, h1)
join regions r on r.path = v.rpath
on conflict (url_path) do nothing;

-- ---------- spot pages ----------
insert into pages (page_type, url_path, region_id, spot_id, target_keyword, secondary_keywords, search_volume, keyword_difficulty,
                   keyword_data_source, priority, title, meta_description)
select 'spot', '/' || r.path || '/' || s.slug || '/', r.id, s.id, v.kw, v.sec::text[], v.vol::int, v.kd::int, v.src, v.prio::int, v.title, v.meta
from (values
 ('lanikai-beach','lanikai beach snorkeling','{"lanikai beach parking","lanikai beach snorkeling tips"}',null,null,null,2,
  'Lanikai Beach Snorkeling: the Reef, the Best Time and How to Park',
  'Snorkel the fringing reef off Lanikai Beach on Oahu: calm entry, turtles, what it costs, where to park and the best month to go.'),
 ('makapuu-tide-pools','makapuu tide pools snorkeling','{"makapuu tide pools rules","east oahu snorkeling"}',null,null,null,2,
  'Makapuu Tide Pools: Rules, Entry and What Lives in the Pools',
  'A guide to the tide pools at the far east end of Oahu: the MLCD rules, sharks in the water, how to reach them and what to look for in the pools.'),
 ('makena-beach','makena beach snorkeling','{"big beach maui snorkeling","makena beach parking"}',null,null,null,2,
  'Makena Beach (Big Beach) Snorkeling: Sand, Reef and Sunrise',
  'Snorkel Big Beach at the south end of Maui: free access, a shallow reef ledge, calm winter water and what to bring for the lava shelf.'),
 ('wailea-beach','wailea beach snorkeling','{"wailea beach maui","south shore maui snorkeling"}',null,null,null,3,
  'Wailea Beach Snorkeling: the Rocky Reef on Maui’s South Shore',
  'Snorkeling at Wailea Beach: a rocky reef shelf that drops off fast, calm mornings, free parking and how far out you can safely go.'),
 ('punaluu-black-sand-beach','punaluu black sand beach snorkeling','{"black sand beach big island","punaluu turtles"}',null,null,null,2,
  'Punaluu Black Sand Beach Snorkeling: Green Turtles at Sunrise',
  'Snorkel the black sand at Punaluu on the Big Island: green turtles basking at dawn, the freshwater river above it and when it is safe to swim.'),
 ('manoa-bay','manoa bay snorkeling','{"manoa bay reef","north shore hawaii snorkeling"}',null,null,null,3,
  'Manoa Bay Snorkeling: A Shallow Reef on Oahu’s North Shore',
  'Snorkel the shallow fringing reef at Manoa Bay: beginner depth, afternoon rays, parking and when the water clears after rain.'),
 ('scripps-pier','scripps pier snorkeling','{"scripps tidewalk","la jolla pier snorkeling"}',null,null,null,1,
  'Scripps Pier Snorkeling and the Tidewalk: When to Go',
  'Snorkel at Scripps Pier in La Jolla: the summer tidewalk schedule, the rip around the pilings, wetsuit depth and why you should not swim off the pier.'),
 ('sunset-cliffs-marine-reserve','sunset cliffs marine reserve snorkeling','{"sunset cliffs snorkeling","ocean beach kelp snorkel"}',null,null,null,2,
  'Sunset Cliffs Marine Reserve: Snorkeling the Kelp at Ocean Beach',
  'Snorkel the Sunset Cliffs Marine Reserve below the bluffs: kelp forest, rocky entry, wetsuit advice, marine reserve rules and parking.'),
 ('little-eggs-beach','little eggs beach snorkeling','{"catalina snorkeling west end","little eggs beach marine mammals"}',null,null,null,3,
  'Little Eggs Beach Snorkeling: A Rocky Cove on Catalina',
  'Snorkel Little Eggs Beach on Catalina Island: the marine mammal cove you must not enter, the rocky kelp entry, wetsuit depth and how to get there.'),
 ('camp-cactus','camp cactus snorkeling catalina','{"camp cactus beach","catalina east end snorkeling"}',null,null,null,3,
  'Camp Cactus Snorkeling: Sea Lions and Kelp on Catalina’s East End',
  'Snorkel Camp Cactus on the east end of Catalina Island: sea lions on the ledges, kelp and rock, when the water is calmest and what to wear.'),
 ('crandon-park','crandon park snorkeling','{"crandon park beach","key biscayne snorkeling"}',null,null,null,2,
  'Crandon Park Snorkeling: An Easy Shallow Swim on Key Biscayne',
  'Snorkel Crandon Park on Key Biscayne: free beach, parking passes, shallow safe water for beginners and the low reef on the north end.'),
 ('datura-avenue-reef','datura avenue beach snorkeling','{"datura ave reef","lauderdale street beach snorkeling"}',null,null,null,2,
  'Datura Avenue Reef: Snorkeling a Natural Reef from the Beach',
  'Snorkel the three-tier reef 100 yards off the Datura Avenue beach portal in Lauderdale-by-the-Sea: depth, boat traffic, parking and reef rules.'),
 ('shipwreck-snorkel-trail','shipwreck snorkel trail','{"anglins pier reef snorkel","shipwreck trail florida"}',null,null,null,1,
  'Shipwreck Snorkel Trail: Swimming the SS Copenhagen Reef',
  'The 2002 snorkel trail over the SS Copenhagen at Anglin’s Pier Reef: how to find the markers, what the wreck pieces were, depth, gear and the rules.'),
 ('ss-copenhagen','ss copenhagen dive','{"copenhagen wreck dive","florida underwater archaeological preserve"}',null,null,null,2,
  'SS Copenhagen: Diving a Protected Shipwreck off Lauderdale',
  'The British steamship that wrecked in May 1900 less than a mile offshore: what the dive is like, the 1994 underwater preserve and the rules that protect it.'),
 ('john-pennekamp-state-park','john pennekamp state park snorkeling','{"pennenkamp snorkel trail","john pennekamp glass bottom boat"}',null,null,null,1,
  'John Pennekamp: Snorkeling the First Undersea Park',
  'Snorkel the Florida reef where it starts at the beach: the 21-mile reef, the dive flag rule, the glass-bottom boat, fees and what to bring.'),
 ('dry-tortugas-national-park','dry tortugas snorkeling','{"dry tortugas trip","tortugas fort jefferson snorkeling"}',null,null,null,1,
  'Dry Tortugas Snorkeling: How to Get There and What to Expect',
  'Snorkeling the Dry Tortugas 70 miles west of Key West: ferry and boat options, the $15 park fee, the moat wall, Fort Jefferson and the crocodiles.'),
 ('seven-mile-bridge-wreck','seven mile bridge wreck snorkeling','{"old seven mile bridge piles","marathon snorkeling"}',null,null,null,3,
  'Seven Mile Bridge Wreck Snorkeling: The Old Piles at Marathon',
  'Snorkel the stumps of the 1912 Overseas Railway bridge at Marathon: depth, barnacles, the heritage trail and the one rule for a protected structure.'),
 ('sand-key-lighthouse','sand key lighthouse snorkeling','{"sand key reef snorkeling","key west boat trip snorkeling"}',null,null,null,3,
  'Sand Key Lighthouse: Snorkeling a Historic Light at Sea',
  'Boat out to Sand Key Lighthouse for shallow reef snorkeling around a National Register light: water taxis, depth, dive flags and what to bring.'),
 ('rainbow-springs','rainbow springs snorkeling','{"rainbow springs swimming hole","rainbow springs cave"}',null,null,null,2,
  'Rainbow Springs: Swimming the 72°F Pool and the Cave',
  'Rainbow Springs State Park: the cold head spring, the swimming cave and why it is closed, the $8 entry fee, depth and what to wear in 72°F water.'),
 ('gilchrist-blue-springs','gilchrist blue springs snorkeling','{"gilchrist springs swimming","high springs florida swimming"}',null,null,null,2,
  'Gilchrist Blue Springs: Swimming the Run to the Santa Fe River',
  'Gilchrist Blue Springs: a shallow 72°F spring run a quarter mile to the Santa Fe River, free entry, where to park and when the current picks up.'),
 ('fanning-springs','fanning springs snorkeling','{"fanning springs swimming","manatee spring florida"}',null,null,null,2,
  'Fanning Springs: Swimming the Spring Run Where Manatees Gather',
  'Fanning Springs State Park: a 65-million-gallon-a-day spring, the strong current in the river run, where to swim, the $6 fee and the manatee season.'),
 ('manatee-springs','manatee springs snorkeling','{"manatee springs swimming hole","manatee springs boardwalk"}',null,null,null,2,
  'Manatee Springs: Swimming Alongside Wild Manatees in 70°F Water',
  'Manatee Springs State Park: a clear shallow spring with wild manatees in the cool months, the viewing area, where to swim and the rule about the spring head.')
) as v(slug, kw, sec, vol, kd, src, prio, title, meta)
join spots s on s.slug = v.slug
join regions r on r.id = s.region_id
on conflict (url_path) do nothing;

-- ---------- hand written FAQs for the new region pages ----------
insert into faq_items (page_id, question, answer, sort_order)
select p.id, v.q, v.a, v.n
from pages p, (values
 ('/florida/south-florida/',1,'Which part of South Florida is best for a first snorkel?','Biscayne National Park and the nearshore reef off Crandon Park are the gentlest, with a shallow sandy bottom and no current. The Lauderdale reef and the Keys are the best once you are comfortable in open water.'),
 ('/florida/south-florida/',2,'Do I need a boat to snorkel in South Florida?','Not always. Biscayne National Park, Crandon Park and the Datura Avenue beach portal are all shore entries. John Pennekamp, Dry Tortugas and Sand Key are boat-only, because the reef there is 3 to 8 miles offshore.'),
 ('/florida/south-florida/',3,'When is the water clearest in South Florida?','Late spring through early autumn, when the water is warmest and there is less wind. Winter water is clearer but colder, and the Florida Springs are at their most attractive then.'),
 ('/florida/south-florida/',4,'Can I snorkel with manatees in South Florida?','Yes, in the spring runs rather than the sea. Manatee Springs and Fanning Springs give the best odds in the cooler months, from about November to March.'),
 ('/florida/lauderdale-by-the-sea/',1,'How do you get to the Datura Avenue reef?','Drive to Datura Avenue at El Mar Drive and walk through the beach portal at the end of the street. The reef starts about 100 yards offshore and the water is waist to chest deep on it.'),
 ('/florida/lauderdale-by-the-sea/',2,'Is the Shipwreck Snorkel Trail hard to find?','Moderately. The markers are small pairs of yellow buoys and they are easy to miss from the surface, so ask locally or go with a guided tour from the Marine Archaeological Council. Swim in from the Datura Avenue portal.'),
 ('/florida/lauderdale-by-the-sea/',3,'Can I snorkel the SS Copenhagen?','Not really. The top of the wreck is in about 25 ft of water, well past snorkel depth. It is a dive site inside a Florida Underwater Archaeological Preserve, where touching or removing anything is prohibited.'),
 ('/florida/lauderdale-by-the-sea/',4,'Is there a lifeguard at the Lauderdale beach?','No. Lauderdale-by-the-Sea is a street-access beach without lifeguards, and boat traffic is heavy. Stay clear of the pier and the marked channel.'),
 ('/florida/florida-keys/',1,'What is the best snorkeling spot in the Florida Keys?','For snorkelers, John Pennekamp State Park is the benchmark: the reef starts right at the sand and the shallow top is snorkelable from the beach or the glass-bottom boat. The Dry Tortugas have the best drop-offs and the biggest species list.'),
 ('/florida/florida-keys/',2,'Do I need a dive flag in the Florida Keys?','Yes. Florida law requires a dive flag for snorkelers and divers in state waters, and John Pennekamp and Dry Tortugas both enforce it. If you are on a tour, the boat provides one.'),
 ('/florida/florida-keys/',3,'Can you snorkel with turtles in the Florida Keys?','Yes, though it is not guaranteed. Loggerheads nest on the Keys beaches and hawksbills still nest in small numbers. Keep at least 10 ft away and never block a turtle heading for the surface.'),
 ('/florida/florida-keys/',4,'How long does it take to get to the Dry Tortugas?','About two hours by ferry from Key West, or a similar run by boat from Marathon or Key Largo. Allow a full day, carry water, and expect no freshwater and almost no shade on the island.'),
 ('/florida/florida-springs/',1,'How cold is the water in the Florida Springs?','Remarkably stable. The spring water is about 68 to 72 degrees all year, because it comes from the Floridan aquifer and never sees sunlight. That makes the springs far more comfortable than the ocean in summer.'),
 ('/florida/florida-springs/',2,'Is swimming at Rainbow Springs worth the entrance fee?','Yes. The head spring pool is 5 to 18 ft deep and the 400-foot cave beside it is a genuine attraction, though the cave itself is closed to swimmers. You pay $8 per vehicle or $6 per person on foot or by bike.'),
 ('/florida/florida-springs/',3,'Can I see manatees at the springs?','Often, in the cooler months. Manatee Springs and Fanning Springs are the reliable ones, from roughly November to March, when the water is cold enough for them but warm enough for Florida.'),
 ('/florida/florida-springs/',4,'Why is Fanning Springs so dangerous?','The current. A huge volume of water leaves the spring bowl and accelerates down the river, and swimming against it is exhausting. Stay in the river run, keep off the spring head, and use a float if you are not a strong swimmer.')
) as v(path, n, q, a)
where p.url_path = v.path
on conflict do nothing;

-- ---------- generated FAQs for the new spot pages ----------
with sn as (
  select s.*, p.id as page_id,
    regexp_replace(s.name, '\s*\(.*\)$', '') as short,
    (select string_agg(sp.common_name, ', ' order by ss.odds)
       from spot_species ss join species sp on sp.id = ss.species_id
      where ss.spot_id = s.id and ss.odds in ('very_likely','often','seasonal')) as seen
  from spots s join pages p on p.spot_id = s.id and p.page_type = 'spot'
  where s.slug in ('lanikai-beach','makapuu-tide-pools','makena-beach','wailea-beach','punaluu-black-sand-beach',
                   'manoa-bay','scripps-pier','sunset-cliffs-marine-reserve','little-eggs-beach','camp-cactus',
                   'crandon-park','datura-avenue-reef','shipwreck-snorkel-trail','ss-copenhagen',
                   'john-pennekamp-state-park','dry-tortugas-national-park','seven-mile-bridge-wreck','sand-key-lighthouse',
                   'rainbow-springs','gilchrist-blue-springs','fanning-springs','manatee-springs')
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

-- ---------- generated FAQs for the new region pages ----------
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
  where r.path in ('florida/south-florida','florida/lauderdale-by-the-sea','florida/florida-keys','florida/florida-springs')
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

-- ---------- extra FAQs worth hand answering ----------
insert into faq_items (page_id, question, answer, sort_order)
select p.id, v.q, v.a, v.n
from pages p, (values
 ('/florida/lauderdale-by-the-sea/shipwreck-snorkel-trail/',6,'What am I actually swimming over?','The SS Copenhagen, a British steamship that ran aground in May 1900 less than a mile offshore. It was broken up for scrap in the 1970s, and the trail was laid over the debris field: the anchor, five concrete cannon and a ballast pile sit at 10 ft.'),
 ('/florida/lauderdale-by-the-sea/shipwreck-snorkel-trail/',7,'When was the Shipwreck Snorkel Trail dedicated?','In 2002, with Jean-Michele Cousteau present. The Marine Archaeological Council, the nonprofit he inspired, maintains the trail and its markers today.'),
 ('/florida/lauderdale-by-the-sea/ss-copenhagen/',6,'Why is the SS Copenhagen protected?','Because it was declared a Florida Underwater Archaeological Preserve in 1994. That means the site may not be touched, moved or salvaged, and spearfishing and any form of take are prohibited.'),
 ('/florida/florida-keys/john-pennekamp-state-park/',6,'How big is John Pennekamp?','The reef tract covers roughly 70 to 72 square nautical miles and runs about 21 miles from the park out to the edge of the shelf. It was established in 1959 and was the world’s first undersea park.'),
 ('/florida/florida-keys/john-pennekamp-state-park/',7,'Can I snorkel from the beach at John Pennekamp?','Yes, the reef starts at the sand, which is what makes it unusual. Most visitors go out on the glass-bottom boat, a 65-foot catamaran that carries up to 130 passengers.'),
 ('/florida/florida-keys/dry-tortugas-national-park/',6,'Are there crocodiles at Dry Tortugas?','Yes. American crocodiles live in the moat around Fort Jefferson and around the brackish ponds on the island. They are wild and they are protected. Keep your distance and never swim in the moat.'),
 ('/florida/florida-keys/dry-tortugas-national-park/',7,'How many wrecks are in the Dry Tortugas?','More than 300, which is why the area is a magnet for divers. The Windjammer, a schooner that sank in the 1960s, sits in about 20 ft of water and is a snorkelable wreck.'),
 ('/florida/lauderdale-by-the-sea/datura-avenue-reef/',5,'How far out is the Datura Avenue reef?','About 100 yards offshore. The reef steps down in three tiers, and the first one is shallow enough to snorkel on. It is unusually close to shore for a Florida reef, which makes it a good first Florida snorkel.'),
 ('/florida/florida-springs/rainbow-springs/',5,'Can you swim in the Rainbow Springs cave?','No. The cave is 400 ft long but it is closed to swimmers because of the low roof and the risk of getting lost in the dark. Swim the pool beside it instead.'),
 ('/florida/florida-springs/fanning-springs/',5,'Can you swim in the spring bowl at Fanning Springs?','No. The spring bowl is a protected area and the current pouring out of it is strong enough to sweep a swimmer downstream. Stay in the river run below the spring.'),
 ('/hawaii/oahu/lanikai-beach/',5,'Is Lanikai Beach good for beginners?','Yes, it is one of the best beginner snorkels in Hawaii. The water is shallow inside the reef, the entry is a sandy bottom and there is a lifeguard on the beach at Lanikai Beach Park, though none at the Lanikai end.')
) as v(path, n, q, a)
where p.url_path = v.path
on conflict do nothing;

-- ---------- hierarchy aware internal links ----------
-- region page -> its child region pages
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select rp.id, cp.id, 'child', 'Snorkeling in ' || c.name, 5
from pages rp join regions r on r.id = rp.region_id
join regions c on c.parent_id = r.id
join pages cp on cp.region_id = c.id and cp.page_type = 'region'
where rp.page_type = 'region'
on conflict do nothing;

-- region page -> its parent region or state page
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select rp.id, pp.id, 'parent', 'Snorkeling in ' || p.name, 1
from pages rp join regions r on r.id = rp.region_id
join regions p on p.id = r.parent_id
join pages pp on pp.region_id = p.id and pp.page_type in ('state','region')
where rp.page_type = 'region'
on conflict do nothing;

-- spot page -> its region page
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select sp.id, rp.id, 'parent', 'Snorkeling in ' || r.name, 0
from pages sp join spots s on s.id = sp.spot_id
join regions r on r.id = s.region_id
join pages rp on rp.region_id = r.id and rp.page_type = 'region'
where sp.page_type = 'spot'
on conflict do nothing;

-- region or state page -> every spot beneath it, at any depth
with recursive region_tree as (
  select id as root, id as node from regions
  union all
  select rt.root, c.id from region_tree rt join regions c on c.parent_id = rt.node
)
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select rp.id, sp.id, 'child', regexp_replace(s.name, '\s*\(.*\)$', '') || ' snorkeling', 10 + coalesce(sp.priority, 9)
from region_tree rt
join pages rp on rp.region_id = rt.root and rp.page_type in ('state','region')
join spots s on s.region_id = rt.node
join pages sp on sp.spot_id = s.id and sp.page_type = 'spot'
on conflict do nothing;

-- spot page -> 3 nearest spots in the same region
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

-- state page -> its child region pages
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select stp.id, rp.id, 'child', 'Snorkeling in ' || r.name, r.sort_order
from pages rp join regions r on r.id = rp.region_id
join pages stp on stp.region_id = r.parent_id and stp.page_type = 'state'
where rp.page_type = 'region'
on conflict do nothing;

-- region page -> its child region pages (already covered above, kept for the state level)
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select stp.id, rp.id, 'child', 'Snorkeling in ' || r.name, r.sort_order
from pages rp join regions r on r.id = rp.region_id
join pages stp on stp.region_id = r.parent_id and stp.page_type in ('state','region')
where rp.page_type = 'region' and r.parent_id is not null
  and not exists (select 1 from page_links pl where pl.from_page_id = stp.id and pl.to_page_id = rp.id)
on conflict do nothing;

-- spot page -> closest spots in a neighbouring region, so no page is left with
-- fewer than three inbound links once new destinations are added
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select a_page, b_page, 'related', anchor, rk from (
  select pa.id as a_page, pb.id as b_page,
    regexp_replace(b.name, '\s*\(.*\)$', '') || ' snorkeling' as anchor,
    row_number() over (partition by a.id order by (a.lat - b.lat)^2 + (a.lng - b.lng)^2) as rk
  from spots a join spots b on b.region_id <> a.region_id and b.id <> a.id
  join pages pa on pa.spot_id = a.id and pa.page_type = 'spot'
  join pages pb on pb.spot_id = b.id and pb.page_type = 'spot'
) x where rk <= 2
on conflict do nothing;

-- spot page -> reciprocal sibling links, so a spot that is nobody's closest
-- three still ends up with inbound links from its neighbours
with inbound_counts as (
  select p.id, count(pl.from_page_id) as inbound
  from pages p left join page_links pl on pl.to_page_id = p.id
  group by p.id
)
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select pb.id, pa.id, 'sibling',
       regexp_replace(b.name, '\s*\(.*\)$', '') || ' snorkeling', 3
from page_links pl
join pages pa on pa.id = pl.from_page_id
join pages pb on pb.id = pl.to_page_id
join spots a on a.id = pa.spot_id
join spots b on b.id = pb.spot_id
join inbound_counts ic on ic.id = pa.id
where pl.role = 'sibling' and ic.inbound < 4
on conflict do nothing;

-- The spot pages above were created without an H1 (the region pages carry one).
-- Give every new spot page a readable H1 so the page heading is never empty.
update pages p
set h1 = v.h1
from (values
  ('/hawaii/oahu/lanikai-beach/', 'Snorkeling at Lanikai Beach: reef, turtles and parking'),
  ('/hawaii/oahu/makapuu-tide-pools/', 'Makapuu Tide Pools: rules, entry and what lives there'),
  ('/hawaii/oahu/manoa-bay/', 'Manoa Bay: the reef and the turtles on the way in'),
  ('/hawaii/maui/makena-beach/', 'Snorkeling at Makena Beach: sand, reef and sunrise'),
  ('/hawaii/maui/wailea-beach/', 'Wailea Beach snorkel guide: beach and reef entry'),
  ('/hawaii/big-island/punaluu-black-sand-beach/', 'Punaluu Black Sand Beach: swimming and the lava edge'),
  ('/california/san-diego/scripps-pier/', 'Snorkeling at Scripps Pier: the pier and the kelp'),
  ('/california/san-diego/sunset-cliffs-marine-reserve/', 'Sunset Cliffs Marine Reserve: snorkel and paddleboard'),
  ('/california/catalina-island/little-eggs-beach/', 'Little Eggs Beach: a sheltered Catalina snorkel spot'),
  ('/california/catalina-island/camp-cactus/', 'Camp Cactus: camping and snorkeling on Catalina'),
  ('/florida/miami/crandon-park/', 'Crandon Park: Key Biscayne''s shallow reef and beach'),
  ('/florida/florida-springs/rainbow-springs/', 'Rainbow Springs: swimming and snorkeling in Florida'),
  ('/florida/florida-springs/gilchrist-blue-springs/', 'Gilchrist Blue Springs: a swim and a snorkel spot'),
  ('/florida/florida-springs/fanning-springs/', 'Fanning Springs: cave dive and spring snorkel guide'),
  ('/florida/florida-springs/manatee-springs/', 'Manatee Springs: swimming, manatees and the dive'),
  ('/florida/lauderdale-by-the-sea/datura-avenue-reef/', 'Datura Avenue Reef: snorkeling off Lauderdale'),
  ('/florida/lauderdale-by-the-sea/shipwreck-snorkel-trail/', 'The Shipwreck Snorkel Trail: a guided reef swim'),
  ('/florida/lauderdale-by-the-sea/ss-copenhagen/', 'SS Copenhagen: diving a protected shipwreck'),
  ('/florida/florida-keys/john-pennekamp-state-park/', 'John Pennekamp State Park: the reef and the reef boat'),
  ('/florida/florida-keys/dry-tortugas-national-park/', 'Dry Tortugas: the clearest water in the continental USA'),
  ('/florida/florida-keys/seven-mile-bridge-wreck/', 'The Seven Mile Bridge wreck: a shallow reef swim'),
  ('/florida/florida-keys/sand-key-lighthouse/', 'Sand Key Lighthouse: a palm-fringed reef near Key West')
) as v(url_path, h1)
where p.url_path = v.url_path and coalesce(p.h1, '') <> v.h1;
