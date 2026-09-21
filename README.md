# FindShade

**Unofficial hex, RGB, and photo matcher for the closest Asian Paints and Birla Opus shade codes.**

FindShade ranks publicly listed catalogue colours with CIEDE2000 so you get a digital shortlist — not a wall match. Always confirm with a physical sample.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**Live demo:** [https://findshade.vercel.app](https://findshade.vercel.app)

## Features

- Match any **hex** or **RGB** to the closest Asian Paints and Birla Opus codes
- Sample a colour from a **photo** in the browser (no image upload to a server)
- Dual-brand shortlists with ΔE scores and quality labels
- Browse official catalogue indexes and individual shade pages
- Cross-brand equivalents on each shade page
- Shareable match URLs for any hex

## How it works

1. Catalogues are built from official brand shade books (currently **2,219** Asian Paints and **2,322** Birla Opus shades, sourced **2026-09-20**).
2. Your input colour is converted to CIE Lab (D65).
3. Shades are ranked with **CIEDE2000** (`lib/color.ts`) — how similar two sRGB values look on screen.
4. Results are a ranked shortlist. Finish, lighting, and substrate change the dried wall, so treat codes as a starting point for sample pots.

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router), React 19 |
| UI | Tailwind CSS 4, TypeScript |
| Colour science | CIE Lab + CIEDE2000 in TypeScript |
| Catalogues | JSON under `data/`; optional Python harvest/ingest scripts |

## Getting started

### Prerequisites

- Node.js 20+
- npm (or another Node package manager)

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

### Environment

Optional:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (defaults to `https://findshade.vercel.app` in `lib/site.ts`) |

## Project layout

```
app/                 # App Router pages, icons, OG image, sitemap
components/          # Matcher, swatches, header/footer, shade/catalogue UI
lib/                 # Colour math, catalogue helpers, site constants
data/                # catalog.json, client-shades.json, matches.json
catalogs/official/   # Harvested official shade-book dumps
scripts/             # Python harvest + ingest pipelines
```

## Refreshing catalogues

Catalogue refresh is optional for day-to-day UI work. The app reads prebuilt JSON in `data/`.

1. Harvest official shade books into `catalogs/official/`:

   ```bash
   python3 scripts/harvest_official_catalogs.py
   ```

2. Normalize and write app data (and precomputed matches):

   ```bash
   python3 scripts/ingest_catalogs.py
   ```

Outputs:

- `data/catalog.json` — full catalogue metadata and shades
- `data/client-shades.json` — slim payload for browser matching
- `data/matches.json` — cross-brand / related precomputes where used

Respect brand sites’ terms and rate limits when harvesting. Prefer refreshing only when official shade books change.

## Disclaimer

FindShade is **not** affiliated with, endorsed by, or operated by Asian Paints, Birla Opus, or their parent companies. Product names and shade codes identify publicly listed catalogue colours only.

This is a digital ΔE shortlist, not a spectrophotometer or tinting formula. Always sample on the wall.

See the in-app [disclaimer](https://findshade.vercel.app/disclaimer).

## Contributing

Issues and pull requests are welcome.

- Prefer focused PRs; do not change CIEDE2000 ranking or catalogue integrity without a clear reason.
- Keep copy and branding consistent with FindShade.
- Before opening a PR, run:

  ```bash
  npm run lint
  npm run build
  ```

## Author

Built by [Kritebh](https://github.com/kritebh).

## License

No SPDX license file is published yet. The repository is source-available; redistribution terms are not defined until a `LICENSE` is added. Brand trademarks remain property of their respective owners.
