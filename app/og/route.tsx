import { getShade } from "@/lib/catalog";
import { normalizeHex } from "@/lib/color";
import { renderPaintOg } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import type { BrandId } from "@/lib/types";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const brand = searchParams.get("brand") as BrandId | null;
  const code = searchParams.get("code");
  const hexParam = searchParams.get("hex");

  if (brand && code) {
    const shade = getShade(brand, code);
    if (shade) {
      return renderPaintOg({
        title: shade.name,
        eyebrow: shade.brandName,
        hex: shade.hex,
        code: shade.code,
      });
    }
  }

  const hex = normalizeHex(hexParam ?? "") ?? "#C4A484";
  return renderPaintOg({
    title: `Closest paint codes for ${hex}`,
    eyebrow: SITE_NAME,
    hex,
  });
}
