#!/usr/bin/env python3
"""Build destination and spot header images from the licensed photo library.

Why this exists
---------------
The site needs a header image for every destination page and every snorkel spot
page. There is no image-generation model available in this project, so the
headers are *derived* from the real, already-licensed photos in `public/img/`
(Openverse: CC0 / PDM / CC BY only).

What the script does
--------------------
1. picks a source photo per destination/spot (explicit override first, then a
   per-destination pool with deterministic rotation so two pages in the same
   destination never get the same picture),
2. crops it to 16:9, applies a light colour grade and a bottom scrim so the
   headline stays readable on top,
3. writes `public/img/headers/<key>.jpg`,
4. writes `public/img/headers/credits.json` with the full provenance of every
   derived file: which photo it came from, who made it, and under which licence.

The derivative stays within the original licence (CC BY requires attribution,
which we keep in the credits file and in the `hero_image_credit` column), and
the derivative is labelled "cropped and colour-graded", never "AI generated".

Usage:  python3 scripts/build_headers.py
"""
import json
import os

from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public", "img")
OUT = os.path.join(IMG, "headers")

W, H = 1600, 900

# ---------------------------------------------------------------- source pools
# One pool per destination. The destination header takes the first free photo
# in its pool, then each spot takes the next free one.
POOLS = {
    "hawaii": ["hero-01.jpg", "hero-02.jpg", "turtle-11.jpg", "snorkeler-42.jpg", "reef-04.jpg",
               "reefscape-95.jpg", "fish-85.jpg", "snorkeler-44.jpg", "school-33.jpg",
               "dolphin2-67.jpg", "school-31.jpg", "reef-07.jpg"],
    "california": ["california-35.jpg", "california-36.jpg", "california-34.jpg", "california2-38.jpg",
                   "california2-40.jpg", "kelp-21.jpg", "kelp-20.jpg", "kelp-19.jpg",
                   "reefscape-95.jpg", "invertebrate-47.jpg", "school-32.jpg", "angler-96.jpg"],
    "florida": ["florida-30.jpg", "florida2-54.jpg", "florida2-56.jpg", "florida2-57.jpg",
                "reef2-59.jpg", "reefscape-92.jpg", "seagrass-106.jpg", "wreck-22.jpg",
                "ray-98.jpg", "sand-10.jpg", "angler-96.jpg", "beach-80.jpg"],
}

# Destination pools inherit from a state pool where it makes sense. The island and
# city lists are the *same list objects* as their state pool on purpose: the
# rotation below is keyed on the list identity, so a state, its islands and all
# their spots share one pool and never repeat a photo inside that family.
POOLS.update({
    "hawaii/oahu": POOLS["hawaii"],
    "hawaii/maui": POOLS["hawaii"],
    "hawaii/big-island": POOLS["hawaii"],
    "california/san-diego": POOLS["california"],
    "california/catalina-island": POOLS["california"],
    "florida/miami": POOLS["florida"],
    "florida/south-florida": POOLS["florida"],
    "florida/lauderdale-by-the-sea": ["reef-04.jpg", "reef2-59.jpg", "reefscape-93.jpg", "wreck-22.jpg",
                                     "angler-96.jpg", "school-32.jpg", "invertebrate-47.jpg", "fish-85.jpg"],
    "florida/florida-keys": ["reef2-59.jpg", "reefscape-92.jpg", "seagrass-106.jpg", "wreck-22.jpg",
                              "florida2-56.jpg", "florida2-57.jpg", "angler-96.jpg", "ray-98.jpg", "reef-04.jpg"],
    "florida/florida-springs": ["fish-85.jpg", "snorkeler-45.jpg", "reefscape-94.jpg", "seagrass-105.jpg",
                                 "sand-09.jpg", "sand-08.jpg", "reef-03.jpg", "invertebrate-46.jpg", "angler-97.jpg"],
})

# Region pages get a photo that says something about the place, not just "a reef".
REGION_SOURCE = {
    "hawaii": "hero-01.jpg",
    "hawaii/oahu": "snorkeler-42.jpg",
    "hawaii/maui": "turtle2-65.jpg",
    "hawaii/big-island": "manta2-70.jpg",
    "california": "california-35.jpg",
    "california/san-diego": "california-36.jpg",
    "california/catalina-island": "kelp-21.jpg",
    "florida": "florida2-57.jpg",
    "florida/miami": "florida-30.jpg",
    "florida/south-florida": "reefscape-92.jpg",
    "florida/lauderdale-by-the-sea": "reef2-59.jpg",
    "florida/florida-keys": "seagrass-106.jpg",
    "florida/florida-springs": "snorkeler-45.jpg",
}

