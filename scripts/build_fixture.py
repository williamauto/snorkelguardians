#!/usr/bin/env python3
"""Build a local dev fixture (Dataset JSON) from the Supabase seed SQL.

Why: every content row in the live project is still `draft`, and RLS only
exposes `published` rows, so a local build shows an empty site. The seeds are
the same content that was applied to the database, so we can replay them
locally to develop and verify the UI without touching production.

Usage:  python3 scripts/build_fixture.py [out.json]
"""
import json, os, re, sys, uuid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = os.path.join(ROOT, "supabase", "seed")

NS = uuid.UUID("6f1d2c8a-0b4e-4c2f-9a3d-1b7e5c9f0000")


def det_uuid(key):
    return str(uuid.uuid5(NS, key))


# ---------------------------------------------------------------- SQL values

def split_top(s, sep=","):
    out, depth, cur, i, q = [], 0, [], 0, False
    while i < len(s):
        ch = s[i]
        if q:
            cur.append(ch)
            if ch == "'":
                if i + 1 < len(s) and s[i + 1] == "'":
                    cur.append("'"); i += 2; continue
                q = False
            i += 1; continue
        if ch == "'":
            q = True; cur.append(ch); i += 1; continue
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == sep and depth == 0:
            out.append("".join(cur).strip()); cur = []; i += 1; continue
        cur.append(ch); i += 1
    tail = "".join(cur).strip()
    if tail:
        out.append(tail)
    return out


def parse_literal(tok):
    """Postgres literal -> python value."""
    t = tok.strip()
    if t == "" or t.lower() == "null":
        return None
    low = t.lower()
    if low == "true":
        return True
    if low == "false":
        return False
    if low.startswith("date "):
        return t[5:].strip().strip("'")
    if low.startswith("timestamp "):
        return t[10:].strip().strip("'")
    if t.startswith("'") and t.endswith("'"):
        body = t[1:-1].replace("''", "'")
        # array literal?
        if body.startswith("{") and body.endswith("}"):
            inner = body[1:-1].strip()
            if not inner:
                return []
            return [parse_literal(x) for x in split_top(inner)]
        return body
    try:
        return int(t)
    except ValueError:
        pass
    try:
        return float(t)
    except ValueError:
        pass
    return t


def parse_single_tuple(s, start):
    """Parse one '(a, b, c)' tuple at s[start]. -> (fields, index_after_close)."""
    depth = 0
    i = start
    q = False
    cur = []
    while i < len(s):
        ch = s[i]
        if q:
            cur.append(ch)
            if ch == "'":
                if i + 1 < len(s) and s[i + 1] == "'":
                    cur.append("'"); i += 2; continue
                q = False
            i += 1; continue
        if ch == "'":
            q = True; cur.append(ch); i += 1; continue
        if ch == "(":
            depth += 1
            if depth == 1:
                cur = []
                i += 1; continue
        elif ch == ")":
            depth -= 1
            if depth == 0:
                return split_top("".join(cur)), i + 1
        cur.append(ch)
        i += 1
    raise ValueError("unbalanced tuple")


def parse_tuple_list(s, start):
    """Parse a comma-separated list of tuples starting at s[start]=='('. -> (rows, end)."""
    rows = []
    i = start
    while i < len(s):
        while i < len(s) and s[i] in " \t\r\n,":
            i += 1
        if i >= len(s) or s[i] != "(":
            break
        fields, i = parse_single_tuple(s, i)
        rows.append(fields)
    return rows, i


def find_values_tuple(s, from_idx):
    """Find the first top-level '(' at/after from_idx and parse the tuple list."""
    i = from_idx
    while i < len(s) and s[i] != "(":
        if s[i] == ";":
            raise ValueError("no values block")
        i += 1
    return parse_tuple_list(s, i)


# ---------------------------------------------------------------- statements

def statements(sql):
    for m in re.finditer(r"insert into\s+(\w+)\s*\(([^)]*)\)\s*(.*?);\s*(?=--|insert into|$)", sql, re.I | re.S):
        yield m.group(1).lower(), [c.strip() for c in m.group(2).split(",")], m.group(3)


def eval_expr(expr, alias, aliascols, ctx):
    """Evaluate a select expression against the alias row + joined tables."""
    e = expr.strip()
    # strip casts
    e = re.sub(r"::\s*[a-z_ ]+(\[\])?", "", e).strip()
    if e.startswith("'") and e.endswith("'"):
        return parse_literal(e)
    if "||" in e:
        parts = [p.strip() for p in e.split("||")]
        out = ""
        for p in parts:
            v = eval_expr(p, alias, aliascols, ctx)
            out += "" if v is None else str(v)
        return out
    m = re.match(r"^(\w+)\.(\w+)$", e)
    if m:
        tbl, col = m.group(1), m.group(2)
        if tbl == "v":
            return alias.get(col)
        return ctx.get(f"{tbl}.{col}")
    m = re.match(r"^date\s+'([^']+)'$", e, re.I)
    if m:
        return m.group(1)
    if e.lower() == "now()":
        return "2026-10-21T00:00:00Z"
    return e


