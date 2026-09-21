#!/usr/bin/env python3
"""Harvest official Asian Paints and Birla Opus shade books into catalogs/official/."""

from __future__ import annotations

import html as html_lib
import json
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "catalogs" / "official"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)

BIRLA_FAMILIES = [
    "whites-and-off-whites-wall-paint-colours",
    "yellow-wall-paint-colours",
    "orange-wall-paint-colours",
    "red-wall-paint-colours",
    "purple-wall-paint-colours",
    "blue-wall-paint-colours",
    "blue-green-wall-paint-colours",
    "green-wall-paint-colours",
    "yellow-green-wall-paint-colours",
    "brown-grey-wall-paint-colours",
]

AP_CORE_FAMILIES = {
    "white-wall-colours",
    "off-white-wall-colours",
    "yellow-wall-colours",
    "orange-wall-colours",
    "red-wall-colours",
    "pink-wall-colours",
    "purple-wall-colours",
    "blue-wall-colours",
    "green-wall-colours",
    "brown-wall-colours",
    "grey-wall-colours",
}

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

HEX_FROM_LAYER = re.compile(r"shadeHexCode[^#]{0,12}#([0-9A-Fa-f]{6})")
HEX_FROM_SWATCH = re.compile(
    r'cc-swatch--colorcode"[^>]*background-color:\s*#([0-9A-Fa-f]{6})',
    re.I,
)
SKU_RE = re.compile(r'cc-swatch--desc--skucode">\s*([^<]+)', re.I)
NAME_RE = re.compile(r'cc-swatch--desc--colorName[^>]*>([^<]+)', re.I)
CODE_IN_TITLE = re.compile(r"^(.*?)\s*\(([A-Za-z0-9]+)\)")


def fetch(url: str, retries: int = 4, timeout: int = 45) -> tuple[int, bytes]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "text/html,application/json,application/xhtml+xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-IN,en;q=0.9",
        },
    )
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.status, resp.read()
        except urllib.error.HTTPError as exc:
            if exc.code in {404, 403}:
                return exc.code, exc.read() if exc.fp else b""
            if exc.code == 406:
                last_err = exc
                continue
            last_err = exc
        except Exception as exc:  # noqa: BLE001
            last_err = exc
        time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"Failed {url}: {last_err}")


def rgb_to_hex(rgb: str) -> str | None:
    m = re.search(r"rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)", rgb, re.I)
    if not m:
        return None
    r, g, b = (int(m.group(i)) for i in range(1, 4))
    if not all(0 <= n <= 255 for n in (r, g, b)):
        return None
    return f"#{r:02X}{g:02X}{b:02X}"


def parse_hex(value: str) -> str | None:
    hex_value = value.strip().lstrip("#").upper()
    if re.fullmatch(r"[0-9A-F]{6}", hex_value):
        return f"#{hex_value}"
    return None


def harvest_birla() -> list[dict]:
    by_code: dict[str, dict] = {}
    for family in BIRLA_FAMILIES:
        url = f"https://www.birlaopus.com/colour-catalogue/{family}"
        print(f"Birla family {family}")
        status, body = fetch(url)
        if status != 200:
            print(f"  skip HTTP {status}")
            continue
        text = body.decode("utf-8", errors="ignore")
        for m in re.finditer(r'<a class="colour-swatch-card[^"]*"([^>]*)>', text):
            attrs = dict(re.findall(r'([\w:-]+)="([^"]*)"', m.group(1)))
            code = html_lib.unescape(attrs.get("data-colorcode", "")).strip()
            name = html_lib.unescape(attrs.get("data-colorname", "")).strip()
            color = attrs.get("data-color", "")
            href = attrs.get("href", "")
            cfname = html_lib.unescape(attrs.get("data-cfname", "").replace("&amp;", "&")).strip()
            tone = attrs.get("data-colortone")
            hex_value = rgb_to_hex(color)
            if not code or not name or not hex_value or not href:
                continue
            if href.startswith("/"):
                source = f"https://www.birlaopus.com{href}"
            else:
                source = href
            row = {
                "brand": "birla-opus",
                "code": code,
                "name": name,
                "hex": hex_value,
                "rgb": color,
                "family": cfname,
                "tone": tone,
                "url": source,
                "officialCollection": "birla-wall-book",
            }
            existing = by_code.get(code)
            # Prefer the card whose URL lives in this family page.
            if existing is None or family in href:
                by_code[code] = row
    return sorted(by_code.values(), key=lambda r: r["code"])


