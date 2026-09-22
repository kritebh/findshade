import { JsonLd } from "@/components/JsonLd";
import { MatchColumns } from "@/components/MatchColumns";
import { findExactHex } from "@/lib/catalog";
import { normalizeHex } from "@/lib/color";
import { matchHex } from "@/lib/server-match";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

function parseHexParam(hex: string) {
  return normalizeHex(hex);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hex: string }>;
}): Promise<Metadata> {
  const { hex } = await params;
  const normalized = parseHexParam(hex);
  if (!normalized) return { title: "Invalid colour" };
  const title = `Closest Asian Paints and Birla Opus colour for ${normalized}`;
  const description = `CIEDE2000 shortlist of Asian Paints and Birla Opus shade codes nearest to ${normalized}. Unofficial digital match — sample on the wall.`;
  return {
    title,
    description,
    alternates: { canonical: `/hex/${normalized.slice(1).toLowerCase()}` },
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/og?hex=${normalized.slice(1).toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [
        {
          url: `/og?hex=${normalized.slice(1).toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function HexPage({
  params,
}: {
  params: Promise<{ hex: string }>;
}) {
  const { hex } = await params;
  const normalized = parseHexParam(hex);
  if (!normalized) notFound();

  const matches = matchHex(normalized, 4);
  const exact = findExactHex(normalized);
  const hexSlug = normalized.slice(1).toLowerCase();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Closest paint codes for ${normalized}`,
          url: absoluteUrl(`/hex/${hexSlug}`),
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: absoluteUrl("/"),
          },
        }}
      />
      <div className="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)] md:items-end">
        <div
          className="h-32 rounded-[2rem] border border-black/5 md:h-40"
          style={{ backgroundColor: normalized }}
        />
        <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
          {normalized}
        </h1>
      </div>

      {exact.length > 0 ? (
        <p className="mt-6 text-sm">
          Exact catalogue hex:{" "}
          {exact.map((shade, index) => (
            <span key={`${shade.brand}-${shade.slug}`}>
              {index > 0 ? ", " : ""}
              <Link
                href={`/${shade.brand}/${shade.slug}`}
                className="underline"
              >
                {shade.brandName} {shade.code}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      <div className="mt-10">
        <MatchColumns matches={matches} />
      </div>
    </div>
  );
}
