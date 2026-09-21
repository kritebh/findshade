export const SITE_NAME = "FindShade";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://findshade.vercel.app";

export const SITE_DESCRIPTION =
  "Find the closest Asian Paints or Birla Opus shade from a hex, RGB, or photo. Unofficial — always sample on the wall.";

export const SITE_KEYWORDS = [
  "FindShade",
  "findshade",
  "Asian Paints colour code",
  "Birla Opus shade code",
  "hex to paint colour",
  "paint colour matcher",
  "closest paint shade from photo",
  "CIEDE2000 paint match",
  "wall paint hex",
];

export const AUTHOR_NAME = "Kritebh";
export const AUTHOR_GITHUB = "https://github.com/kritebh";

export const OG_IMAGE_ALT = `${SITE_NAME} — closest Asian Paints and Birla Opus colour from hex or photo`;

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
