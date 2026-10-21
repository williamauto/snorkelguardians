-- Regions, species, organizations. Idempotent on slug/path.

insert into regions (parent_id, kind, slug, path, name, lat, lng, map_zoom, sort_order, summary) values
 (null, 'state', 'hawaii',     'hawaii',     'Hawaii',              20.80, -156.80, 7, 1, 'Warm, clear water year-round, green sea turtles almost everywhere, and many free shore entries.'),
 (null, 'state', 'california', 'california', 'Southern California', 33.20, -117.80, 8, 2, 'Kelp forests, bright orange garibaldi and summer leopard sharks in cool, protected marine reserves.'),
 (null, 'state', 'florida',    'florida',    'Florida',             25.70, -80.30, 9, 3, 'The only living coral barrier reef in the continental US, plus manatee springs.')
on conflict (path) do nothing;

insert into regions (parent_id, kind, slug, path, name, lat, lng, map_zoom, sort_order, summary)
select p.id, v.kind::region_kind, v.slug, p.path || '/' || v.slug, v.name, v.lat, v.lng, v.zoom, v.sort, v.summary
from (values
 ('hawaii', 'island', 'oahu',            'Oahu',            21.47, -157.98, 10, 1, 'Free shore coves on the North and West shores, Hanauma Bay by reservation, and turtle boats off Waikiki.'),
 ('hawaii', 'island', 'maui',            'Maui',            20.80, -156.33, 10, 2, 'Molokini Crater by boat, and calm reef coves from Kapalua to Makena that you can walk into.'),
 ('hawaii', 'island', 'big-island',      'Big Island',      19.60, -155.90,  9, 3, 'Kona''s lava-rock coves, the Captain Cook Monument reef and the famous manta ray night snorkel.'),
 ('california', 'city',   'san-diego',       'San Diego',       32.85, -117.27, 13, 1, 'La Jolla''s underwater park: garibaldi at the Cove and leopard sharks off the Shores in summer.'),
 ('california', 'island', 'catalina-island', 'Catalina Island', 33.38, -118.42, 11, 2, 'A ferry ride from LA to kelp forests and marine conservation areas right off Avalon.'),
 ('florida', 'city', 'miami', 'Miami', 25.62, -80.20, 10, 1, 'Coral patch reefs and wrecks in Biscayne National Park by boat, plus easy beaches on Key Biscayne.')
) as v(parent, kind, slug, name, lat, lng, zoom, sort, summary)
join regions p on p.path = v.parent
on conflict (path) do nothing;