def extract_ap_code(title: str) -> tuple[str, str] | None:
    title = html_lib.unescape(title or "").strip()
    m = CODE_IN_TITLE.search(title)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).strip()


def harvest_ap_inventory() -> list[dict]:
    print("Asian Paints sitemap")
    status, body = fetch("https://www.asianpaints.com/sitemap-main-colour-catalogue.xml")
    if status != 200:
        raise RuntimeError(f"AP sitemap HTTP {status}")
    locs = re.findall(r"<loc>([^<]+)</loc>", body.decode("utf-8", errors="ignore"))
    family_slugs: dict[str, str] = {}
    for loc in locs:
        m = re.search(r"/colour-catalogue/([^/]+)/([^/]+)\.html$", loc)
        if not m:
            continue
        family, slug = m.group(1), m.group(2)
        if family not in AP_CORE_FAMILIES:
            continue
        family_slugs.setdefault(family, None)

    by_code: dict[str, dict] = {}
    for family in sorted(family_slugs):
        url = (
            "https://www.asianpaints.com/content/ap/en/home/colour-catalogue/"
            f"{family}.2.json"
        )
        print(f"AP family {family}")
        status, body = fetch(url)
        if status != 200:
            print(f"  skip HTTP {status}")
            continue
        data = json.loads(body.decode("utf-8", errors="ignore"))
        for slug, page in data.items():
            if slug.startswith("jcr:") or not isinstance(page, dict):
                continue
            content = page.get("jcr:content") or {}
            if not isinstance(content, dict):
                continue
            title = (
                content.get("headingTitle")
                or content.get("pageTitle")
                or content.get("jcr:title")
                or ""
            )
            parsed = extract_ap_code(str(title))
            name = str(content.get("jcr:title") or slug).strip()
            code = None
            if parsed:
                name, code = parsed
                code = code.upper()
            source = f"https://www.asianpaints.com/colour-catalogue/{family}/{slug}.html"
            if not code:
                # Keep for a later HTML fetch keyed by URL.
                code = f"PENDING:{family}/{slug}"
            by_code[code] = {
                "brand": "asian-paints",
                "code": code,
                "name": name,
                "hex": None,
                "family": family,
                "url": source,
                "slug": slug,
                "officialCollection": "cosmos",
            }
    return list(by_code.values())


def load_existing_hex() -> dict[str, str]:
    path = ROOT / "data" / "catalog.json"
    if not path.exists():
        return {}
    catalog = json.loads(path.read_text())
    out: dict[str, str] = {}
    for shade in catalog.get("shades", []):
        if shade.get("brand") != "asian-paints":
            continue
        code = str(shade.get("code", "")).strip().upper().replace(" ", "")
        hex_value = parse_hex(str(shade.get("hex", "")))
        if code and hex_value:
            out[code] = hex_value
            out[code.lstrip("0") or "0"] = hex_value
    return out