def build():
    data = {
        "regions": [], "spots": [], "species": [], "spot_species": [],
        "organizations": [], "experiences": [], "spot_experiences": [],
        "pages": [], "faq_items": [], "page_links": [], "sources": [],
        "spot_conditions": [], "provider_tours": [], "spot_tours": [],
    }
    region_by_path = {}
    spot_by_slug = {}
    species_by_slug = {}
    org_by_slug = {}
    exp_by_slug = {}
    tour_by_code = {}
    page_by_path = {}

    for fname in sorted(os.listdir(SEED)):
        if not fname.endswith(".sql"):
            continue
        sql = open(os.path.join(SEED, fname), encoding="utf-8").read()
        for table, cols, body in statements(sql):
            body_l = body.lower()
            if body_l.strip().startswith("values"):
                rows, _ = find_values_tuple(body, body.lower().index("values") + 6)
                tuples = [r[0] if len(r) == 1 and isinstance(r[0], list) else r for r in rows]
                for t in tuples:
                    vals = [parse_literal(x) for x in t]
                    rec = dict(zip(cols, vals))
                    _store(data, table, rec, region_by_path, spot_by_slug, species_by_slug,
                           org_by_slug, exp_by_slug, tour_by_code, page_by_path)
                continue

            # select form
            sel_part, rest = _split_select(body)
            m = re.search(r"from\s*\(values", body_l)
            if not m:
                continue
            rows, end = find_values_tuple(body, m.start() + len("from (values"))
            am = re.search(r"as\s+(\w+)\s*\(([^)]*)\)", body[end:end + 400], re.I)
            alias = am.group(1)
            aliascols = [c.strip() for c in am.group(2).split(",")]
            tail = body[end:]
            join_specs = re.findall(
                r"(?:left\s+)?join\s+(\w+)\s+(\w+)\s+on\s+([^;]+?)(?=(?:left\s+)?join\s|where\s|on\s+conflict|;|$)",
                tail, re.I | re.S)
            where_m = re.search(r"where\s+(.+?)(?:on\s+conflict|;|$)", tail, re.I | re.S)
            where_txt = " ".join(where_m.group(1).split()) if where_m else ""

            exprs = split_top(sel_part)
            for tup in rows:
                vals = [parse_literal(x) for x in tup]
                if len(vals) != len(aliascols):
                    raise SystemExit(f"{fname}/{table}: tuple arity {len(vals)} != {len(aliascols)}")
                al = dict(zip(aliascols, vals))
                ctx = {}
                for jt, ja, on in join_specs:
                    on = " ".join(on.split())
                    for key, val in al.items():
                        on2 = on.replace(f"v.{key}", repr(val))
                        mm = re.match(r"^(\w+)\.(\w+)\s*=\s*(.+)$", on2)
                        if not mm:
                            continue
                        tb, col, rhs = mm.group(1), mm.group(2), mm.group(3)
                        rhs = rhs.strip().strip("'")
                        table_name = {"regions": "regions", "spots": "spots", "species": "species",
                                      "organizations": "organizations", "experiences": "experiences",
                                      "provider_tours": "provider_tours", "pages": "pages"}.get(jt)
                        if table_name is None:
                            continue
                        found = _lookup(table_name, rhs, data, region_by_path, spot_by_slug,
                                        species_by_slug, org_by_slug, exp_by_slug, tour_by_code, page_by_path)
                        if found is not None:
                            ctx[f"{ja}.{col}"] = found
                if where_txt:
                    if not _where_ok(where_txt, al, ctx):
                        continue
                rec = {}
                for col, expr in zip(cols, exprs):
                    rec[col] = eval_expr(expr, al, aliascols, ctx)
                _store(data, table, rec, region_by_path, spot_by_slug, species_by_slug,
                       org_by_slug, exp_by_slug, tour_by_code, page_by_path)
    return data


def _split_select(body):
    i = body.lower().index("select") + 6
    depth = 0
    q = False
    j = i
    while j < len(body):
        ch = body[j]
        if q:
            if ch == "'":
                if j + 1 < len(body) and body[j + 1] == "'":
                    j += 2; continue
                q = False
            j += 1; continue
        if ch == "'":
            q = True; j += 1; continue
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        elif body[j:j + 5].lower() == " from " and depth == 0:
            return body[i:j], body[j:]
        j += 1
    return body[i:], ""


