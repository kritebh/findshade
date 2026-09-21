#!/usr/bin/env python3
"""Normalize downloaded paint catalogues and precompute CIEDE2000 matches."""

from __future__ import annotations

import csv
import json
import math
import re
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "tmp-catalog"
OFFICIAL = ROOT / "catalogs" / "official"
DATA = ROOT / "data"

GENERIC_CODES = {
    "MAROON",
    "BLACK",
    "WHITE",
    "RED",
    "BLUE",
    "GREEN",
    "YELLOW",
    "ORANGE",
    "PURPLE",
    "PINK",
    "GRAY",
    "GREY",
}

CLIENT_KEYS = (
    "brand",
    "code",
    "slug",
    "name",
    "hex",
    "r",
    "g",
    "b",
    "family",
    "lab",
)

BRAND_META = {
    "asian-paints": {
        "name": "Asian Paints",
        "path": "asian-paints",
        "short": "AP",
    },
    "birla-opus": {
        "name": "Birla Opus",
        "path": "birla-opus",
        "short": "Opus",
    },
}


def clamp(n: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, n))


def slugify_code(code: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", code.strip().lower())
    return slug.strip("-")


def parse_hex(value: str) -> str:
    hex_value = value.strip().lstrip("#").upper()
    if len(hex_value) == 3:
        hex_value = "".join(ch * 2 for ch in hex_value)
    if not re.fullmatch(r"[0-9A-F]{6}", hex_value):
        raise ValueError(f"Invalid hex: {value}")
    return f"#{hex_value}"


def hex_to_rgb(hex_value: str) -> tuple[int, int, int]:
    h = hex_value.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def rgb_to_hsl(r: int, g: int, b: int) -> tuple[float, float, float]:
    rn, gn, bn = r / 255.0, g / 255.0, b / 255.0
    mx, mn = max(rn, gn, bn), min(rn, gn, bn)
    l = (mx + mn) / 2
    if mx == mn:
        return 0.0, 0.0, l * 100
    d = mx - mn
    s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
    if mx == rn:
        h = ((gn - bn) / d) % 6
    elif mx == gn:
        h = (bn - rn) / d + 2
    else:
        h = (rn - gn) / d + 4
    return h * 60, s * 100, l * 100


def family_from_rgb(r: int, g: int, b: int) -> tuple[str, str]:
    h, s, l = rgb_to_hsl(r, g, b)
    if l >= 92 and s <= 12:
        return "white", "Whites"
    if l <= 12 and s <= 25:
        return "black", "Blacks & near-blacks"
    if s <= 10:
        if l >= 70:
            return "grey", "Light greys"
        if l >= 40:
            return "grey", "Mid greys"
        return "grey", "Charcoals & greys"
    if l >= 78 and s <= 35 and 30 <= h <= 70:
        return "cream", "Creams & ivories"
    if 20 <= h < 70 and l >= 72:
        return "cream", "Creams & ivories"
    if h < 18 or h >= 345:
        return "red", "Reds"
    if h < 45:
        return "orange", "Oranges"
    if h < 70:
        return "yellow", "Yellows"
    if h < 165:
        return "green", "Greens"
    if h < 255:
        return "blue", "Blues"
    if h < 310:
        return "purple", "Purples"
    return "pink", "Pinks"


def srgb_to_linear(c: float) -> float:
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb_to_xyz(r: int, g: int, b: int) -> tuple[float, float, float]:
    rl, gl, bl = srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b)
    x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
    y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
    z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041
    return x, y, z


def xyz_to_lab(x: float, y: float, z: float) -> tuple[float, float, float]:
    # D65 reference white
    xn, yn, zn = 0.95047, 1.00000, 1.08883
    eps = 216 / 24389
    kappa = 24389 / 27

    def f(t: float) -> float:
        return t ** (1 / 3) if t > eps else (kappa * t + 16) / 116

    fx, fy, fz = f(x / xn), f(y / yn), f(z / zn)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def rgb_to_lab(r: int, g: int, b: int) -> tuple[float, float, float]:
    return xyz_to_lab(*rgb_to_xyz(r, g, b))


