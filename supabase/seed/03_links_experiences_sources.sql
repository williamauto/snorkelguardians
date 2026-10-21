-- Species seen at each spot
insert into spot_species (spot_id, species_id, odds, season_text)
select s.id, sp.id, v.odds::sighting_odds, v.season
from (values
 ('hanauma-bay','green-sea-turtle','often',null),('hanauma-bay','hawaiian-monk-seal','seasonal','Spring and summer'),
 ('hanauma-bay','parrotfish','very_likely',null),('hanauma-bay','reef-triggerfish','very_likely',null),('hanauma-bay','yellow-tang','very_likely',null),
 ('sharks-cove','green-sea-turtle','often',null),('sharks-cove','parrotfish','very_likely',null),('sharks-cove','moorish-idol','often',null),
 ('kuilima-cove','green-sea-turtle','occasional',null),('kuilima-cove','yellow-tang','often',null),
 ('electric-beach','green-sea-turtle','often',null),('electric-beach','spinner-dolphin','occasional',null),('electric-beach','yellow-tang','very_likely',null),
 ('ko-olina-lagoons','reef-triggerfish','often',null),('ko-olina-lagoons','yellow-tang','often',null),
 ('turtle-canyon','green-sea-turtle','very_likely',null),
 ('maunalua-bay','green-sea-turtle','very_likely',null),
 ('molokini-crater','yellow-tang','very_likely',null),('molokini-crater','moorish-idol','very_likely',null),('molokini-crater','parrotfish','often',null),
 ('honolua-bay','green-sea-turtle','often',null),('honolua-bay','parrotfish','very_likely',null),
 ('black-rock','green-sea-turtle','very_likely',null),('black-rock','reef-triggerfish','often',null),
 ('kapalua-bay','green-sea-turtle','often',null),('kapalua-bay','yellow-tang','often',null),
 ('olowalu','green-sea-turtle','very_likely',null),('olowalu','parrotfish','often',null),
 ('ahihi-kinau','green-sea-turtle','often',null),('ahihi-kinau','moorish-idol','often',null),
 ('maluaka-turtle-town','green-sea-turtle','very_likely',null),
 ('kealakekua-bay','spinner-dolphin','often','Resting in the bay in the morning'),('kealakekua-bay','yellow-tang','very_likely',null),('kealakekua-bay','moorish-idol','very_likely',null),
 ('two-step','green-sea-turtle','often',null),('two-step','spinner-dolphin','often',null),('two-step','yellow-tang','very_likely',null),
 ('kahaluu-beach-park','green-sea-turtle','very_likely','Almost daily'),('kahaluu-beach-park','yellow-tang','very_likely',null),('kahaluu-beach-park','moorish-idol','very_likely',null),('kahaluu-beach-park','parrotfish','very_likely',null),
 ('kona-manta-night-snorkel','reef-manta-ray','very_likely','Most nights; never guaranteed'),
 ('waialea-bay','green-sea-turtle','often',null),
 ('la-jolla-cove','garibaldi','very_likely',null),('la-jolla-cove','california-sea-lion','very_likely',null),('la-jolla-cove','giant-kelp','very_likely',null),('la-jolla-cove','kelp-bass','often',null),
 ('la-jolla-shores-leopard-sharks','leopard-shark','seasonal','Summer'),('la-jolla-shores-leopard-sharks','southern-stingray','occasional',null),
 ('la-jolla-sea-caves','garibaldi','very_likely',null),('la-jolla-sea-caves','california-sea-lion','very_likely',null),
 ('lovers-cove','garibaldi','very_likely',null),('lovers-cove','kelp-bass','very_likely',null),
 ('casino-point-dive-park','garibaldi','very_likely',null),('casino-point-dive-park','horn-shark','occasional',null),('casino-point-dive-park','giant-kelp','very_likely',null),
 ('descanso-beach','california-sea-lion','occasional',null),('descanso-beach','garibaldi','often',null),
 ('biscayne-national-park','green-sea-turtle','occasional',null),('biscayne-national-park','nurse-shark','occasional',null),('biscayne-national-park','southern-stingray','often',null),('biscayne-national-park','bottlenose-dolphin','occasional',null),('biscayne-national-park','west-indian-manatee','occasional',null),
 ('emerald-reef','elkhorn-coral','often',null),('emerald-reef','spadefish','often',null),('emerald-reef','bottlenose-dolphin','occasional',null)
) as v(spot, sp, odds, season)
join spots s on s.slug = v.spot
join species sp on sp.slug = v.sp
on conflict do nothing;

