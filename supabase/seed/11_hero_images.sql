-- Hero images for every region and spot.
--
-- The images are derivatives of the licensed photo library in public/img, cropped
-- to 16:9 and colour-graded by scripts/build_headers.py. Nothing here is
-- AI-generated, and every credit line says so, because the source licences
-- (CC0, PDM, CC BY) allow the edit but not a misleading attribution.
--
-- The attribution for each image is generated from public/img/headers/credits.json
-- so the credit in the database can never drift from the credit on the file.

-- ---------- regions ----------
update regions set
  hero_image_url = v.hero_image_url,
  hero_image_credit = v.hero_image_credit
from (values
 ('hawaii', '/img/headers/region-hawaii.jpg', 'Photo: An underwater scene showing a sea turtle and several tropical fish swimming around a mo... by Faisal Ahammad · CC0 (cropped and colour-graded)'),
 ('california', '/img/headers/region-california.jpg', 'Photo: California Coast by philgear · CC0 (cropped and colour-graded)'),
 ('florida', '/img/headers/region-florida.jpg', 'Photo: Panorama of a Key West beach in Florida by David Orban from Italy · CC BY (cropped and colour-graded)'),
 ('hawaii/oahu', '/img/headers/region-hawaii-oahu.jpg', 'Photo: Snorkelers with sea turtle (Kahaluu Bay) by Vlad & Marina Butsky · CC BY (cropped and colour-graded)'),
 ('hawaii/maui', '/img/headers/region-hawaii-maui.jpg', 'Photo: File:Green Sea Turtle, Maui.jpg by Bernard Spragg. NZ · CC0 (cropped and colour-graded)'),
 ('hawaii/big-island', '/img/headers/region-hawaii-big-island.jpg', 'Photo: File:Female scuba diver swims with a young male Manta ray - Kona district, Hawaii.jpg by Steve Dunleavy from Lake Tahoe, NV, United States · CC BY (cropped and colour-graded)'),
 ('california/san-diego', '/img/headers/region-california-san-diego.jpg', 'Photo: California coast (36618554403) by Dale Cruse from San Francisco, CA, USA · CC BY (cropped and colour-graded)'),
 ('california/catalina-island', '/img/headers/region-california-catalina-island.jpg', 'Photo: Paysage de laminaires à Molène (Ifremer 00753-86498 - 44333) by Olivier Dugornay (Ifremer) · CC BY (cropped and colour-graded)'),
 ('florida/miami', '/img/headers/region-florida-miami.jpg', 'Photo: Sunset In Key Biscayne Miami Florida Travel Photography by Giuseppe Milo · CC BY (cropped and colour-graded)'),
 ('florida/south-florida', '/img/headers/region-florida-south-florida.jpg', 'Photo: Underwater scene off the coast of Humacao, Puerto Rico by edskoch · CC BY (cropped and colour-graded)'),
 ('florida/lauderdale-by-the-sea', '/img/headers/region-florida-lauderdale-by-the-sea.jpg', 'Photo: Coral Reef aerial by Photo courtesy of Sean Connolly. · CC BY (cropped and colour-graded)'),
 ('florida/florida-keys', '/img/headers/region-florida-florida-keys.jpg', 'Photo: Interdependencies of coral reef, seagrass and mangrove ecosystems by Earp, H.S., Prinz, N., Cziesielski, M.J. and Andskog, M. · CC BY (cropped and colour-graded)'),
 ('florida/florida-springs', '/img/headers/region-florida-florida-springs.jpg', 'Photo: Snorkeling Playa Funchi, Bonaire (12841334175) by SNORKELINGDIVES.COM · CC BY (cropped and colour-graded)')
) as v(path, hero_image_url, hero_image_credit)
where regions.path = v.path;

-- ---------- spots ----------
update spots set
  hero_image_url = v.hero_image_url,
  hero_image_credit = v.hero_image_credit