def parse_ap_shade_html(url: str) -> dict | None:
    status, body = fetch(url)
    if status != 200:
        return None
    text = body.decode("utf-8", errors="ignore")
    hex_value = None
    m = HEX_FROM_LAYER.search(text)
    if m:
        hex_value = parse_hex(m.group(1))
    if not hex_value:
        m = HEX_FROM_SWATCH.search(text)
        if m:
            hex_value = parse_hex(m.group(1))
    code = None
    m = SKU_RE.search(text)
    if m:
        code = html_lib.unescape(m.group(1)).strip()
    if not code:
        m = re.search(r"\(([A-Za-z0-9]{3,6})\)\s*(?:House Wall|Wall Colour)", text)
        if m:
            code = m.group(1)
    name = None
    m = NAME_RE.search(text)
    if m:
        name = html_lib.unescape(m.group(1)).strip()
    if not name:
        m = re.search(r"<title>(.*?)</title>", text, re.I | re.S)
        if m:
            title = html_lib.unescape(re.sub(r"\s+", " ", m.group(1))).strip()
            parsed = extract_ap_code(title)
            if parsed:
                name, code = parsed[0], code or parsed[1]
    if not hex_value or not code:
        return None
    return {"code": code, "name": name or code, "hex": hex_value, "url": url}


def fill_ap_hex(rows: list[dict]) -> list[dict]:
    known = load_existing_hex()
    missing = []
    for row in rows:
        raw_code = row["code"]
        if raw_code.startswith("PENDING:"):
            missing.append(row)
            continue
        key = raw_code.upper().replace(" ", "")
        hex_value = known.get(key) or known.get(key.lstrip("0") or "0")
        if hex_value:
            row["hex"] = hex_value
        else:
            missing.append(row)

    print(f"AP hex from existing catalogue: {sum(1 for r in rows if r.get('hex'))}; fetching {len(missing)}")
    if not missing:
        return rows

    def job(row: dict) -> dict:
        parsed = parse_ap_shade_html(row["url"])
        if parsed:
            row["code"] = parsed["code"].upper()
            row["name"] = parsed["name"] or row["name"]
            row["hex"] = parsed["hex"]
        return row

    with ThreadPoolExecutor(max_workers=10) as pool:
        futs = [pool.submit(job, row) for row in missing]
        for i, fut in enumerate(as_completed(futs), 1):
            fut.result()
            if i % 25 == 0:
                print(f"  fetched {i}/{len(missing)}")
    return rows


def is_keepable_ap(row: dict) -> bool:
    code = str(row.get("code") or "").strip()
    name = str(row.get("name") or "").strip()
    hex_value = parse_hex(str(row.get("hex") or ""))
    url = str(row.get("url") or "")
    if not code or code.startswith("PENDING:") or not name or not hex_value:
        return False
    if code.upper() in GENERIC_CODES or name.upper() in GENERIC_CODES:
        return False
    if "asianpaints.com" not in url:
        return False
    compact = code.upper().replace(" ", "")
    return bool(
        re.fullmatch(r"\d{3,5}", compact)
        or re.fullmatch(r"[LKNMXV]\d{3,5}", compact)
        or re.fullmatch(r"0[A-Z]\d{2,4}", compact)
        or re.fullmatch(r"ML\d{3,5}", compact)
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    birla = harvest_birla()
    (OUT / "birla-opus-official.json").write_text(
        json.dumps(
            {
                "sourcedAt": date.today().isoformat(),
                "source": "https://www.birlaopus.com/colour-catalogue",
                "count": len(birla),
                "shades": birla,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    print(f"Wrote {len(birla)} official Birla Opus shades")

    asian = harvest_ap_inventory()
    asian = fill_ap_hex(asian)
    kept = [row for row in asian if is_keepable_ap(row)]
    # de-dupe by code
    uniq: dict[str, dict] = {}
    for row in kept:
        uniq[row["code"].upper().replace(" ", "")] = {
            **row,
            "hex": parse_hex(row["hex"]),
        }
    kept = sorted(uniq.values(), key=lambda r: r["code"])
    (OUT / "asian-paints-official.json").write_text(
        json.dumps(
            {
                "sourcedAt": date.today().isoformat(),
                "source": "https://www.asianpaints.com/colour-catalogue.html",
                "count": len(kept),
                "shades": kept,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    print(f"Wrote {len(kept)} official Asian Paints shades (from {len(asian)} listings)")


if __name__ == "__main__":
    main()