-- Experiences
insert into experiences (slug, name, kind, is_conservation, organization_id, region_id, description, price_from_usd, price_text,
  donation_text, duration_text, season_text, min_age, group_size_text, meeting_point, booking_url, affiliate_network, data_confidence, last_checked_at)
select v.slug, v.name, v.kind::experience_kind, v.cons, o.id, r.id, v.descr, v.price::numeric, v.price_text,
  v.donation, v.duration, v.season, v.min_age::smallint, v.grp, v.meet, v.url, v.net, v.conf::data_confidence, date '2026-10-21'
from (values
 ('hanauma-shuttle-guaranteed-entry','Hanauma Bay shuttle with guaranteed entry','shuttle_entry',false,'roberts-hawaii','hawaii/oahu',
  'Round-trip electric shuttle from Waikiki that includes Hanauma Bay admission, so you skip the online reservation scramble.',null,null,null,null,null,null,null,'Waikiki hotels',null,null,'verified_secondary'),
 ('maunalua-bay-turtle-snorkel','Maunalua Bay turtle snorkel by boat','boat_snorkel',false,null,'hawaii/oahu',
  'Small-boat snorkel at a reef with daily green sea turtle sightings; flotation and gear included.',null,null,null,'2.5 hours',null,null,null,'Hawaii Kai',null,null,'needs_verification'),
 ('pwf-molokini-eco-snorkel','Molokini snorkel eco-tour','boat_snorkel',true,'pacific-whale-foundation','hawaii/maui',
  'Snorkel Molokini with a nonprofit that funds ocean research and education.',null,null,'Proceeds support Pacific Whale Foundation research and education.',null,'Year-round',null,null,'Maalaea Harbor',null,'direct','needs_verification'),
 ('olowalu-biologist-shore-snorkel','Marine biologist guided shore snorkel at Olowalu','guided_snorkel',true,null,'hawaii/maui',
  'Snorkel Maui''s oldest reef with a marine biologist: gear, a snorkel lesson, reef-safe sunscreen and photos included.',119,'From $119',null,null,'Year-round',8,'8 guests or fewer','Olowalu, mile marker 14',null,null,'verified_secondary'),
 ('eco-tours-maui-sea-scooter','Eco sea-scooter snorkel from Kapalua Bay','guided_snorkel',true,'eco-tours-maui','hawaii/maui',
  'Guided sea-scooter snorkel along West Maui reefs; guests learn to spot coral bleaching and disease with the Hawaii Coral Institute.',null,null,null,null,null,null,null,'Kapalua Bay',null,null,'verified_secondary'),
 ('kahaluu-reef-teach','Reef Teach at Kahaluu Bay','reef_education',true,'kahaluu-bay-education-center','hawaii/big-island',
  'Volunteer docents on the beach point out marine life and explain reef-safe habits; volunteers are welcome to join.',0,'Free',null,null,'Peak beach hours',null,null,'Kahaluu Beach Park',null,'direct','verified_secondary'),
 ('kealakekua-kayak-kona-boys','Guided kayak and snorkel to the Captain Cook Monument (Kona Boys)','kayak_snorkel',false,'kona-boys','hawaii/big-island',
  'Permitted guided kayak tour across Kealakekua Bay to snorkel the reef below the monument.',null,null,null,null,null,null,null,'Kealakekua Bay',null,null,'verified_official'),
 ('kealakekua-kayak-adventures-in-paradise','Guided kayak and snorkel to the Captain Cook Monument (Adventures in Paradise)','kayak_snorkel',false,'adventures-in-paradise','hawaii/big-island',
  'Permitted guided kayak tour across Kealakekua Bay to snorkel the reef below the monument.',null,null,null,null,null,null,null,'Kealakekua Bay',null,null,'verified_official'),
 ('birch-aquarium-leopard-shark-snorkel','Leopard shark snorkel with Birch Aquarium','guided_snorkel',true,'birch-aquarium','california/san-diego',
  'Summer snorkel program with Scripps educators to see leopard sharks off La Jolla Shores.',null,null,null,null,'Summer',null,null,'La Jolla Shores',null,'direct','needs_verification'),
 ('hbk-leopard-shark-encounter','Leopard shark snorkel encounter','guided_snorkel',false,'hike-bike-kayak','california/san-diego',
  'Guided snorkel over the sand flats at La Jolla Shores during leopard shark season.',null,null,null,null,'From mid-June',null,null,'La Jolla Shores',null,null,'verified_secondary'),
 ('hbk-sea-caves-kayak','La Jolla sea caves kayak and snorkel','kayak_snorkel',false,'hike-bike-kayak','california/san-diego',
  'Guided kayak along the La Jolla cliffs to the sea caves, with a snorkel stop.',null,null,null,null,null,null,null,'La Jolla Shores',null,null,'needs_verification'),
 ('catalina-guided-snorkel','Guided snorkel at Casino Point','guided_snorkel',false,'catalina-divers-supply','california/catalina-island',
  'Guided snorkel and gear rental (mask, snorkel, fins, wetsuit) at Avalon''s underwater park.',null,null,null,'2 hours to a full day (rentals)',null,null,null,'Avalon Casino, lower level',null,null,'verified_secondary'),
 ('bnpi-snorkel-paddle','Snorkel and paddle eco-adventure in Biscayne National Park','boat_snorkel',true,'biscayne-np-institute','florida/miami',
  'Six-hour guided trip: snorkel a coral patch reef, wreck or mangrove site chosen by weather, then paddle Jones Lagoon. Bring your own lunch.',209,'$209 per person (shared trip)',null,'6 hours','Year-round',12,'Shared or private (up to 6)','Dante Fascell Visitor Center, Homestead','https://www.biscaynenationalparkinstitute.org/paddling/snorkel-paddle-eco-adventure/','direct','verified_official'),
 ('crf-coral-nursery-snorkel','Coral nursery snorkel with Coral Restoration Foundation','coral_restoration',true,'coral-restoration-foundation','florida',
  'A restoration talk, then a snorkel trip to a working coral nursery and restoration site off Key Largo with a partner dive shop.',null,null,'Includes a required $50 donation to Coral Restoration Foundation.',null,'Year-round, weather permitting',10,null,'Key Largo',null,'direct','verified_secondary'),
 ('mote-community-restoration','Community coral reef restoration day','coral_restoration',true,'mote-marine-laboratory','florida',
  'Learn coral fragmentation with Mote scientists, then help maintain in-water nurseries; a snorkel option is offered.',null,null,null,'Full day',null,15,null,'Mote Key Largo Coral Nursery',null,'direct','verified_secondary'),
 ('lmc-guided-turtle-walk','Guided sea turtle walk at Juno Beach','turtle_nesting',true,'loggerhead-marinelife-center','florida',
  'Permitted night walk on one of the densest loggerhead nesting beaches in the world, after a talk at the sea turtle hospital. Sightings are not guaranteed.',null,null,'Ticket sales support the center''s sea turtle patients.','About 3 hours (9 p.m. to midnight)','June and July',8,null,'Loggerhead Marinelife Center, Juno Beach',null,'direct','verified_secondary')
) as v(slug, name, kind, cons, org, rpath, descr, price, price_text, donation, duration, season, min_age, grp, meet, url, net, conf)
join regions r on r.path = v.rpath
left join organizations o on o.slug = v.org
on conflict (slug) do nothing;

