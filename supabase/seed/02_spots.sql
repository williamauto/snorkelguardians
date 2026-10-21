-- Snorkel spots. All start as status 'draft'; data_confidence says how each was checked.
-- entry_fee_usd = adult non-resident amount where one exists.

insert into spots (
  region_id, slug, name, alt_names, area_label, lat, lng, conditions_lat, conditions_lng,
  entry_method, guide_required, reservation_required, entry_fee_usd, entry_fee_text, reservation_text,
  parking_text, hours_text, closed_weekdays, getting_there_text, level, depth_text, best_season_text,
  seasonal_warning, hazards_text, gear_text, protected_area_name, protected_area_type, rules_text,
  summary, data_confidence, last_checked_at)
select r.id, v.slug, v.name, v.alt::text[], v.area, v.lat, v.lng, v.clat, v.clng,
  v.entry::entry_method, v.guide, v.res, v.fee::numeric, v.fee_text, v.res_text,
  v.parking, v.hours, v.closed::smallint[], v.getting, v.lvl::skill_level, v.depth, v.best,
  v.warn, v.hazards, v.gear, v.pa_name, v.pa_type, v.rules,
  v.summary, v.conf::data_confidence, date '2026-10-21'
from (values
-- ===================== OAHU =====================
('hawaii/oahu','hanauma-bay','Hanauma Bay Nature Preserve','{"Hanauma Bay"}','East Honolulu',21.2690,-157.6938,21.2620,-157.6900,
 'shore',false,true,25,'$25 per non-resident aged 13+, plus a 2.35% online fee. Kids 12 and under and Hawaii residents with ID enter free.',
 'Required for non-residents. Opens online 2 days ahead at 7:00 a.m. HST; one booking covers up to 10 people.',
 '$3 for non-residents. About 300 spaces, first come, not included in the reservation.',
 'Wednesday to Sunday from 6:45 a.m. Closed Monday, Tuesday, Dec 25 and Jan 1.','{1,2}',
 'About 15 minutes from Waikiki on Kalanianaole Highway (Hwy 72). TheBus route 22 runs from Waikiki.',
 'beginner','Shallow inner reef; deeper, clearer outer bay','Year-round. Weekday mornings are calmest and least crowded.',
 null,'In rough water avoid Witches'' Brew (right side), Toilet Bowl (left point) and the Molokai Express current near the bay mouth. Outer bay for experienced swimmers only.',
 'Snorkel gear rentals on site.','Hanauma Bay Marine Life Conservation District','MLCD',
 'Every visitor watches a short reef-protection video. No touching or feeding marine life. Reef-safe sunscreen only.',
 'A protected volcanic bay with a calm inner reef, sea turtles and 400+ fish species, 15 minutes from Waikiki.','verified_official'),

('hawaii/oahu','sharks-cove','Sharks Cove','{"Pupukea","Pupukea Marine Life Conservation District"}','North Shore',21.6545,-158.0630,21.6600,-158.0680,
 'shore',false,false,null,'Free',null,'Free parking nearby; fills early on summer days.',null,'{}',
 'On Kamehameha Highway in Pupukea, about 10 minutes past Haleiwa.',
 'intermediate','Tide pools near shore, deeper water toward the cove mouth','Calm summer days, roughly May to September.',
 'Big winter swells (roughly October to April) make the North Shore dangerous. Never enter when waves break into the cove.',
 'Sharp lava rock and surge at the entry. Wear reef shoes.','Bring your own or rent in Haleiwa.','Pupukea Marine Life Conservation District','MLCD',
 'No taking of marine life inside the MLCD.',
 'A lava-rock cove on the North Shore with arches, tide pools and turtles, flat and clear only on calm summer days.','verified_secondary'),

('hawaii/oahu','kuilima-cove','Kuilima Cove','{"Turtle Bay"}','North Shore, Turtle Bay',21.7058,-157.9985,21.7120,-157.9980,
 'shore',false,false,null,'Free',null,'Public beach access parking at Turtle Bay Resort; limited stalls.',null,'{}',
 'At Turtle Bay Resort on the northern tip of Oahu.',
 'beginner','Shallow, protected by an outer reef','Best in summer; the outer reef shelters the cove most of the year.',
 'Winter surf can push surge over the outer reef.','Stay inside the outer reef.',null,null,null,null,
 'A small cove sheltered by an outer reef at Turtle Bay, one of the calmest snorkel entries on the North Shore.','needs_verification'),

('hawaii/oahu','electric-beach','Electric Beach','{"Kahe Point Beach Park"}','West side',21.3556,-158.1310,21.3550,-158.1400,
 'shore',false,false,null,'Free',null,'Free lot at Kahe Point Beach Park.',null,'{}',
 'Across from the Kahe power plant on Farrington Highway, about 40 minutes from Waikiki.',
 'advanced','Open water over the outflow pipes','Calm mornings, year-round.',
 null,'Long swim over open water with strong currents. Never snorkel alone; use a float.',null,null,null,null,
 'A long swim out to warm-water outflow pipes that draw big fish schools, turtles and sometimes spinner dolphins.','needs_verification'),

('hawaii/oahu','ko-olina-lagoons','Ko Olina Lagoons','{"Ko Olina"}','West side',21.3340,-158.1230,21.3300,-158.1300,
 'shore',false,false,null,'Free',null,'Limited free public parking stalls at each lagoon; arrive early.',null,'{}',
 'At the Ko Olina resort area on the west side, about 40 minutes from Waikiki.',
 'beginner','Shallow, calm lagoons behind breakwaters','Year-round.',
 null,'Calm, but stay inside the lagoon; currents run outside the breakwater openings.',null,null,null,null,
 'Four calm man-made lagoons behind breakwaters, easy for kids and first-timers, with reef fish along the rock walls.','needs_verification'),

('hawaii/oahu','turtle-canyon','Turtle Canyon','{}','Off Waikiki',21.2650,-157.8350,21.2600,-157.8350,
 'boat',false,false,null,'Included in the tour price.',null,null,null,'{}',
 'Snorkel boats and catamarans leave from Waikiki and Kewalo Basin.',
 'beginner','Offshore reef; tours provide flotation','Year-round.',
 null,'Open water; stay with the crew and use the flotation provided.',null,null,null,null,
 'An offshore reef where green sea turtles visit a cleaning station, reached only by snorkel boat or catamaran from Waikiki.','needs_verification'),

('hawaii/oahu','maunalua-bay','Maunalua Bay','{}','Hawaii Kai',21.2720,-157.7300,21.2650,-157.7300,
 'boat',false,false,null,'Included in the tour price.',null,null,null,'{}',
 'Tours depart Hawaii Kai; some include transport from Waikiki.',
 'beginner','Shallow and deeper reefs; flotation provided','Year-round.',
 null,null,null,null,null,null,
 'A broad reef bay east of Diamond Head with daily green sea turtle sightings and only a couple of snorkel tour operators.','verified_secondary'),

-- ===================== MAUI =====================
('hawaii/maui','molokini-crater','Molokini Crater','{"Molokini","Molokini Shoal Marine Life Conservation District"}','Off South Maui',20.6336,-156.4963,20.6300,-156.5000,
 'boat',false,false,null,'Included in the tour price.',null,null,null,'{}',
 'Snorkel boats depart Maalaea Harbor and Kihei. Morning trips usually have the calmest water.',
 'intermediate','Clear water over a sunken crater rim; deep in the middle','Year-round, mornings.',
 null,'Open ocean with currents outside the crater. Follow the crew''s briefing.',null,'Molokini Shoal Marine Life Conservation District','MLCD',
 'Boat access only. Landing on the islet is prohibited (seabird sanctuary). No feeding fish and no taking marine life.',
 'A crescent-shaped sunken crater off South Maui with famously clear water, reached only by boat.','verified_official'),

('hawaii/maui','honolua-bay','Honolua Bay','{"Honolua-Mokuleia Bay"}','West Maui',21.0137,-156.6385,21.0180,-156.6400,
 'shore',false,false,null,'Free',null,'Roadside pull-offs on Honoapiilani Highway, then a short trail through the forest.',null,'{}',
 'North of Kapalua on Honoapiilani Highway (Hwy 30).',
 'intermediate','Reef along both sides of the bay','Summer. In winter the bay is a big-wave surf break.',
 'Winter swells make it unsafe, and water turns murky after rain.','Rocky entry; check for surf before going in.',null,'Honolua-Mokuleia Bay Marine Life Conservation District','MLCD',
 'No taking of marine life inside the MLCD.',
 'A wild, forest-backed bay in West Maui with rich coral and turtles, best on calm summer mornings.','verified_secondary'),

('hawaii/maui','black-rock','Black Rock (Puu Kekaa)','{"Kaanapali Black Rock","Puu Kekaa"}','Kaanapali',20.9265,-156.6950,20.9270,-156.7000,
 'shore',false,false,null,'Free',null,'Limited public beach access parking; paid resort parking nearby.',null,'{}',
 'At the north end of Kaanapali Beach.',
 'beginner','Wall drops from shallow sand to deeper water','Year-round; calmest in the morning.',
 null,'Current can be strong around the tip of the point.',null,null,null,null,
 'A lava point at the north end of Kaanapali Beach with turtles and reef fish along its wall, an easy entry from the sand.','needs_verification'),

('hawaii/maui','kapalua-bay','Kapalua Bay','{}','West Maui',20.9997,-156.6672,21.0000,-156.6720,
 'shore',false,false,null,'Free',null,'Small free public access lot; fills early.',null,'{}',
 'In Kapalua, at the north end of West Maui''s resort coast.',
 'beginner','Shallow reef on both points','Year-round; calmest in summer.',
 null,null,null,null,null,null,
 'A sheltered crescent bay with reef on both points, one of the easiest family snorkels in West Maui.','needs_verification'),

('hawaii/maui','olowalu','Olowalu Reef','{"Olowalu","Mile Marker 14"}','West Maui',20.8080,-156.6170,20.8000,-156.6200,
 'shore',false,false,null,'Free',null,'Roadside parking near mile marker 14 on Honoapiilani Highway.',null,'{}',
 'South of Lahaina on Honoapiilani Highway (Hwy 30), near mile marker 14.',
 'intermediate','Long, shallow reef flat with coral heads','Calm mornings, year-round.',
 null,'Very shallow over the reef at low tide; visibility drops with wind and runoff. Go with a buddy or a guide.',null,null,null,null,
 'One of Maui''s oldest and largest reefs, with turtles and coral heads, reached across a shallow sandy entry.','verified_secondary'),

('hawaii/maui','ahihi-kinau','Ahihi-Kinau Natural Area Reserve','{"Ahihi Cove","Ahihi-Kinau"}','South Maui',20.6047,-156.4385,20.6000,-156.4400,
 'shore',false,false,5,'$5 per vehicle for non-residents (card machines in the lot). Free for Hawaii residents, who still display a free pass.',null,
 'Designated stalls only; the lot fills early.','5:30 a.m. to 7:30 p.m. daily (northern section).','{}',
 'South of Makena at the end of Makena Alanui Road.',
 'intermediate','Coves and sand channels close to shore','Mornings, when the bay is calm. Skip it when waves roll straight in.',
 null,'Sharp lava entry: reef shoes required. Most of the reserve is closed to entry.',null,'Ahihi-Kinau Natural Area Reserve','Natural Area Reserve',
 'No fishing at any time. Stay in posted areas. Do not touch turtles.',
 'A lava-fringed reserve in South Maui with dense coral, turtles and clear coves. Non-resident vehicle fee; go early.','verified_secondary'),

('hawaii/maui','maluaka-turtle-town','Maluaka Beach (Turtle Town)','{"Turtle Town","Maluaka Beach"}','Makena, South Maui',20.6460,-156.4430,20.6450,-156.4480,
 'shore_or_boat',false,false,null,'Free from shore; boat tours also stop offshore.',null,'Free public lot near the beach.',null,'{}',
 'In Makena, South Maui.',
 'beginner','Reef along the south end of the beach','Year-round; mornings before the trade winds.',
 null,null,null,null,null,null,
 'A gentle Makena beach where green sea turtles feed along the reef to the south. Boat tours also stop offshore.','needs_verification'),

-- ===================== BIG ISLAND =====================
('hawaii/big-island','kealakekua-bay','Kealakekua Bay (Captain Cook Monument)','{"Kaawaloa","Captain Cook Monument"}','South Kona',19.4810,-155.9320,19.4780,-155.9350,
 'shore_or_boat',false,false,null,'No park entrance fee; tours are priced separately.',null,null,'7:00 a.m. to 8:00 p.m. daily.','{}',
 'Hike the steep Kaawaloa Trail from the highway, or join a permitted guided kayak tour or a boat tour from Kona.',
 'intermediate','Shallow coral shelf dropping to deep, clear water','Year-round; calm mornings.',
 null,'Steep, exposed hike with no restrooms or water. Pack out all trash.',null,'Kealakekua Bay State Historical Park and Marine Life Conservation District','State Historical Park + MLCD',
 'All kayaks, boats and boards need a State Parks permit to cross the bay, and permitted vessels may not land at Kaawaloa Flat. If you rent a kayak, confirm it has a valid bay-transit permit.',
 'Clear, calm water and dense coral below the Captain Cook Monument. Reach it by a steep hike, a permitted kayak tour or a boat.','verified_official'),

('hawaii/big-island','two-step','Two Step (Honaunau Bay)','{"Honaunau Bay","Two Step"}','South Kona',19.4230,-155.9135,19.4220,-155.9180,
 'shore',false,false,null,'Free. The fee kiosk is for the national historical park, not the boat ramp.',null,
 'Very small. Park outside the national park gate so park visitors have space; fills by midday.',null,'{}',
 'At the Honaunau Bay boat ramp, next to Puuhonua o Honaunau National Historical Park; the access road is one-way.',
 'intermediate','Lava steps straight into deep water','Calm mornings, year-round.',
 null,'Boat traffic at the ramp; careful entry and exit on the lava ledges.',null,null,null,
 'Do not enter the water at Keoneele Cove inside the park (a cultural site). Do not use park restrooms to change or rinse off.',
 'Natural lava steps drop straight into a clear coral garden next to Puuhonua o Honaunau, with turtles and often spinner dolphins nearby.','verified_official'),

('hawaii/big-island','kahaluu-beach-park','Kahaluu Beach Park','{"Kahaluu Bay"}','Keauhou, Kona',19.5795,-155.9670,19.5780,-155.9700,
 'shore',false,false,null,'Free beach access. Non-residents pay for parking (since December 2022); residents with ID park free.',null,
 'Lot fills early on weekends and cruise-ship days; overflow street parking sometimes available.',null,'{}',
 'On Alii Drive about 5 miles south of Kailua-Kona.',
 'beginner','Shallow, reef-protected pond','Year-round.',
 null,'Rip current at the north end where the reef opens. Stay inside the marked snorkel zone.',null,null,null,
 'Stay 10 ft from turtles. Do not stand on coral.',
 'A shallow, reef-protected pond in Kona with turtles almost daily and Reef Teach volunteers on the beach.','verified_secondary'),

('hawaii/big-island','kona-manta-night-snorkel','Manta Ray Night Snorkel (Keauhou)','{"Manta Village","Keauhou manta site"}','Keauhou, Kona',19.5617,-155.9620,19.5600,-155.9650,
 'boat',false,false,null,'Included in the tour price.',null,null,'After dark.','{}',
 'Night boat tours leave from Keauhou Bay and Honokohau Harbor.',
 'beginner','You float at the surface holding a lit board','Year-round, after dark.',
 null,'Night ocean conditions; stay with your group and the light board.',null,null,null,
 'Float at the surface and keep your hands to yourself; let the mantas come to you.',
 'Reef manta rays feed on plankton drawn to underwater lights while snorkelers float above. Boat tours only.','needs_verification'),

('hawaii/big-island','waialea-bay','Waialea Bay (Beach 69)','{"Beach 69"}','Kohala Coast',19.9844,-155.8256,19.9850,-155.8300,
 'shore',false,false,null,null,null,null,null,'{}',
 'On the Kohala Coast north of the Waikoloa resorts.',
 'beginner','Coral close to shore','Mornings, year-round.',
 null,null,null,null,null,null,
 'A shaded Kohala Coast beach with coral and turtles close to shore, calmest in the morning.','needs_verification'),

-- ===================== SAN DIEGO =====================
('california/san-diego','la-jolla-cove','La Jolla Cove','{"San Diego-La Jolla Underwater Park"}','La Jolla',32.8506,-117.2717,32.8550,-117.2750,
 'shore',false,false,null,'Free',null,'Street parking is limited and often full; paid lots nearby.',null,'{}',
 'In La Jolla village, about 20 minutes north of downtown San Diego.',
 'intermediate','Kelp and rocky reef from shallow to deep','Late summer and early fall for the warmest water and best visibility.',
 null,'Swell and surge on the rocky entry. Cold water most of the year: wear a wetsuit.',null,'Matlahuayl State Marine Reserve (San Diego-La Jolla Underwater Park)','State Marine Reserve',
 'No taking of any marine life. Give resting sea lions and seals plenty of space.',
 'A small sandy cove in the San Diego-La Jolla Underwater Park with bright orange garibaldi, kelp and sea lions on the rocks.','verified_secondary'),

('california/san-diego','la-jolla-shores-leopard-sharks','La Jolla Shores (Leopard Sharks)','{"La Jolla Shores"}','La Jolla',32.8535,-117.2605,32.8550,-117.2620,
 'shore',false,false,null,'Free',null,'Free lot at Kellogg Park fills early in summer; street parking nearby.',null,'{}',
 'At the south end of La Jolla Shores beach, in front of the Marine Room.',
 'beginner','Shallow sandy flats','Summer, when leopard sharks gather in the warm shallows.',
 null,'Shore break at the waterline. Shuffle your feet for stingrays.',null,'Matlahuayl State Marine Reserve','State Marine Reserve',
 'No taking of marine life. Keep your distance; never touch the sharks.',
 'Harmless leopard sharks gather over the sand in summer at the south end of La Jolla Shores, an easy beach entry.','verified_secondary'),

('california/san-diego','la-jolla-sea-caves','La Jolla Sea Caves','{}','La Jolla',32.8508,-117.2680,32.8540,-117.2680,
 'boat',false,false,null,'Included in the kayak tour price.',null,null,null,'{}',
 'Guided kayak and snorkel tours launch from La Jolla Shores.',
 'beginner','Along the cliffs east of the Cove','Summer and fall; calm mornings.',
 null,'Swell surges into the caves; go with a guide.',null,'Matlahuayl State Marine Reserve','State Marine Reserve',null,
 'Seven sea caves in the cliffs east of La Jolla Cove, best seen on a guided kayak and snorkel tour.','needs_verification'),

-- ===================== CATALINA =====================
('california/catalina-island','lovers-cove','Lovers Cove','{"Lover''s Cove"}','Avalon',33.3420,-118.3197,33.3430,-118.3160,
 'shore',false,false,null,'Free',null,null,null,'{}',
 'Take the ferry to Avalon, then walk east from town along Pebbly Beach Road.',
 'beginner','Rocky reef and kelp close to shore','Summer and early fall for the warmest water.',
 null,'Rocky beach entry. Cool water: wear a wetsuit.',null,'Lover''s Cove State Marine Conservation Area','SMCA',
 'No taking of marine resources (hook-and-line fishing is allowed only from Cabrillo Mole). Fish feeding is legal here, but we ask you not to: it changes fish behavior.',
 'A rocky cove just east of Avalon with garibaldi, kelp bass and calm, clear water inside a marine conservation area.','verified_official'),

('california/catalina-island','casino-point-dive-park','Casino Point Dive Park','{"Avalon Underwater Park"}','Avalon',33.3487,-118.3253,33.3500,-118.3230,
 'shore',false,false,null,'Free',null,null,null,'{}',
 'Next to the Avalon Casino building, a short walk from the ferry.',
 'intermediate','Stairs into kelp forest, deepening quickly','Summer and early fall.',
 null,'Shared with scuba divers; stay inside the dive park and away from boat traffic.','Rentals at Catalina Divers Supply at the Casino.','Casino Point State Marine Conservation Area (No-Take)','SMCA',
 'No-take marine conservation area.',
 'Avalon''s underwater park with stairs into a kelp forest, garibaldi, horn sharks and a small wreck.','verified_secondary'),

('california/catalina-island','descanso-beach','Descanso Beach','{"Descanso Bay"}','Avalon',33.3510,-118.3290,33.3530,-118.3280,
 'shore',false,false,null,'Free beach entry; cabanas and food at the beach club cost extra.',null,null,null,'{}',
 'Just past the Avalon Casino, a short walk from town.',
 'beginner','Rocky edges of a pebbly cove','Summer and early fall.',
 null,null,null,null,null,null,
 'A pebbly beach-club cove next to the Casino with fish along the rocks and the occasional sea lion.','needs_verification'),

-- ===================== MIAMI =====================
('florida/miami','biscayne-national-park','Biscayne National Park Reefs','{"Biscayne National Park","Maritime Heritage Trail"}','Biscayne Bay',25.3900,-80.1700,25.3900,-80.1500,
 'boat',false,false,null,'No park entrance fee. Guided snorkel trips with Biscayne National Park Institute start at $209 (ages 12+).',null,null,null,'{}',
 'Trips leave from the Dante Fascell Visitor Center in Homestead. The reefs are not reachable from land.',
 'beginner','Patch reefs, shipwrecks and mangroves; snorkel vest provided','Calm, low-wind days; the captain picks the site by weather.',
 null,'Open water; fins are required and a snorkel vest is worn.',null,'Biscayne National Park','National Park',null,
 'Coral patch reefs, shipwrecks and mangroves in a mostly underwater national park, reached only by boat.','verified_official'),

('florida/miami','emerald-reef','Emerald Reef','{}','Off Key Biscayne',25.6740,-80.0990,25.6740,-80.0900,
 'boat',false,false,null,null,null,null,null,'{}',
 'About a mile east of Key Biscayne; go by charter or private boat.',
 'intermediate','10 to 20 ft','Calm, low-wind days.',
 null,'Boat traffic; always fly a dive flag.',null,null,null,null,
 'A shallow patch reef about a mile off Key Biscayne with coral, spadefish and the occasional dolphin, reached by boat.','verified_secondary'),

('florida/miami','bill-baggs-cape-florida','Bill Baggs Cape Florida State Park','{"Cape Florida"}','Key Biscayne',25.6665,-80.1560,25.6650,-80.1500,
 'shore',false,false,8,'$8 per vehicle.',null,null,'8 a.m. to sunset, every day.','{}',
 'At the southern tip of Key Biscayne, about 30 minutes from downtown Miami.',
 'beginner','Shallow, with seagrass and rocky edges','Calm, clear days with light wind.',
 null,'No lifeguards. Visibility varies with wind and tide.',null,'Bill Baggs Cape Florida State Park','State Park',null,
 'A Key Biscayne state park beach with easy, low-key shore snorkeling near the historic 1825 lighthouse.','needs_verification'),

('florida/miami','reefline-miami-beach','The ReefLine','{"ReefLine Miami Beach"}','South Beach',25.7700,-80.1290,25.7700,-80.1250,
 'shore_or_boat',false,false,null,null,null,null,null,'{}',
 'Off South Beach, Miami Beach. Access details pending.',
 null,null,null,
 null,null,null,null,null,null,
 'A planned 7-mile underwater sculpture park and artificial reef off Miami Beach, starting with coral-planted concrete cars.','needs_verification')
) as v(rpath, slug, name, alt, area, lat, lng, clat, clng, entry, guide, res, fee, fee_text, res_text,
       parking, hours, closed, getting, lvl, depth, best, warn, hazards, gear, pa_name, pa_type, rules,
       summary, conf)
join regions r on r.path = v.rpath
on conflict (region_id, slug) do nothing;

-- Hanauma Bay answer block (134-167 words)
update spots set answer_block =
'Hanauma Bay is the easiest great snorkel on Oahu, and one of the most protected. It is a volcanic bay on the southeast coast, about 15 minutes from Waikiki, managed as a nature preserve and Marine Life Conservation District. You snorkel on your own from the beach: the shallow inner reef suits beginners, while the outer bay is for experienced swimmers only. Non-residents need a reservation, which opens two days ahead at 7:00 a.m. Hawaii time, and pay $25 per person aged 13 and over, plus a small online fee. Children 12 and under and Hawaii residents with ID enter free. The preserve is open Wednesday to Sunday from 6:45 a.m. and closed every Monday and Tuesday. Expect green sea turtles, parrotfish and more than 400 fish species. Go early: parking has about 300 spaces and is not included in your reservation.'
where slug = 'hanauma-bay';