insert into species (slug, common_name, local_name, scientific_name, grp, protection_text, distance_rule, description) values
 ('green-sea-turtle',        'Green sea turtle',          'Honu',  'Chelonia mydas',            'turtle',        'Protected under the US Endangered Species Act.', 'Stay at least 10 ft (3 m) away. Never touch, chase or block its path to the surface.', 'Grazes on algae and seagrass close to shore; often rests on the reef or visits fish cleaning stations.'),
 ('hawaiian-monk-seal',      'Hawaiian monk seal',        'Ilio holo i ka uaua', 'Neomonachus schauinslandi', 'marine_mammal', 'Endangered; one of the rarest seals in the world.', 'Stay at least 50 ft (15 m) away, and 150 ft (45 m) from a mother and pup.', 'Hauls out on beaches to rest. Resting seals are not stranded; leave them be.'),
 ('spinner-dolphin',         'Spinner dolphin',           'Naia',  'Stenella longirostris',     'marine_mammal', 'Protected under the Marine Mammal Protection Act.', 'In Hawaii it is illegal to approach within 50 yards (46 m).', 'Rests in shallow bays by day and feeds offshore at night.'),
 ('reef-manta-ray',          'Reef manta ray',            'Hahalua', 'Mobula alfredi',          'shark_ray',     'Protected from take in Hawaii.', 'Float at the surface and keep your hands to yourself; let the manta come to you.', 'Filter-feeds on plankton; in Kona it visits lights set out at night.'),
 ('reef-triggerfish',        'Reef triggerfish',          'Humuhumunukunukuapuaa', 'Rhinecanthus rectangulus', 'fish', null, null, 'Hawaii''s state fish, common on shallow reef flats.'),
 ('yellow-tang',             'Yellow tang',               'Lauipala', 'Zebrasoma flavescens',   'fish',          null, null, 'Bright yellow surgeonfish that grazes algae in schools.'),
 ('parrotfish',              'Parrotfish',                'Uhu',   'Scaridae',                  'fish',          null, null, 'Crunches dead coral and turns it into sand; listen for it.'),
 ('moorish-idol',            'Moorish idol',              'Kihikihi', 'Zanclus cornutus',       'fish',          null, null, 'Striped reef fish with a long trailing dorsal fin.'),
 ('garibaldi',               'Garibaldi',                 null,    'Hypsypops rubicundus',      'fish',          'California''s state marine fish; protected from take.', null, 'Bright orange damselfish that guards its patch of rocky reef.'),
 ('leopard-shark',           'Leopard shark',             null,    'Triakis semifasciata',      'shark_ray',     null, 'Harmless and shy. Watch from above; never touch or chase.', 'Gathers in warm, sandy shallows off La Jolla Shores in summer.'),
 ('california-sea-lion',     'California sea lion',       null,    'Zalophus californianus',    'marine_mammal', 'Protected under the Marine Mammal Protection Act.', 'Give at least 50 ft (15 m); never approach resting animals on rocks.', 'Rests on the cliffs and rocks around La Jolla and Catalina.'),
 ('horn-shark',              'Horn shark',                null,    'Heterodontus francisci',    'shark_ray',     null, null, 'Small, slow bottom-dwelling shark that hides in rocky crevices by day.'),
 ('kelp-bass',               'Kelp bass',                 null,    'Paralabrax clathratus',     'fish',          null, null, 'Common predator in kelp forests.'),
 ('giant-kelp',              'Giant kelp',                null,    'Macrocystis pyrifera',      'algae',         null, null, 'Fast-growing brown algae that forms underwater forests along the California coast.'),
 ('west-indian-manatee',     'West Indian manatee',       null,    'Trichechus manatus',        'marine_mammal', 'Federally threatened.', 'Passive observation only: no touching, chasing or feeding.', 'Slow-moving grazer of seagrass in warm, shallow water.'),
 ('nurse-shark',             'Nurse shark',               null,    'Ginglymostoma cirratum',    'shark_ray',     null, 'Usually rests on the bottom; do not touch or corner it.', 'Bottom-dwelling shark often seen resting under ledges.'),
 ('southern-stingray',       'Southern stingray',         null,    'Hypanus americanus',        'shark_ray',     null, 'Shuffle your feet when wading over sand.', 'Rests half-buried in sand flats.'),
 ('bottlenose-dolphin',      'Bottlenose dolphin',        null,    'Tursiops truncatus',        'marine_mammal', 'Protected under the Marine Mammal Protection Act.', 'Never feed or swim toward dolphins.', 'Often seen from boats in Biscayne Bay.'),
 ('elkhorn-coral',           'Elkhorn coral',             null,    'Acropora palmata',          'coral',         'Threatened under the US Endangered Species Act.', 'Never stand on, touch or kick coral.', 'Branching reef-building coral, focus of Florida restoration programs.'),
 ('spadefish',               'Atlantic spadefish',        null,    'Chaetodipterus faber',      'fish',          null, null, 'Disc-shaped fish that cruises in schools over reefs and wrecks.')
on conflict (slug) do nothing;