insert into spot_experiences (spot_id, experience_id, link_kind)
select s.id, e.id, v.kind::spot_link_kind
from (values
 ('hanauma-bay','hanauma-shuttle-guaranteed-entry','goes_to'),
 ('hanauma-bay','maunalua-bay-turtle-snorkel','alternative'),
 ('maunalua-bay','maunalua-bay-turtle-snorkel','goes_to'),
 ('molokini-crater','pwf-molokini-eco-snorkel','goes_to'),
 ('olowalu','olowalu-biologist-shore-snorkel','goes_to'),
 ('kapalua-bay','eco-tours-maui-sea-scooter','goes_to'),
 ('kahaluu-beach-park','kahaluu-reef-teach','goes_to'),
 ('kealakekua-bay','kealakekua-kayak-kona-boys','goes_to'),
 ('kealakekua-bay','kealakekua-kayak-adventures-in-paradise','goes_to'),
 ('la-jolla-shores-leopard-sharks','birch-aquarium-leopard-shark-snorkel','goes_to'),
 ('la-jolla-shores-leopard-sharks','hbk-leopard-shark-encounter','goes_to'),
 ('la-jolla-sea-caves','hbk-sea-caves-kayak','goes_to'),
 ('la-jolla-cove','hbk-sea-caves-kayak','nearby'),
 ('casino-point-dive-park','catalina-guided-snorkel','goes_to'),
 ('lovers-cove','catalina-guided-snorkel','nearby'),
 ('biscayne-national-park','bnpi-snorkel-paddle','goes_to'),
 ('biscayne-national-park','crf-coral-nursery-snorkel','nearby'),
 ('emerald-reef','bnpi-snorkel-paddle','alternative')
) as v(spot, exp, kind)
join spots s on s.slug = v.spot
join experiences e on e.slug = v.exp
on conflict do nothing;

