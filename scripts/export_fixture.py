#!/usr/bin/env python3
"""Dump the locally replayed database into supabase/dev-fixture.json (Dataset shape)."""
import json, subprocess, sys, argparse

# Table -> Dataset key, and the columns the app reads (mirrors lib/types.ts).
TABLES = {
    "regions": ("regions", ["id", "parent_id", "kind", "slug", "path", "name", "summary",
                            "lat", "lng", "map_zoom", "sort_order",
                            "hero_image_url", "hero_image_credit", "highlights",
                            "wetsuit_note", "rules_do", "rules_avoid"]),
    "spots": ("spots", ["id", "region_id", "slug", "name", "alt_names", "area_label", "lat", "lng",
                        "entry_method", "guide_required", "reservation_required", "entry_fee_usd",
                        "entry_fee_text", "reservation_text", "parking_text", "hours_text",
                        "closed_weekdays", "getting_there_text", "level", "depth_text",
                        "best_season_text", "seasonal_warning", "hazards_text", "gear_text",
                        "protected_area_name", "protected_area_type", "rules_text", "summary",
                        "answer_block", "webcam_url", "hero_image_url", "status", "data_confidence",
                        "last_checked_at", "updated_at",
                        "highlights", "natural_features", "wetsuit_recommendation", "water_temp_note",
                        "rules_do", "rules_avoid", "hero_image_credit", "conservation_note"]),
    "species": ("species", ["id", "slug", "common_name", "local_name", "scientific_name", "grp",
                            "protection_text", "distance_rule", "description"]),
    "spot_species": ("spotSpecies", ["spot_id", "species_id", "odds", "season_text"]),
    "organizations": ("organizations", ["id", "slug", "name", "kind", "is_conservation_partner",
                                        "website_url"]),
    "experiences": ("experiences", ["id", "slug", "name", "kind", "is_conservation", "organization_id",
                                    "region_id", "description", "price_from_usd", "price_text",
                                    "donation_text", "duration_text", "season_text", "min_age",
                                    "group_size_text", "meeting_point", "booking_url", "status"]),
    "spot_experiences": ("spotExperiences", ["spot_id", "experience_id", "link_kind"]),
    "pages": ("pages", ["id", "page_type", "url_path", "region_id", "spot_id", "species_id",
                        "target_keyword", "priority", "title", "meta_description", "h1", "h2_outline",
                        "author", "reviewer", "indexable", "status", "published_at",
                        "last_content_reviewed_at", "og_image_url", "updated_at"]),
    "faq_items": ("faqs", ["page_id", "question", "answer", "sort_order"]),
    "page_links": ("links", ["from_page_id", "to_page_id", "role", "anchor_text", "sort_order"]),
    "sources": ("sources", ["spot_id", "experience_id", "url", "title", "publisher", "is_official",
                            "accessed_on"]),
    "spot_conditions": ("conditions", ["spot_id", "fetched_at", "water_temp_c", "wave_height_m",
                                       "air_temp_c", "wind_kmh", "precip_prob_pct", "forecast",
                                       "source"]),
    "provider_tours": ("tours", ["id", "provider", "product_code", "title", "product_url", "region_id",
                                 "price_from_usd", "price_basis", "duration_text", "rating",
                                 "review_count", "free_cancellation", "image_url", "status",
                                 "sort_order", "fetched_at"]),
    "spot_tours": ("spotTours", ["spot_id", "tour_id", "link_kind", "sort_order"]),
}

# Draft content is invisible to the public site; the fixture is a local dev
# stand-in, so flip the editorial status to published to exercise real layouts.
PUBLISH = {"spots": "status", "pages": "status", "experiences": "status", "provider_tours": "status"}

# Indexability and the publication date are editorial decisions made in the admin
# workflow, so the fixture mirrors the published end state for local builds.
PUBLISH_EXTRA = {"pages": {"indexable": True, "published_at": "2026-01-15T00:00:00Z"}}


NULL_MARKER = "<NULL>"


def psql(sock, port, sql):
    out = subprocess.run(
        ["psql", "-h", sock, "-p", str(port), "-U", "postgres", "-d", "postgres",
         "-At", "-F", "\x1f", "-P", "null=" + NULL_MARKER, "-c", sql],
        capture_output=True, text=True, check=True)
    return [line for line in out.stdout.split("\n") if line != ""]


BOOLEAN_TYPES = {"boolean"}
INTEGER_TYPES = {"smallint", "integer", "bigint"}
FLOAT_TYPES = {"numeric", "real", "double precision"}


def column_types(sock, port):
    """Column data types for the exported tables, so values keep their JSON types."""
    names = ", ".join("'%s'" % t for t in TABLES)
    rows = psql(sock, port,
                "select table_name, column_name, data_type from information_schema.columns "
                f"where table_schema = 'public' and table_name in ({names})")
    types = {}
    for r in rows:
        table, column, dtype = r.split("\x1f")
        types.setdefault(table, {})[column] = dtype
    return types


def coerce(value, dtype):
    """Turn a psql text value into the JSON type the Supabase REST API would return."""
    if value == NULL_MARKER:
        return None
    if dtype in BOOLEAN_TYPES:
        return value == "t"
    if dtype in INTEGER_TYPES:
        return int(value)
    if dtype in FLOAT_TYPES:
        return float(value)
    return value


def parse_pg_array(value):
    """Parse a Postgres array literal, honouring quoted elements that contain commas."""
    inner = value[1:-1].strip()
    if not inner:
        return []
    out = []
    cur = []
    in_quotes = False
    i = 0
    while i < len(inner):
        ch = inner[i]
        if in_quotes:
            if ch == "\\":
                cur.append(inner[i + 1])
                i += 2
                continue
            if ch == '"':
                in_quotes = False
                i += 1
                continue
            cur.append(ch)
            i += 1
            continue
        if ch == '"':
            in_quotes = True
            i += 1
            continue
        if ch == ",":
            out.append("".join(cur).strip())
            cur = []
            i += 1
            continue
        cur.append(ch)
        i += 1
    out.append("".join(cur).strip())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sock", default="/tmp/sg-pgsock")
    ap.add_argument("--port", type=int, default=55432)
    ap.add_argument("--out", default="supabase/dev-fixture.json")
    a = ap.parse_args()

    dataset = {key: [] for key, _ in TABLES.values()}
    types = column_types(a.sock, a.port)
    for table, (key, cols) in TABLES.items():
        sel = ", ".join(f'"{c}"' for c in cols)
        rows = psql(a.sock, a.port, f'select {sel} from public.{table}')
        out = []
        for r in rows:
            vals = r.split("\x1f")
            row = {}
            for c, v in zip(cols, vals):
                dtype = types.get(table, {}).get(c)
                if v.startswith("{") and v.endswith("}"):
                    row[c] = parse_pg_array(v)
                else:
                    row[c] = coerce(v, dtype)
            if table in PUBLISH:
                row[PUBLISH[table]] = "published"
            for col, value in PUBLISH_EXTRA.get(table, {}).items():
                row[col] = value
            out.append(row)
        dataset[key] = out
        print(f"  {table:18s} {len(out)}")

    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=1)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