def delta_e_2000(lab1: tuple[float, float, float], lab2: tuple[float, float, float]) -> float:
    l1, a1, b1 = lab1
    l2, a2, b2 = lab2
    avg_l = (l1 + l2) / 2
    c1 = math.hypot(a1, b1)
    c2 = math.hypot(a2, b2)
    avg_c = (c1 + c2) / 2
    g = 0.5 * (1 - math.sqrt(avg_c**7 / (avg_c**7 + 25**7)))
    a1p, a2p = (1 + g) * a1, (1 + g) * a2
    c1p, c2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    avg_cp = (c1p + c2p) / 2

    def hue(ap: float, bp: float, cp: float) -> float:
        if cp == 0:
            return 0.0
        h = math.degrees(math.atan2(bp, ap))
        return h + 360 if h < 0 else h

    h1p, h2p = hue(a1p, b1, c1p), hue(a2p, b2, c2p)
    dlp = l2 - l1
    dcp = c2p - c1p
    if c1p * c2p == 0:
        dhp = 0.0
    else:
        dh = h2p - h1p
        if dh > 180:
            dh -= 360
        elif dh < -180:
            dh += 360
        dhp = 2 * math.sqrt(c1p * c2p) * math.sin(math.radians(dh) / 2)

    avg_hp = h1p + h2p
    if c1p * c2p != 0 and abs(h1p - h2p) > 180:
        avg_hp += 360 if avg_hp < 360 else -360
    avg_hp = avg_hp / 2 if c1p * c2p != 0 else avg_hp

    t = (
        1
        - 0.17 * math.cos(math.radians(avg_hp - 30))
        + 0.24 * math.cos(math.radians(2 * avg_hp))
        + 0.32 * math.cos(math.radians(3 * avg_hp + 6))
        - 0.20 * math.cos(math.radians(4 * avg_hp - 63))
    )
    sl = 1 + (0.015 * (avg_l - 50) ** 2) / math.sqrt(20 + (avg_l - 50) ** 2)
    sc = 1 + 0.045 * avg_cp
    sh = 1 + 0.015 * avg_cp * t
    dtheta = 30 * math.exp(-(((avg_hp - 275) / 25) ** 2))
    rc = 2 * math.sqrt(avg_cp**7 / (avg_cp**7 + 25**7))
    rt = -math.sin(math.radians(2 * dtheta)) * rc
    return math.sqrt(
        (dlp / sl) ** 2
        + (dcp / sc) ** 2
        + (dhp / sh) ** 2
        + rt * (dcp / sc) * (dhp / sh)
    )


def load_paintdb_asian() -> dict[str, dict]:
    path = RAW / "paintdb-colors.csv"
    by_code: dict[str, dict] = {}
    if not path.exists():
        return by_code
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if row.get("brand_slug") != "asian-paints":
                continue
            code = slugify_code(row["code"])
            by_code[code] = row
    return by_code


def normalize_name(name: str) -> str:
    cleaned = re.sub(r"\s+", " ", name).strip()
    return cleaned[:1].upper() + cleaned[1:] if cleaned else cleaned


def make_shade(brand: str, code: str, name: str, hex_value: str, extra: dict | None = None) -> dict:
    hex_value = parse_hex(hex_value)
    r, g, b = hex_to_rgb(hex_value)
    family, family_label = family_from_rgb(r, g, b)
    lab = rgb_to_lab(r, g, b)
    shade = {
        "brand": brand,
        "brandName": BRAND_META[brand]["name"],
        "code": code.strip(),
        "slug": slugify_code(code),
        "name": normalize_name(name),
        "hex": hex_value,
        "r": r,
        "g": g,
        "b": b,
        "family": family,
        "familyLabel": family_label,
        "lab": [round(lab[0], 4), round(lab[1], 4), round(lab[2], 4)],
    }
    if extra:
        shade.update(extra)
    return shade


def is_official_ap_code(code: str) -> bool:
    compact = code.strip().upper().replace(" ", "")
    if compact in GENERIC_CODES:
        return False
    return bool(
        re.fullmatch(r"\d{3,5}", compact)
        or re.fullmatch(r"[LKNMXV]\d{3,5}", compact)
        or re.fullmatch(r"0[A-Z]\d{2,4}", compact)
        or re.fullmatch(r"ML\d{3,5}", compact)
    )


def is_official_birla_code(code: str) -> bool:
    compact = code.strip().upper()
    if compact in GENERIC_CODES:
        return False
    return bool(re.fullmatch(r"[A-Z]{1,3}\s?\d{3,5}", compact.replace("  ", " ")))


def official_host_ok(brand: str, url: str) -> bool:
    if brand == "asian-paints":
        return "asianpaints.com" in url and "/colour-catalogue/" in url
    if brand == "birla-opus":
        return "birlaopus.com" in url and "/colour-catalogue/" in url
    return False


def load_previous_enrichment() -> dict[str, dict]:
    path = DATA / "catalog.json"
    if not path.exists():
        return {}
    catalog = json.loads(path.read_text())
    out: dict[str, dict] = {}
    for shade in catalog.get("shades", []):
        key = f"{shade['brand']}:{slugify_code(shade['code'])}"
        extra = {}
        if shade.get("lrv") is not None:
            extra["lrv"] = shade["lrv"]
        if shade.get("undertone"):
            extra["undertone"] = shade["undertone"]
        if extra:
            out[key] = extra
    return out


