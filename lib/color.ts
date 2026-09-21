import type { MatchQuality, MatchRef, RankedMatch, Shade } from "./types";

const D65 = { x: 0.95047, y: 1, z: 1.08883 };

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, "").toUpperCase();
  if (/^[0-9A-F]{3}$/.test(value)) {
    return `#${value
      .split("")
      .map((ch) => ch + ch)
      .join("")}`;
  }
  if (/^[0-9A-F]{6}$/.test(value)) return `#${value}`;
  return null;
}

export function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function srgbToLinear(c: number) {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;
  const eps = 216 / 24389;
  const kappa = 24389 / 27;
  const f = (t: number) => (t > eps ? Math.cbrt(t) : (kappa * t + 16) / 116);
  const fx = f(x / D65.x);
  const fy = f(y / D65.y);
  const fz = f(z / D65.z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function hexToLab(hex: string): [number, number, number] | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToLab(rgb.r, rgb.g, rgb.b);
}

function hypot(a: number, b: number) {
  return Math.sqrt(a * a + b * b);
}

export function deltaE2000(
  lab1: [number, number, number],
  lab2: [number, number, number],
) {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;
  const avgL = (l1 + l2) / 2;
  const c1 = hypot(a1, b1);
  const c2 = hypot(a2, b2);
  const avgC = (c1 + c2) / 2;
  const g = 0.5 * (1 - Math.sqrt(avgC ** 7 / (avgC ** 7 + 25 ** 7)));
  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;
  const c1p = hypot(a1p, b1);
  const c2p = hypot(a2p, b2);
  const avgCp = (c1p + c2p) / 2;
  const hue = (ap: number, bp: number, cp: number) => {
    if (cp === 0) return 0;
    const h = (Math.atan2(bp, ap) * 180) / Math.PI;
    return h < 0 ? h + 360 : h;
  };
  const h1p = hue(a1p, b1, c1p);
  const h2p = hue(a2p, b2, c2p);
  const dLp = l2 - l1;
  const dCp = c2p - c1p;
  let dhp = 0;
  if (c1p * c2p !== 0) {
    let dh = h2p - h1p;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
    dhp = 2 * Math.sqrt(c1p * c2p) * Math.sin((dh * Math.PI) / 360);
  }
  let avgHp = h1p + h2p;
  if (c1p * c2p !== 0 && Math.abs(h1p - h2p) > 180) {
    avgHp += avgHp < 360 ? 360 : -360;
  }
  avgHp = c1p * c2p !== 0 ? avgHp / 2 : avgHp;
  const t =
    1 -
    0.17 * Math.cos(((avgHp - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * avgHp * Math.PI) / 180) +
    0.32 * Math.cos(((3 * avgHp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * avgHp - 63) * Math.PI) / 180);
  const sl = 1 + (0.015 * (avgL - 50) ** 2) / Math.sqrt(20 + (avgL - 50) ** 2);
  const sc = 1 + 0.045 * avgCp;
  const sh = 1 + 0.015 * avgCp * t;
  const dTheta = 30 * Math.exp(-(((avgHp - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(avgCp ** 7 / (avgCp ** 7 + 25 ** 7));
  const rt = -Math.sin((2 * dTheta * Math.PI) / 180) * rc;
  return Math.sqrt(
    (dLp / sl) ** 2 +
      (dCp / sc) ** 2 +
      (dhp / sh) ** 2 +
      rt * (dCp / sc) * (dhp / sh),
  );
}

export function matchQuality(deltaE: number): MatchQuality {
  if (deltaE < 2) {
    return {
      key: "very-close",
      label: "Very close digitally",
      detail: "Hard to tell apart on a calibrated screen. Still sample on the wall.",
    };
  }
  if (deltaE < 5) {
    return {
      key: "close",
      label: "Useful substitute",
      detail: "A close digital stand-in. Check undertone in your room light.",
    };
  }
  if (deltaE < 10) {
    return {
      key: "noticeable",
      label: "Noticeable difference",
      detail: "Same neighbourhood of colour, not a match. Compare physical cards.",
    };
  }
  return {
    key: "nearest",
    label: "Nearest available — not a close match",
    detail: "This hex sits outside typical wall-paint range, or the catalogues have no near shade.",
  };
}

export function contrastText(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#1c1914";
  const y = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return y > 0.62 ? "#1c1914" : "#f8f4ee";
}

export function rankShades(
  hex: string,
  shades: Shade[],
  limit = 5,
): RankedMatch[] {
  const lab = hexToLab(hex);
  if (!lab) return [];
  const ranked: RankedMatch[] = shades
    .map((shade) => {
      const deltaE =
        Math.round(deltaE2000(lab, shade.lab) * 100) / 100;
      const ref: MatchRef = {
        brand: shade.brand,
        slug: shade.slug,
        code: shade.code,
        name: shade.name,
        hex: shade.hex,
        deltaE,
      };
      return { ...ref, quality: matchQuality(deltaE) };
    })
    .sort((a, b) => a.deltaE - b.deltaE);
  return ranked.slice(0, limit);
}

export function sampleCanvasAverage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 2,
) {
  const { width, height } = ctx.canvas;
  const left = clamp(Math.round(x) - radius, 0, width - 1);
  const top = clamp(Math.round(y) - radius, 0, height - 1);
  const size = radius * 2 + 1;
  const w = Math.min(size, width - left);
  const h = Math.min(size, height - top);
  const data = ctx.getImageData(left, top, w, h).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  if (!count) return null;
  return rgbToHex(r / count, g / count, b / count);
}
