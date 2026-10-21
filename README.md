# Snorkel Guardians

Honest snorkel spot guides with live conditions and reef conservation trips — snorkelguardians.com.

## Database (Supabase)

Project: `snorkelguardians` (`jngqmkldgiqtcgnbpqmn`, us-east-1).

### Apply order

1. `supabase/migrations/20261021200000_core_schema.sql` — tables, enums, `spot_cards` view
2. `supabase/migrations/20261021200100_row_level_security.sql` — RLS (public reads published rows only)
3. `supabase/migrations/20261021200200_seo_links_reviews.sql` — SEO page fields, internal link graph, first-party reviews
4. `supabase/seed/01_taxonomy.sql` → `05_link_and_faq_fixes.sql` — seed data, in number order

All of these have already been applied to the live project.

### Tables

| Table | What it holds |
|---|---|
| `regions` | State → island/city tree. `path` (e.g. `hawaii/oahu`) is the URL prefix. |
| `spots` | One row per named snorkel spot: access (shore/boat, guide, reservation, fee), hours, closed days, level, hazards, rules, protected area, answer block, webcam, Google Place ID. |
| `species`, `spot_species` | Marine life and where/how often it's seen, with the distance rule for each. |
| `organizations` | Conservation partners, operators, agencies. |
| `experiences`, `spot_experiences` | Bookable or joinable trips (coral restoration, turtle walks, guided snorkels), linked to spots. |
| `pages` | The content queue: one row per URL with target keyword, title (≤65), meta description (≤160), H1, H2 outline, schema types, status. |
| `faq_items` | FAQ per page (`FAQPage` markup). |
| `page_links` | Internal link graph (parent / child / sibling / related) with anchor text. |
| `sources` | Citation trail for every fact. |
| `spot_conditions` | Cache of live water temperature, waves and 7-day forecast (written by a scheduled job). |
| `reviews` | First-party, moderated reviews. Only approved rows are public. |

### Rules baked in

- Nothing is public until `status = 'published'` (and `indexable = true` for pages). All writes go through the service role.
- `data_confidence` on spots and experiences: `verified_official`, `verified_secondary`, `needs_verification`. Verify before publishing.
- **Review stars:** Google's review-snippet rules forbid marking up ratings aggregated from other sites (Google, TripAdvisor) and don't support stars on tourist attractions. Stars may only come from our own `reviews` on operators/experiences. Google ratings can be *shown* (with attribution, via `google_place_id`) but never put in schema markup.
- One primary keyword per page (unique index on `pages.target_keyword`).