# ---------------------------------------------------------------- overrides
# Spots where a specific photo is a much better match than the pool order.
OVERRIDE = {
    # Hawaii
    "hanauma-bay": "turtle-11.jpg",
    "turtle-canyon": "snorkeler-42.jpg",
    "molokini-crater": "reef2-62.jpg",
    "kona-manta-night-snorkel": "manta-12.jpg",
    "two-step": "manta2-71.jpg",
    "kealakekua-bay": "hero-02.jpg",
    "maluaka-turtle-town": "turtle2-65.jpg",
    "kahaluu-beach-park": "snorkeler-42.jpg",
    "sharks-cove": "snorkeler-45.jpg",
    "waialea-bay": "hawaii2-50.jpg",
    "makena-beach": "beach-78.jpg",
    "wailea-beach": "hawaii-24.jpg",
    "punaluu-black-sand-beach": "hawaii2-49.jpg",
    "manoa-bay": "hawaii2-48.jpg",
    "lanikai-beach": "beach-77.jpg",
    "makapuu-tide-pools": "urchin-101.jpg",
    # Southern California
    "la-jolla-shores-leopard-sharks": "shark2-87.jpg",
    "la-jolla-cove": "kelp-20.jpg",
    "la-jolla-sea-caves": "california2-40.jpg",
    "scripps-pier": "reefscape-95.jpg",
    "sunset-cliffs-marine-reserve": "california-36.jpg",
    "casino-point-dive-park": "kelp-19.jpg",
    "descanso-beach": "california2-38.jpg",
    "lovers-cove": "california-34.jpg",
    "little-eggs-beach": "angler-97.jpg",
    "camp-cactus": "reef-07.jpg",
    # Florida
    "biscayne-national-park": "reefscape-92.jpg",
    "emerald-reef": "reef2-59.jpg",
    "reefline-miami-beach": "reefscape-95.jpg",
    "bill-baggs-cape-florida": "sand-10.jpg",
    "crandon-park": "florida2-54.jpg",
    "shipwreck-snorkel-trail": "hero-01.jpg",
    "ss-copenhagen": "wreck-22.jpg",
    "john-pennekamp-state-park": "seagrass-106.jpg",
    "dry-tortugas-national-park": "reefscape-93.jpg",
    "seven-mile-bridge-wreck": "reef-03.jpg",
    "sand-key-lighthouse": "sand-08.jpg",
    "rainbow-springs": "snorkeler-45.jpg",
    "gilchrist-blue-springs": "fish-85.jpg",
    "fanning-springs": "reefscape-94.jpg",
    "manatee-springs": "seagrass-105.jpg",
}

# Which destination each spot belongs to, so the pool rotation stays local.
SPOT_REGION = {
    "hanauma-bay": "hawaii/oahu", "sharks-cove": "hawaii/oahu", "kuilima-cove": "hawaii/oahu",
    "electric-beach": "hawaii/oahu", "ko-olina-lagoons": "hawaii/oahu", "turtle-canyon": "hawaii/oahu",
    "maunalua-bay": "hawaii/oahu", "lanikai-beach": "hawaii/oahu", "makapuu-tide-pools": "hawaii/oahu",
    "maluaka-turtle-town": "hawaii/maui", "ahihi-kinau": "hawaii/maui", "olowalu": "hawaii/maui",
    "kapalua-bay": "hawaii/maui", "black-rock": "hawaii/maui", "honolua-bay": "hawaii/maui",
    "molokini-crater": "hawaii/maui", "makena-beach": "hawaii/maui", "wailea-beach": "hawaii/maui",
    "waialea-bay": "hawaii/big-island", "kona-manta-night-snorkel": "hawaii/big-island",
    "kahaluu-beach-park": "hawaii/big-island", "two-step": "hawaii/big-island",
    "kealakekua-bay": "hawaii/big-island", "punaluu-black-sand-beach": "hawaii/big-island",
    "manoa-bay": "hawaii/big-island",
    "la-jolla-cove": "california/san-diego", "la-jolla-shores-leopard-sharks": "california/san-diego",
    "la-jolla-sea-caves": "california/san-diego", "scripps-pier": "california/san-diego",
    "sunset-cliffs-marine-reserve": "california/san-diego",
    "casino-point-dive-park": "california/catalina-island", "descanso-beach": "california/catalina-island",
    "lovers-cove": "california/catalina-island", "little-eggs-beach": "california/catalina-island",
    "camp-cactus": "california/catalina-island",
    "biscayne-national-park": "florida/miami", "emerald-reef": "florida/miami",
    "reefline-miami-beach": "florida/miami", "bill-baggs-cape-florida": "florida/miami",
    "crandon-park": "florida/miami",
    "datura-avenue-reef": "florida/lauderdale-by-the-sea",
    "shipwreck-snorkel-trail": "florida/lauderdale-by-the-sea",
    "ss-copenhagen": "florida/lauderdale-by-the-sea",
    "john-pennekamp-state-park": "florida/florida-keys", "dry-tortugas-national-park": "florida/florida-keys",
    "seven-mile-bridge-wreck": "florida/florida-keys", "sand-key-lighthouse": "florida/florida-keys",
    "rainbow-springs": "florida/florida-springs", "gilchrist-blue-springs": "florida/florida-springs",
    "fanning-springs": "florida/florida-springs", "manatee-springs": "florida/florida-springs",
}

