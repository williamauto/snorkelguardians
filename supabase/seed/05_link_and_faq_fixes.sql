-- Every page needs 3+ inbound links (playbook 12.5). Add breadcrumb and hub links.

-- spot -> state (breadcrumb level)
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select sp.id, stp.id, 'parent', 'Snorkeling in ' || st.name, 1
from pages sp join regions r on r.id = sp.region_id
join regions st on st.id = r.parent_id
join pages stp on stp.region_id = st.id and stp.page_type = 'state'
where sp.page_type = 'spot'
on conflict do nothing;

-- state -> every spot in it (hub ItemList)
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select stp.id, sp.id, 'child', regexp_replace(s.name, '\s*\(.*\)$', '') || ' snorkeling', 10 + coalesce(sp.priority, 9)
from pages sp join spots s on s.id = sp.spot_id
join regions r on r.id = s.region_id
join pages stp on stp.region_id = r.parent_id and stp.page_type = 'state'
where sp.page_type = 'spot'
on conflict do nothing;

-- encounter hubs <- their state/region pages
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select hub.id, ep.id, 'related', ep.h1, 20
from pages ep
join regions er on er.id = ep.region_id
join pages hub on hub.region_id in (er.id, er.parent_id) and hub.page_type in ('state', 'region')
where ep.page_type = 'encounter'
on conflict do nothing;

-- turtle hub <- every Hawaii island page
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select rp.id, ep.id, 'related', 'Snorkel with turtles in Hawaii', 20
from pages ep, pages rp join regions r on r.id = rp.region_id join regions st on st.id = r.parent_id
where ep.url_path = '/encounters/snorkel-with-turtles-hawaii/' and rp.page_type = 'region' and st.slug = 'hawaii'
on conflict do nothing;

-- leopard shark hub <- La Jolla Cove and the sea caves
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select sp.id, ep.id, 'related', 'Snorkel with leopard sharks in La Jolla', 6
from pages ep, pages sp join spots s on s.id = sp.spot_id
where ep.url_path = '/encounters/leopard-sharks-la-jolla/' and s.slug in ('la-jolla-cove', 'la-jolla-sea-caves')
on conflict do nothing;

-- home -> encounter hubs
insert into page_links (from_page_id, to_page_id, role, anchor_text, sort_order)
select h.id, ep.id, 'child', ep.h1, 10
from pages h, pages ep
where h.url_path = '/' and ep.page_type = 'encounter'
on conflict do nothing;

-- Friendlier cost answers for free spots
update faq_items f set answer = 'It''s free: there is no entry fee.' || coalesce(' Parking: ' || s.parking_text, '')
from pages p join spots s on s.id = p.spot_id
where f.page_id = p.id and f.sort_order = 2 and s.entry_fee_text = 'Free';