def _lookup(table_name, key, data, region_by_path, spot_by_slug, species_by_slug,
            org_by_slug, exp_by_slug, tour_by_code, page_by_path):
    if table_name == "regions":
        r = region_by_path.get(key)
        return r["id"] if r else None
    if table_name == "spots":
        s = spot_by_slug.get(key)
        return s["id"] if s else None
    if table_name == "species":
        s = species_by_slug.get(key)
        return s["id"] if s else None
    if table_name == "organizations":
        o = org_by_slug.get(key)
        return o["id"] if o else None
    if table_name == "experiences":
        e = exp_by_slug.get(key)
        return e["id"] if e else None
    if table_name == "provider_tours":
        t = tour_by_code.get(key)
        return t["id"] if t else None
    if table_name == "pages":
        p = page_by_path.get(key)
        return p["id"] if p else None
    return None


def _where_ok(where_txt, al, ctx):
    for cond in re.split(r"\s+and\s+", where_txt):
        cond = cond.strip()
        m = re.match(r"^(\w+)\.(\w+)\s*=\s*'([^']*)'$", cond)
        if m:
            tb, col, val = m.group(1), m.group(2), m.group(3)
            if tb == "v":
                if (al.get(col) or "") != val:
                    return False
            else:
                if ctx.get(f"{tb}.{col}") != val:
                    return False
            continue
        return True
    return True


