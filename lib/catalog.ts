import rawCatalog from "@/data/catalog.json";
import type { BrandId, Catalog, Shade } from "./types";

export const catalog = rawCatalog as Catalog;

export const brandOrder: BrandId[] = ["asian-paints", "birla-opus"];

export const shadesByBrand: Record<BrandId, Shade[]> = {
  "asian-paints": catalog.shades.filter((shade) => shade.brand === "asian-paints"),
  "birla-opus": catalog.shades.filter((shade) => shade.brand === "birla-opus"),
};

const shadeIndex = new Map(
  catalog.shades.map((shade) => [`${shade.brand}:${shade.slug}`, shade]),
);

export function getBrand(brand: BrandId) {
  return catalog.brands[brand];
}

export function getShades(brand?: BrandId) {
  return brand ? shadesByBrand[brand] : catalog.shades;
}

export function getShade(brand: BrandId, slug: string) {
  return shadeIndex.get(`${brand}:${slug}`) ?? null;
}

export function shadePath(shade: Pick<Shade, "brand" | "slug">) {
  return `/${catalog.brands[shade.brand].path}/${shade.slug}`;
}

export function familyGroups(brand: BrandId) {
  const groups = new Map<string, Shade[]>();
  for (const shade of shadesByBrand[brand]) {
    const list = groups.get(shade.family) ?? [];
    list.push(shade);
    groups.set(shade.family, list);
  }
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

export function findExactHex(hex: string) {
  const needle = hex.toUpperCase();
  return catalog.shades.filter((shade) => shade.hex === needle);
}