def load_official(brand: str, filename: str, collection: str, paintdb: dict[str, dict] | None = None) -> list[dict]:
    payload = json.loads((OFFICIAL / filename).read_text())
    shades: list[dict] = []
    seen_codes: set[str] = set()
    seen_slugs: set[str] = set()
    previous = load_previous_enrichment()
    for item in payload.get("shades", []):
        code = str(item.get("code") or "").strip()
        if brand == "asian-paints":
            code = code.upper()
        name = str(item.get("name") or "").strip()
        url = str(item.get("url") or "").strip()
        hex_value = str(item.get("hex") or "").strip()
        if not code or not name or not hex_value or not url:
            continue
        if code.upper() in GENERIC_CODES or name.upper() in GENERIC_CODES:
            continue
        if brand == "asian-paints" and not is_official_ap_code(code):
            continue
        if brand == "birla-opus" and not is_official_birla_code(code):
            continue
        if not official_host_ok(brand, url):
            continue
        code_key = code.upper().replace(" ", "")
        if code_key in seen_codes:
            continue
        seen_codes.add(code_key)
        extra = {
            "sourceUrl": url,
            "officialCollection": item.get("officialCollection") or collection,
        }
        family = item.get("family") or item.get("sourceFamily")
        if family:
            extra["sourceFamily"] = family
        shade = make_shade(brand, code, name, hex_value, extra=extra)
        if shade["slug"] in seen_slugs:
            shade["slug"] = f"{shade['slug']}-{shade['hex'][1:].lower()}"
        seen_slugs.add(shade["slug"])
        enrich = previous.get(f"{brand}:{slugify_code(code)}", {})
        pd = (paintdb or {}).get(slugify_code(code), {})
        lrv = enrich.get("lrv", pd.get("lrv"))
        if lrv not in (None, ""):
            shade["lrv"] = int(float(lrv))
        undertone = enrich.get("undertone") or pd.get("undertone")
        if undertone:
            shade["undertone"] = undertone
        shades.append(shade)
    return shades


def load_asian(paintdb: dict[str, dict]) -> list[dict]:
    return load_official("asian-paints", "asian-paints-official.json", "cosmos", paintdb)


def load_birla() -> list[dict]:
    return load_official("birla-opus", "birla-opus-official.json", "birla-wall-book")


def compact_ref(shade: dict, de: float) -> dict:
    return {
        "brand": shade["brand"],
        "slug": shade["slug"],
        "code": shade["code"],
        "name": shade["name"],
        "hex": shade["hex"],
        "deltaE": round(de, 2),
    }


def nearest(target: dict, candidates: list[dict], n: int, skip_self: bool = False) -> list[dict]:
    scored: list[tuple[float, dict]] = []
    tlab = tuple(target["lab"])
    for cand in candidates:
        if skip_self and cand["brand"] == target["brand"] and cand["slug"] == target["slug"]:
            continue
        de = delta_e_2000(tlab, tuple(cand["lab"]))
        scored.append((de, cand))
    scored.sort(key=lambda pair: pair[0])
    return [compact_ref(cand, de) for de, cand in scored[:n]]


def main() -> None:
    DATA.mkdir(exist_ok=True)
    paintdb = load_paintdb_asian()
    asian = load_asian(paintdb)
    birla = load_birla()
    all_shades = asian + birla

    matches: dict[str, dict] = {}
    for shade in asian:
        key = f"{shade['brand']}:{shade['slug']}"
        matches[key] = {
            "equivalents": nearest(shade, birla, 5),
            "related": nearest(shade, asian, 8, skip_self=True),
        }
    for shade in birla:
        key = f"{shade['brand']}:{shade['slug']}"
        matches[key] = {
            "equivalents": nearest(shade, asian, 5),
            "related": nearest(shade, birla, 8, skip_self=True),
        }

    families: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for shade in all_shades:
        families[shade["brand"]][shade["family"]] += 1

    catalog = {
        "version": 1,
        "sourcedAt": date.today().isoformat(),
        "sources": [
            {
                "id": "asian-paints-official-catalogue",
                "name": "Asian Paints colour catalogue (official shade pages with published hex)",
                "url": "https://www.asianpaints.com/colour-catalogue.html",
                "count": len(asian),
            },
            {
                "id": "birla-opus-official-catalogue",
                "name": "Birla Opus colour catalogue (official family pages with published RGB)",
                "url": "https://www.birlaopus.com/colour-catalogue",
                "count": len(birla),
            },
            {
                "id": "paintdb",
                "name": "PaintDB Asian Paints snapshot (CC BY 4.0) used to enrich LRV/undertone",
                "url": "https://paintdb.com/data/paintdb-colors.csv",
            },
        ],
        "brands": {
            "asian-paints": {
                **BRAND_META["asian-paints"],
                "count": len(asian),
                "families": dict(families["asian-paints"]),
            },
            "birla-opus": {
                **BRAND_META["birla-opus"],
                "count": len(birla),
                "families": dict(families["birla-opus"]),
            },
        },
        "shades": all_shades,
    }

    (DATA / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False))
    (DATA / "matches.json").write_text(json.dumps(matches, ensure_ascii=False))
    client = [{key: shade[key] for key in CLIENT_KEYS} for shade in all_shades]
    (DATA / "client-shades.json").write_text(json.dumps(client, ensure_ascii=False))
    print(
        f"Wrote {len(asian)} official Asian Paints and {len(birla)} official Birla Opus shades "
        f"({len(paintdb)} PaintDB enrichments available)."
    )


if __name__ == "__main__":
    main()
