# Snorkel Guardians

Honest snorkel spot guides with live conditions and reef conservation trips — snorkelguardians.com.

## Website (Next.js)

```
app/                      routes: /, /[state]/, /[state]/[region]/, /[state]/[region]/[spot]/, /encounters/[slug]/, /about/[slug]/
  sitemap.ts, robots.ts   only published + indexable pages; AI search crawlers explicitly allowed
components/views/         one view per page type (Home, Region/State, Spot, Encounter)
components/site.tsx       header, footer, breadcrumbs, byline, FAQ, experience cards, JSON-LD
components/client.tsx     interactive parts: °F/°C toggle, "how do you want to go" tabs, Leaflet spot map + filters
lib/data.ts               loads all content from Supabase REST (cached, revalidated hourly)
lib/model.ts              pure functions: database rows -> page view models
lib/seo.ts                metadata + JSON-LD (TouristAttraction, TouristDestination, ItemList, BreadcrumbList, FAQPage)
lib/affiliate.ts          adds our Viator / GetYourGuide affiliate IDs (from env) to clean tour URLs
app/admin/                review dashboard (noindex): verify facts, publish spots, approve tours
app/api/revalidate/       admin-only: refreshes the site right after a publish
components/admin/         dashboard UI + a tiny fetch-based Supabase client (anon key + magic link)
```

## Admin dashboard (`/admin/`)

Sign in with an email magic link. Only emails listed in the `admins` table get in; everything is enforced in
the database (RLS + `is_admin()`), so the dashboard only ever uses the public anon key.

Workflow per spot: check the facts against the sources → **Verified (official / secondary)** → **Publish**.
Publishing a spot also publishes its island, state and home pages if they aren't live yet, then refreshes the site.
Every action is recorded in `review_log` (Activity tab).

Tabs: Spots (queue + editor with SEO title/meta counters and a Google preview), Nearby tours (approve/hide Viator
and GetYourGuide listings), Hub pages, Experiences, Activity.

One-time Supabase setup:
1. Authentication → URL Configuration: Site URL `https://snorkelguardians.com`, add redirect URL `https://snorkelguardians.com/admin/`.
2. Authentication → Users → **Add user** with your email (the dashboard never creates accounts).
3. Add your email to admins: `insert into admins (email) values ('you@example.com');` (lowercase).

## Nearby tours (Viator + GetYourGuide)

`provider_tours` holds curated listings (clean product URL, price from, rating, review count, duration, free
cancellation); `spot_tours` links them to spots (`goes_to`, `nearby`, `alternative`). Spot pages show linked tours
first, topped up with top-rated tours from the same island, alternating providers. Region pages show the best of the
region. Only `published` tours are visible.

- Affiliate IDs are **not** stored in the database. The site appends `GYG_PARTNER_ID` / `VIATOR_PID` at render time.
- Provider ratings are shown with attribution ("4.8 (3,985 on Viator)") and never put in schema.org markup.
- Prices and ratings were fetched on 2026-10-21; re-run the connector searches to refresh (`fetched_at`).

Every page's title, meta description, H1, H2 outline, FAQs and internal links come from the database
(`pages`, `faq_items`, `page_links`), so SEO edits never need a code change.

### Environment

See `.env.example` and `netlify.toml`.

- **Production:** `SUPABASE_URL` + `SUPABASE_ANON_KEY`. Only rows with `status = 'published'` are visible (RLS), and only
  published + `indexable` pages are indexed and listed in the sitemap.
- **Staging preview of drafts:** also set `PREVIEW_DRAFTS=1` and `SUPABASE_SERVICE_ROLE_KEY` (server-side only). Every page then
  shows a "preview" banner, gets `noindex`, and robots.txt blocks crawling.

### Run locally

```
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

## Database (Supabase)

Project: `snorkelguardians` (`jngqmkldgiqtcgnbpqmn`, us-east-1).

### Apply order

1. `supabase/migrations/20261021200000_core_schema.sql` — tables, enums, `spot_cards` view
2. `supabase/migrations/20261021200100_row_level_security.sql` — RLS (public reads published rows only)
3. `supabase/migrations/20261021200200_seo_links_reviews.sql` — SEO page fields, internal link graph, first-party reviews
4. `supabase/migrations/20261021210000_provider_tours_admin.sql` — tours, admins, review log, admin RLS + publish functions
5. `supabase/seed/01_taxonomy.sql` → `06_nearby_tours.sql` — seed data, in number order

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