from (values
 ('hanauma-bay', '/img/headers/spot-hanauma-bay.jpg', 'Photo: Green Turtle Chelonia Mydas by Kris Mikael Krister · CC BY (cropped and colour-graded)'),
 ('sharks-cove', '/img/headers/spot-sharks-cove.jpg', 'Photo: Snorkeling Playa Funchi, Bonaire (12841334175) by SNORKELINGDIVES.COM · CC BY (cropped and colour-graded)'),
 ('kuilima-cove', '/img/headers/spot-kuilima-cove.jpg', 'Photo: Munching Turtle by Tilonaut · CC BY (cropped and colour-graded)'),
 ('electric-beach', '/img/headers/spot-electric-beach.jpg', 'Photo: Coral reef and colorful fish from an aquarium by mdburnette · CC0 (cropped and colour-graded)'),
 ('ko-olina-lagoons', '/img/headers/spot-ko-olina-lagoons.jpg', 'Photo: An underwater scene featuring various fish swimming around a rocky backdrop. by Rakesh Lawaju (Racase) · CC0 (cropped and colour-graded)'),
 ('turtle-canyon', '/img/headers/spot-turtle-canyon.jpg', 'Photo: A variety of bright yellow and orange tropical fish swim together in a clear blue aquar... by Faisal Ahammad · CC0 (cropped and colour-graded)'),
 ('maunalua-bay', '/img/headers/spot-maunalua-bay.jpg', 'Photo: Woman snorkelling -San Andres, Archipelago of San Andres, Colombia-9Feb2011 by ...some guy · CC BY (cropped and colour-graded)'),
 ('lanikai-beach', '/img/headers/spot-lanikai-beach.jpg', 'Photo: Shaheed Island, Andaman Islands, Tropical beach by Vyacheslav Argenberg · CC BY (cropped and colour-graded)'),
 ('makapuu-tide-pools', '/img/headers/spot-makapuu-tide-pools.jpg', 'Photo: Sea Urchin Shell detail by Nina Matthews from Australia · CC BY (cropped and colour-graded)'),
 ('maluaka-turtle-town', '/img/headers/spot-maluaka-turtle-town.jpg', 'Photo: A school of fish at the Alexander by U.S. Forest Service (source) · CC0 (cropped and colour-graded)'),
 ('ahihi-kinau', '/img/headers/spot-ahihi-kinau.jpg', 'Photo: delfín tornillo, long-snouted spinner dolphin, spinner dolphin by Gergely Nigg · CC BY (cropped and colour-graded)'),
 ('olowalu', '/img/headers/spot-olowalu.jpg', 'Photo: Ocean Floor V (33712023355) by Joe Lin from New York, NY, USA · CC BY (cropped and colour-graded)'),
 ('kapalua-bay', '/img/headers/spot-kapalua-bay.jpg', 'Photo: Natural Underwater Frame by Tilonaut · CC BY (cropped and colour-graded)'),
 ('black-rock', '/img/headers/spot-black-rock.jpg', 'Photo: That S The Spot by Tilonaut · CC BY (cropped and colour-graded)'),
 ('honolua-bay', '/img/headers/spot-honolua-bay.jpg', 'Photo: A large sand tiger shark swims majestically over a colorful coral reef in a deep blue a... by Faisal Ahammad · CC0 (cropped and colour-graded)'),
 ('molokini-crater', '/img/headers/spot-molokini-crater.jpg', 'Photo: Coral Reef off S.E. Molokai Coast ≡ Eric Tessmer, Molokai, Hawaii - panoramio by Eric Tessmer · CC BY (cropped and colour-graded)'),
 ('makena-beach', '/img/headers/spot-makena-beach.jpg', 'Photo: Perhentian Kecil, Malaysia, Tropical beach by Vyacheslav Argenberg · CC BY (cropped and colour-graded)'),
 ('wailea-beach', '/img/headers/spot-wailea-beach.jpg', 'Photo: File:Starr-121029-0399-Cocos nucifera-habit view ocean-Launiupoko Beach Park-Maui (2507... by Forest and Kim Starr · CC BY (cropped and colour-graded)'),
 ('waialea-bay', '/img/headers/spot-waialea-bay.jpg', 'Photo: (Aerial view of coastline on Hawaii Island, United States) - DPLA - 89b167478c207932509... by Carlquist, Sherwin John, 1930-2021 · CC BY (cropped and colour-graded)'),
 ('kona-manta-night-snorkel', '/img/headers/spot-kona-manta-night-snorkel.jpg', 'Photo: Manta ray swimming freely by U.S. Agency for International Development · CC0 (cropped and colour-graded)'),
 ('kahaluu-beach-park', '/img/headers/spot-kahaluu-beach-park.jpg', 'Photo: Underwater Tanning by Tilonaut · CC BY (cropped and colour-graded)'),
 ('two-step', '/img/headers/spot-two-step.jpg', 'Photo: Hawaiian Lionfish, Manta Ray Bay, Kailua-Kona, HI, USA imported from iNaturalist photo... by (c) jeyre, some rights reserved (CC BY) · CC BY (cropped and colour-graded)'),
 ('kealakekua-bay', '/img/headers/spot-kealakekua-bay.jpg', 'Photo: A serene beach scene with clear blue skies and turquoise water. A red and white jet ski... by Nasim Miah · CC0 (cropped and colour-graded)'),
 ('punaluu-black-sand-beach', '/img/headers/spot-punaluu-black-sand-beach.jpg', 'Photo: Hawaii Volcanoes National Park and Coastline (504050) (22277993129) by Robert Linsdell from St. Andrews, Canada · CC BY (cropped and colour-graded)'),
 ('manoa-bay', '/img/headers/spot-manoa-bay.jpg', 'Photo: Hilo coastline Big island Hawaii Park (45553417864) by dronepicr · CC BY (cropped and colour-graded)'),
 ('la-jolla-cove', '/img/headers/spot-la-jolla-cove.jpg', 'Photo: Plongeur évoluant au-dessus d''algues laminaires à Molène (Ifremer 00753-86499 - 44342) by Olivier Dugornay (Ifremer) · CC BY (cropped and colour-graded)'),
 ('la-jolla-shores-leopard-sharks', '/img/headers/spot-la-jolla-shores-leopard-sharks.jpg', 'Photo: leopardhai, leopardhaj, leopardihai, leopard-nugishai, leopard shark, luipaardhaai, pru... by Jonathan Whitaker · CC0 (cropped and colour-graded)'),
 ('la-jolla-sea-caves', '/img/headers/spot-la-jolla-sea-caves.jpg', 'Photo: Torpedo californica channel islands by Ed Bierman from CA, usa · CC BY (cropped and colour-graded)'),
 ('scripps-pier', '/img/headers/spot-scripps-pier.jpg', 'Photo: An underwater scene featuring various fish swimming around a rocky backdrop. by Rakesh Lawaju (Racase) · CC0 (cropped and colour-graded)'),
 ('sunset-cliffs-marine-reserve', '/img/headers/spot-sunset-cliffs-marine-reserve.jpg', 'Photo: File:Monte Rio Theater, Near the California Coast (5378916919).jpg by Tony Fischer · CC BY (cropped and colour-graded)'),
 ('casino-point-dive-park', '/img/headers/spot-casino-point-dive-park.jpg', 'Photo: Plongeur évoluant au-dessus d''un champ de laminaires à Molène (Ifremer 00753-86487 - 44... by Olivier Dugornay (Ifremer) · CC BY (cropped and colour-graded)'),
 ('descanso-beach', '/img/headers/spot-descanso-beach.jpg', 'Photo: CSU Channel Islands by Kevin · CC BY (cropped and colour-graded)'),
 ('lovers-cove', '/img/headers/spot-lovers-cove.jpg', 'Photo: Grouper in context by ackbahr · CC BY (cropped and colour-graded)'),
 ('little-eggs-beach', '/img/headers/spot-little-eggs-beach.jpg', 'Photo: deep-water frogfish, deepwater frogfish, spiny-head anglerfish, 黑紋裸身躄魚, 黑纹裸身躄鱼 by Kai Squires · CC BY (cropped and colour-graded)'),
 ('camp-cactus', '/img/headers/spot-camp-cactus.jpg', 'Photo: Natural Underwater Frame by Tilonaut · CC BY (cropped and colour-graded)'),
 ('biscayne-national-park', '/img/headers/spot-biscayne-national-park.jpg', 'Photo: File:Caspersen Beach, Manasota Key, Florida.jpg by Don Miller from Venice, United States · CC BY (cropped and colour-graded)'),
 ('emerald-reef', '/img/headers/spot-emerald-reef.jpg', 'Photo: Coral Reef aerial by Photo courtesy of Sean Connolly. · CC BY (cropped and colour-graded)'),
 ('reefline-miami-beach', '/img/headers/spot-reefline-miami-beach.jpg', 'Photo: An underwater scene featuring various fish swimming around a rocky backdrop. by Rakesh Lawaju (Racase) · CC0 (cropped and colour-graded)'),
 ('bill-baggs-cape-florida', '/img/headers/spot-bill-baggs-cape-florida.jpg', 'Photo: Bright tropical beach with turquoise water, white sand, limestone cliffs, and a sailboa... by Faisal Ahammad · CC0 (cropped and colour-graded)'),
 ('crandon-park', '/img/headers/spot-crandon-park.jpg', 'Photo: Sandkey by No machine-readable author provided. Drdisque assumed (based on copyright claims). · CC BY (cropped and colour-graded)'),
 ('datura-avenue-reef', '/img/headers/spot-datura-avenue-reef.jpg', 'Photo: Coral reef and colorful fish from an aquarium by mdburnette · CC0 (cropped and colour-graded)'),
 ('shipwreck-snorkel-trail', '/img/headers/spot-shipwreck-snorkel-trail.jpg', 'Photo: An underwater scene showing a sea turtle and several tropical fish swimming around a mo... by Faisal Ahammad · CC0 (cropped and colour-graded)'),
 ('ss-copenhagen', '/img/headers/spot-ss-copenhagen.jpg', 'Photo: Coron Island, Palawan, Philippines 1 by Ray in Manila · CC BY (cropped and colour-graded)'),
 ('john-pennekamp-state-park', '/img/headers/spot-john-pennekamp-state-park.jpg', 'Photo: Coral Reef aerial by Photo courtesy of Sean Connolly. · CC BY (cropped and colour-graded)'),
 ('dry-tortugas-national-park', '/img/headers/spot-dry-tortugas-national-park.jpg', 'Photo: Underwater Scene by Robert Caney · CC0 (cropped and colour-graded)'),
 ('seven-mile-bridge-wreck', '/img/headers/spot-seven-mile-bridge-wreck.jpg', 'Photo: That S The Spot by Tilonaut · CC BY (cropped and colour-graded)'),
 ('sand-key-lighthouse', '/img/headers/spot-sand-key-lighthouse.jpg', 'Photo: A serene beach scene with clear blue skies and turquoise water. A red and white jet ski... by Nasim Miah · CC0 (cropped and colour-graded)'),
 ('rainbow-springs', '/img/headers/spot-rainbow-springs.jpg', 'Photo: A variety of bright yellow and orange tropical fish swim together in a clear blue aquar... by Faisal Ahammad · CC0 (cropped and colour-graded)'),
 ('gilchrist-blue-springs', '/img/headers/spot-gilchrist-blue-springs.jpg', 'Photo: An underwater scene from an aquarium featuring small, colorful fish swimming in a sandy... by Faisal Ahammad · CC0 (cropped and colour-graded)'),
 ('fanning-springs', '/img/headers/spot-fanning-springs.jpg', 'Photo: Seagrass Zostera marina (Dzharylhach island) by Sofia Sadogurska · CC BY (cropped and colour-graded)'),
 ('manatee-springs', '/img/headers/spot-manatee-springs.jpg', 'Photo: A wide view of a tropical coastline shows a white sand beach with many dark rocks near... by Faisal Ahammad · CC0 (cropped and colour-graded)')
) as v(slug, hero_image_url, hero_image_credit)
where spots.slug = v.slug;

-- The same header doubles as the social card for each page. og_image_url holds a
-- site-relative path; the metadata layer resolves it against the site URL.
update pages p
set og_image_url = r.hero_image_url
from pages src join regions r on r.id = src.region_id
where p.id = src.id and p.page_type in ('state', 'region')
  and r.hero_image_url is not null
  and coalesce(p.og_image_url, '') <> r.hero_image_url;

update pages p
set og_image_url = s.hero_image_url
from pages src join spots s on s.id = src.spot_id
where p.id = src.id and p.page_type = 'spot'
  and s.hero_image_url is not null
  and coalesce(p.og_image_url, '') <> s.hero_image_url;