insert into organizations (slug, name, kind, is_conservation_partner, website_url, region_id, description)
select v.slug, v.name, v.kind::org_kind, v.partner, v.url, r.id, v.descr
from (values
 ('honolulu-parks',             'Honolulu Department of Parks and Recreation', 'government', false, 'https://www.honolulu.gov/parks-hbay/home.html', 'hawaii/oahu',  'Manages Hanauma Bay Nature Preserve, including reservations and fees.'),
 ('hawaii-dlnr-dar',            'Hawaii DLNR Division of Aquatic Resources', 'government', false, 'https://dar.hawaii.gov', 'hawaii', 'Sets the rules for Hawaii''s Marine Life Conservation Districts.'),
 ('hawaii-state-parks',         'Hawaii Division of State Parks', 'government', false, 'https://dlnr.hawaii.gov/dsp/', 'hawaii', 'Manages Kealakekua Bay State Historical Park and its vessel permits.'),
 ('roberts-hawaii',             'Roberts Hawaii', 'operator', false, null, 'hawaii/oahu', 'Runs round-trip shuttles from Waikiki that include guaranteed Hanauma Bay admission.'),
 ('pacific-whale-foundation',   'Pacific Whale Foundation', 'nonprofit', true, 'https://pacificwhale.org', 'hawaii/maui', 'Maui-based nonprofit for ocean research and education that runs eco-tours.'),
 ('eco-tours-maui',             'Eco Tours Maui', 'operator', false, null, 'hawaii/maui', 'Sea-scooter snorkel tours from Kapalua Bay; partners with the Hawaii Coral Institute on reef monitoring.'),
 ('kahaluu-bay-education-center','Kahaluu Bay Education Center', 'community', true, null, 'hawaii/big-island', 'Runs the Reef Teach volunteer program with The Kohala Center at Kahaluu Beach Park.'),
 ('kona-boys',                  'Kona Boys', 'operator', false, null, 'hawaii/big-island', 'One of the permitted guided kayak vendors for Kealakekua Bay.'),
 ('adventures-in-paradise',     'Adventures in Paradise', 'operator', false, null, 'hawaii/big-island', 'One of the permitted guided kayak vendors for Kealakekua Bay.'),
 ('birch-aquarium',             'Birch Aquarium at Scripps Institution of Oceanography', 'research', true, null, 'california/san-diego', 'Public aquarium of Scripps Institution of Oceanography; runs summer leopard shark snorkel programs.'),
 ('hike-bike-kayak',            'Hike Bike Kayak San Diego', 'operator', false, 'https://bikeandkayaktours.com', 'california/san-diego', 'Guided leopard shark snorkels at La Jolla Shores and sea cave kayak tours.'),
 ('catalina-divers-supply',     'Catalina Divers Supply', 'operator', false, 'https://catalinadiverssupply.com', 'california/catalina-island', 'Gear rentals and guided snorkels at Casino Point, Avalon.'),
 ('biscayne-np-institute',      'Biscayne National Park Institute', 'operator', true, 'https://www.biscaynenationalparkinstitute.org', 'florida/miami', 'Partner of Biscayne National Park running guided snorkel, paddle and boat eco-tours from the Dante Fascell Visitor Center.'),
 ('coral-restoration-foundation','Coral Restoration Foundation', 'nonprofit', true, 'https://coralrestoration.org', 'florida', 'Key Largo nonprofit growing and outplanting corals on the Florida Reef Tract; runs dive and snorkel programs with partner shops.'),
 ('mote-marine-laboratory',     'Mote Marine Laboratory', 'research', true, null, 'florida', 'Marine research lab with a Key Largo coral nursery and community restoration programs.'),
 ('loggerhead-marinelife-center','Loggerhead Marinelife Center', 'nonprofit', true, null, 'florida', 'Sea turtle hospital in Juno Beach that runs permitted guided turtle walks in June and July.'),
 ('the-reefline',               'The ReefLine', 'community', true, null, 'florida/miami', 'Underwater sculpture park and artificial reef off Miami Beach, planted with climate-resilient coral.')
) as v(slug, name, kind, partner, url, rpath, descr)
left join regions r on r.path = v.rpath
on conflict (slug) do nothing;