def _store(data, table, rec, region_by_path, spot_by_slug, species_by_slug,
           org_by_slug, exp_by_slug, tour_by_code, page_by_path):
    if table == "regions":
        rid = det_uuid("region:" + (rec.get("path") or rec.get("slug")))
        row = {
            "id": rid, "parent_id": rec.get("parent_id"), "kind": rec.get("kind"),
            "slug": rec.get("slug"), "path": rec.get("path"), "name": rec.get("name"),
            "lat": rec.get("lat"), "lng": rec.get("lng"), "map_zoom": rec.get("map_zoom"),
            "sort_order": rec.get("sort_order") or 0, "summary": rec.get("summary"),
        }
        data["regions"].append(row)
        region_by_path[row["path"]] = row
    elif table == "species":
        sid = det_uuid("species:" + rec["slug"])
        data["species"].append({
            "id": sid, "slug": rec["slug"], "common_name": rec.get("common_name"),
            "local_name": rec.get("local_name"), "scientific_name": rec.get("scientific_name"),
            "grp": rec.get("grp"), "protection_text": rec.get("protection_text"),
            "distance_rule": rec.get("distance_rule"), "description": rec.get("description"),
        })
        species_by_slug[rec["slug"]] = data["species"][-1]
    elif table == "organizations":
        oid = det_uuid("org:" + rec["slug"])
        data["organizations"].append({
            "id": oid, "slug": rec["slug"], "name": rec.get("name"), "kind": rec.get("kind"),
            "is_conservation_partner": rec.get("is_conservation_partner"),
            "website_url": rec.get("website_url"),
        })
        org_by_slug[rec["slug"]] = data["organizations"][-1]
    elif table == "spots":
        spid = det_uuid("spot:" + rec["slug"])
        row = {
            "id": spid, "region_id": rec.get("region_id"), "slug": rec["slug"], "name": rec.get("name"),
            "alt_names": rec.get("alt_names") or [], "area_label": rec.get("area_label"),
            "lat": rec.get("lat"), "lng": rec.get("lng"), "entry_method": rec.get("entry_method"),
            "guide_required": rec.get("guide_required"), "reservation_required": rec.get("reservation_required"),
            "entry_fee_usd": rec.get("entry_fee_usd"), "entry_fee_text": rec.get("entry_fee_text"),
            "reservation_text": rec.get("reservation_text"), "parking_text": rec.get("parking_text"),
            "hours_text": rec.get("hours_text"), "closed_weekdays": rec.get("closed_weekdays") or [],
            "getting_there_text": rec.get("getting_there_text"), "level": rec.get("level"),
            "depth_text": rec.get("depth_text"), "best_season_text": rec.get("best_season_text"),
            "seasonal_warning": rec.get("seasonal_warning"), "hazards_text": rec.get("hazards_text"),
            "gear_text": rec.get("gear_text"), "protected_area_name": rec.get("protected_area_name"),
            "protected_area_type": rec.get("protected_area_type"), "rules_text": rec.get("rules_text"),
            "summary": rec.get("summary"), "webcam_url": rec.get("webcam_url"),
            "hero_image_url": rec.get("hero_image_url"), "status": "published",
            "data_confidence": rec.get("data_confidence") or "needs_verification",
            "last_checked_at": rec.get("last_checked_at"), "updated_at": "2026-10-21T00:00:00Z",
        }
        data["spots"].append(row)
        spot_by_slug[row["slug"]] = row
    elif table == "spot_species":
        data["spot_species"].append({
            "spot_id": rec.get("spot_id"), "species_id": rec.get("species_id"),
            "odds": rec.get("odds"), "season_text": rec.get("season_text"),
        })
    elif table == "experiences":
        eid = det_uuid("exp:" + rec["slug"])
        data["experiences"].append({
            "id": eid, "slug": rec["slug"], "name": rec.get("name"), "kind": rec.get("kind"),
            "is_conservation": rec.get("is_conservation"), "organization_id": rec.get("organization_id"),
            "region_id": rec.get("region_id"), "description": rec.get("description"),
            "price_from_usd": rec.get("price_from_usd"), "price_text": rec.get("price_text"),
            "donation_text": rec.get("donation_text"), "duration_text": rec.get("duration_text"),
            "season_text": rec.get("season_text"), "min_age": rec.get("min_age"),
            "group_size_text": rec.get("group_size_text"), "meeting_point": rec.get("meeting_point"),
            "booking_url": rec.get("booking_url"), "status": "published",
        })
        exp_by_slug[rec["slug"]] = data["experiences"][-1]
    elif table == "spot_experiences":
        data["spot_experiences"].append({
            "spot_id": rec.get("spot_id"), "experience_id": rec.get("experience_id"),
            "link_kind": rec.get("link_kind"),
        })
    elif table == "sources":
        data["sources"].append({
            "spot_id": rec.get("spot_id"), "experience_id": rec.get("experience_id"),
            "url": rec.get("url"), "title": rec.get("title"), "publisher": rec.get("publisher"),
            "is_official": rec.get("is_official"), "accessed_on": rec.get("accessed_on") or "2026-10-21",
        })
    elif table == "provider_tours":
        tid = det_uuid("tour:" + str(rec.get("product_code")))
        data["provider_tours"].append({
            "id": tid, "provider": rec.get("provider"), "product_code": rec.get("product_code"),
            "title": rec.get("title"), "product_url": rec.get("product_url"),
            "region_id": rec.get("region_id"), "price_from_usd": rec.get("price_from_usd"),
            "price_basis": rec.get("price_basis"), "duration_text": rec.get("duration_text"),
            "rating": rec.get("rating"), "review_count": rec.get("review_count"),
            "free_cancellation": rec.get("free_cancellation"), "image_url": rec.get("image_url"),
            "status": "published", "sort_order": rec.get("sort_order") or 0,
            "fetched_at": "2026-10-21",
        })
        tour_by_code[str(rec.get("product_code"))] = data["provider_tours"][-1]
    elif table == "spot_tours":
        data["spot_tours"].append({
            "spot_id": rec.get("spot_id"), "tour_id": rec.get("tour_id"),
            "link_kind": rec.get("link_kind"), "sort_order": rec.get("sort_order") or 0,
        })
    elif table == "pages":
        pid = det_uuid("page:" + str(rec.get("url_path")))
        row = {
            "id": pid, "page_type": rec.get("page_type"), "url_path": rec.get("url_path"),
            "region_id": rec.get("region_id"), "spot_id": rec.get("spot_id"),
            "species_id": rec.get("species_id"), "target_keyword": rec.get("target_keyword"),
            "secondary_keywords": rec.get("secondary_keywords") or [],
            "search_volume": rec.get("search_volume"), "keyword_difficulty": rec.get("keyword_difficulty"),
            "search_intent": rec.get("search_intent"), "priority": rec.get("priority"),
            "title": rec.get("title"), "meta_description": rec.get("meta_description"),
            "h1": rec.get("h1"), "h2_outline": [], "author": "Snorkel Guardians team",
            "reviewer": None, "indexable": True, "status": "published",
            "published_at": "2026-10-21", "last_content_reviewed_at": "2026-10-21",
            "og_image_url": rec.get("og_image_url"), "updated_at": "2026-10-21T00:00:00Z",
        }
        data["pages"].append(row)
        page_by_path[row["url_path"]] = row
    elif table == "faq_items":
        pid = rec.get("page_id")
        if isinstance(pid, str) and not pid.startswith("page:"):
            pid = page_by_path.get(pid, {}).get("id", pid)
        data["faq_items"].append({
            "page_id": pid, "question": rec.get("question"), "answer": rec.get("answer"),
            "sort_order": rec.get("sort_order") or 0,
        })
    elif table == "page_links":
        def _pid(v):
            if v and not str(v).startswith("page:"):
                return page_by_path.get(v, {}).get("id", v)
            return v
        data["page_links"].append({
            "from_page_id": _pid(rec.get("from_page_id")), "to_page_id": _pid(rec.get("to_page_id")),
            "role": rec.get("role"), "anchor_text": rec.get("anchor_text"),
            "sort_order": rec.get("sort_order") or 0,
        })


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "supabase", "dev-fixture.json")
    d = build()
    for k, v in d.items():
        print(f"  {k:18s} {len(v)}")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(d, f, indent=1)
    print("wrote", out)