-- Sources (citation trail)
insert into sources (spot_id, experience_id, url, title, publisher, is_official, accessed_on)
select s.id, e.id, v.url, v.title, v.pub, v.official, date '2026-10-21'
from (values
 ('hanauma-bay',null,'https://www.honolulu.gov/parks-hbay/home.html','Hanauma Bay Nature Preserve','City and County of Honolulu',true),
 ('hanauma-bay',null,'https://dlnr.hawaii.gov/dar/?p=239','Oahu - Hanauma Bay MLCD','Hawaii DLNR Division of Aquatic Resources',true),
 ('hanauma-bay',null,'https://www.hawaii-guide.com/oahu/sights/hanauma-bay-reservations','Hanauma Bay Reservations 2026','Hawaii Guide',false),
 ('molokini-crater',null,'https://dar.hawaii.gov/?p=31928','Molokini Shoal MLCD','Hawaii DLNR Division of Aquatic Resources',true),
 ('ahihi-kinau',null,'https://www.hawaii-guide.com/maui/beaches/ahihi-kinau-natural-area-reserve','Ahihi-Kinau Natural Area Reserve','Hawaii Guide',false),
 ('kealakekua-bay',null,'https://dlnr.hawaii.gov/dsp/parks/hawaii/kealakekua-bay-state-historical-park','Kealakekua Bay State Historical Park','Hawaii Division of State Parks',true),
 ('two-step',null,'https://www.nps.gov/puho/planyourvisit/snorkeling.htm','Snorkeling at Honaunau Bay','National Park Service',true),
 ('kahaluu-beach-park',null,'https://www.hawaii-guide.com/big-island/beaches/kahaluu-beach-park','Kahaluu Beach Park','Hawaii Guide',false),
 ('la-jolla-shores-leopard-sharks',null,'https://www.sdcoastkeeper.org/blog/snorkel-with-the-leopard-sharks-in-la-jolla-shores/','Snorkel with the Leopard Sharks in La Jolla Shores','San Diego Coastkeeper',false),
 ('lovers-cove',null,'https://wildlife.ca.gov/Conservation/Marine/MPAs/Lovers-Cove','Lover''s Cove State Marine Conservation Area','California Department of Fish and Wildlife',true),
 ('casino-point-dive-park',null,'https://wildlife.ca.gov/Conservation/Marine/MPAs/Casino-Point','Casino Point State Marine Conservation Area','California Department of Fish and Wildlife',true),
 ('casino-point-dive-park',null,'https://catalinadiverssupply.com/post/where-to-snorkel-on-catalina-island','Where to snorkel on Catalina Island','Catalina Divers Supply',false),
 ('biscayne-national-park',null,'https://www.biscaynenationalparkinstitute.org/paddling/snorkel-paddle-eco-adventure/','Snorkel and Paddle Eco-Adventure','Biscayne National Park Institute',true),
 ('emerald-reef',null,'https://www.boatsetter.com/boating-resources/best-spots-in-miami-for-snorkeling','Best spots in Miami for snorkeling','Boatsetter',false),
 ('bill-baggs-cape-florida',null,'https://www.floridastateparks.org/parks-and-trails/bill-baggs-cape-florida-state-park','Bill Baggs Cape Florida State Park','Florida State Parks',true),
 ('reefline-miami-beach',null,'https://www.timeout.com/miami/news/a-new-underwater-sculpture-park-in-miami-beach-is-working-to-help-coral-thrive-052125','A new underwater sculpture park in Miami Beach','Time Out Miami',false),
 (null,'bnpi-snorkel-paddle','https://www.biscaynenationalparkinstitute.org/paddling/snorkel-paddle-eco-adventure/','Snorkel and Paddle Eco-Adventure','Biscayne National Park Institute',true),
 (null,'crf-coral-nursery-snorkel','https://www.greetwell.com/us/direct/coral-restoration-dive-snorkel-key-largo','Coral Restoration Dive & Snorkel Program in Key Largo','Greetwell',false),
 (null,'mote-community-restoration','https://www.active.com/key-largo-fl/biology/classes/key-largo-scubapro-mote-community-coral-reef-full-dive-restoration-program-2026-107814505','Mote Community Coral Reef Restoration Program','Active.com',false),
 (null,'lmc-guided-turtle-walk','https://marinelife.org/program/guided-turtle-walk/','Guided Turtle Walk','Loggerhead Marinelife Center',true),
 (null,'olowalu-biologist-shore-snorkel','https://www.aaa.com/tripcanvas/thing-to-do/marine-biologist-guided-snorkel-tour-from-shore-at-turtle-town-339602P1','Marine Biologist Guided Snorkel Tour','AAA TripCanvas',false),
 (null,'eco-tours-maui-sea-scooter','https://www.travelocity.com/things-to-do/eco-sea-scooter-beach-entry.a3640984.activity-details','Eco Sea Scooter Guided Beach Tour From Kapalua Bay','Travelocity',false),
 (null,'kahaluu-reef-teach','https://www.hawaii-guide.com/big-island/beaches/kahaluu-beach-park','Kahaluu Beach Park','Hawaii Guide',false),
 (null,'kealakekua-kayak-kona-boys','https://dlnr.hawaii.gov/dsp/parks/hawaii/kealakekua-bay-state-historical-park','Permitted kayak vendors, Kealakekua Bay','Hawaii Division of State Parks',true),
 (null,'kealakekua-kayak-adventures-in-paradise','https://dlnr.hawaii.gov/dsp/parks/hawaii/kealakekua-bay-state-historical-park','Permitted kayak vendors, Kealakekua Bay','Hawaii Division of State Parks',true),
 (null,'hbk-leopard-shark-encounter','https://bikeandkayaktours.com/the-leopard-sharks-are-back-mid-june-is-the-start-of-the-leopard-shark-snorkeling-season/','Leopard shark snorkeling season','Hike Bike Kayak',false),
 (null,'catalina-guided-snorkel','https://catalinadiverssupply.com/post/where-to-snorkel-on-catalina-island','Where to snorkel on Catalina Island','Catalina Divers Supply',false),
 (null,'hanauma-shuttle-guaranteed-entry','https://www.hawaii-guide.com/oahu/sights/hanauma-bay-reservations','Hanauma Bay Reservations 2026','Hawaii Guide',false)
) as v(spot, exp, url, title, pub, official)
left join spots s on s.slug = v.spot
left join experiences e on e.slug = v.exp;