# Region pages that get their own header.
REGION_HEADERS = [
    ("hawaii", "hawaii"),
    ("california", "california"),
    ("florida", "florida"),
    ("hawaii/oahu", "hawaii/oahu"),
    ("hawaii/maui", "hawaii/maui"),
    ("hawaii/big-island", "hawaii/big-island"),
    ("california/san-diego", "california/san-diego"),
    ("california/catalina-island", "california/catalina-island"),
    ("florida/miami", "florida/miami"),
    ("florida/south-florida", "florida/south-florida"),
    ("florida/lauderdale-by-the-sea", "florida/lauderdale-by-the-sea"),
    ("florida/florida-keys", "florida/florida-keys"),
    ("florida/florida-springs", "florida/florida-springs"),
]


def key_for(path_or_slug):
    return path_or_slug.replace("/", "-")


def crop_169(im, focus=0.42):
    """Centre-crop to 16:9. `focus` biases vertically (0 = top, 1 = bottom)."""
    w, h = im.size
    target = W / H
    if w / h > target:
        nw = int(h * target)
        x = (w - nw) // 2
        im = im.crop((x, 0, x + nw, h))
    else:
        nh = int(w / target)
        y = int((h - nh) * focus)
        im = im.crop((0, y, w, y + nh))
    return im.resize((W, H), Image.LANCZOS)


def grade(im):
    """Light underwater grade: a touch more colour, contrast and a cool cast."""
    im = ImageEnhance.Color(im).enhance(1.16)
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Brightness(im).enhance(1.02)
    # cool the shadows slightly so the water reads as water
    r, g, b = im.split()
    r = r.point(lambda v: max(0, min(255, int(v * 0.97 + 3))))
    g = g.point(lambda v: max(0, min(255, int(v * 1.00 + 2))))
    b = b.point(lambda v: max(0, min(255, int(v * 1.04 + 4))))
    im = Image.merge("RGB", (r, g, b))
    return im


def scrim(im, strength=0.55):
    """Bottom-up dark gradient so white headline text stays legible."""
    overlay = Image.new("L", (1, H), 0)
    for y in range(H):
        t = y / (H - 1)
        overlay.putpixel((0, y), int(255 * strength * (t ** 1.6)))
    overlay = overlay.resize((W, H))
    black = Image.new("RGB", (W, H), (4, 22, 32))
    return Image.composite(black, im, overlay)


def main():
    os.makedirs(OUT, exist_ok=True)
    credits = {c["file"]: c for c in json.load(open(os.path.join(IMG, "credits.json"), encoding="utf-8"))}

    # The used-set is keyed on the *pool list identity*, not the pool name, so a
    # state and the islands that share its list also share one rotation.
    used_by_pool = {}
    out_credits = []

    def used_for(pool):
        return used_by_pool.setdefault(id(pool), set())

    def take(pool_name):
        pool = POOLS.get(pool_name, POOLS["florida"])
        used = used_for(pool)
        for f in pool:
            if f not in used:
                used.add(f)
                return f
        # pool exhausted: fall back to any unused photo in the whole library
        for f in credits:
            if f not in used:
                used.add(f)
                return f
        return pool[0]

    plan = []
    for path, pool_name in REGION_HEADERS:
        src = REGION_SOURCE.get(path)
        if src is None:
            src = take(pool_name)
        else:
            used_for(POOLS.get(pool_name, POOLS["florida"])).add(src)
        plan.append((f"region-{key_for(path)}", path, src))

    for slug, region in SPOT_REGION.items():
        pool = POOLS.get(region, POOLS["florida"])
        src = OVERRIDE.get(slug)
        if src is None or src in used_for(pool):
            # No override, or the override photo is already used in this family:
            # fall back to the rotation so no two pages in one destination match.
            src = take(region)
        else:
            used_for(pool).add(src)
        plan.append((f"spot-{slug}", slug, src))

    for key, subject, src in plan:
        c = credits.get(src)
        if c is None:
            raise SystemExit(f"missing source photo {src} for {key}")
        im = Image.open(os.path.join(IMG, src)).convert("RGB")
        im = crop_169(im)
        im = grade(im)
        im = scrim(im)
        im.save(os.path.join(OUT, f"{key}.jpg"), "JPEG", quality=84, optimize=True, progressive=True)

        lic = {"cc0": "CC0", "pdm": "Public Domain Mark", "by": "CC BY"}[c["license"]]
        title = c["title"]
        if len(title) > 90:
            title = title[:87].rstrip() + "..."
        out_credits.append({
            "file": f"{key}.jpg",
            "subject": subject,
            "source_file": src,
            "title": title,
            "creator": c["creator"],
            "license": c["license"],
            "license_name": lic,
            "license_url": c["license_url"],
            "source": c["source"],
            "source_url": c["source_url"],
            "derivation": "Cropped to 16:9, colour-graded and given a bottom scrim. No generative fill or AI synthesis.",
            "credit_line": f"Photo: {title} by {c['creator']} ({lic}). Cropped and colour-graded.",
        })

    with open(os.path.join(OUT, "credits.json"), "w", encoding="utf-8") as f:
        json.dump(out_credits, f, indent=1, ensure_ascii=False)

    print(f"wrote {len(out_credits)} headers to {OUT}")


if __name__ == "__main__":
    main()
