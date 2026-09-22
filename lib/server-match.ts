import { rankShades } from "./color";
import { shadesByBrand } from "./catalog";
import rawMatches from "@/data/matches.json";
import type { BrandId, MatchRef } from "./types";

type MatchTable = Record<
  string,
  {
    equivalents: MatchRef[];
    related: MatchRef[];
  }
>;

const matches = rawMatches as MatchTable;

export function getMatches(brand: BrandId, slug: string) {
  return (
    matches[`${brand}:${slug}`] ?? {
      equivalents: [] as MatchRef[],
      related: [] as MatchRef[],
    }
  );
}

export function matchHex(hex: string, limit = 4) {
  return {
    "asian-paints": rankShades(hex, shadesByBrand["asian-paints"], limit),
    "birla-opus": rankShades(hex, shadesByBrand["birla-opus"], limit),
  };
}
