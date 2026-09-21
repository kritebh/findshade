export type BrandId = "asian-paints" | "birla-opus";

export type Shade = {
  brand: BrandId;
  brandName: string;
  code: string;
  slug: string;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  family: string;
  familyLabel: string;
  lab: [number, number, number];
  sourceUrl?: string | null;
  officialCollection?: "cosmos" | "birla-wall-book";
  lrv?: number;
  sourceFamily?: string;
  undertone?: string;
};

export type MatchRef = {
  brand: BrandId;
  slug: string;
  code: string;
  name: string;
  hex: string;
  deltaE: number;
};

export type MatchQuality = {
  key: "very-close" | "close" | "noticeable" | "nearest";
  label: string;
  detail: string;
};

export type RankedMatch = MatchRef & {
  quality: MatchQuality;
};

export type Catalog = {
  version: number;
  sourcedAt: string;
  sources: { id: string; name: string; count?: number; url?: string }[];
  brands: Record<
    BrandId,
    {
      name: string;
      path: string;
      short: string;
      count: number;
      families: Record<string, number>;
    }
  >;
  shades: Shade[];
};
