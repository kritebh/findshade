import { ColorMatcher } from "@/components/ColorMatcher";
import { JsonLd } from "@/components/JsonLd";
import { MatchColumns } from "@/components/MatchColumns";
import { findExactHex } from "@/lib/catalog";
import { matchQuality, normalizeHex } from "@/lib/color";
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

  const matches = matchHex(normalized, 5);
  const exact = findExactHex(normalized);
  const hexSlug = normalized.slice(1).toLowerCase();
  const best = [...matches["asian-paints"], ...matches["birla-opus"]].sort(
    (a, b) => a.deltaE - b.deltaE,
  )[0];
  const quality = best ? matchQuality(best.deltaE) : null;

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
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        <Link href="/">Home</Link> / Hex {normalized}
      </p>
      <div className="mt-5 grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-end">
        <div
          className="h-48 rounded-[2rem] border border-black/5 md:h-56"
          style={{ backgroundColor: normalized }}
        />
        <div>
          <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
            Closest paint codes for {normalized}
          </h1>
          {quality ? (
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Best digital score ΔE {best.deltaE.toFixed(2)} ({quality.label}).
            </p>
          ) : null}
        </div>
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
      <section className="mt-14">
        <h2 className="font-serif text-3xl tracking-tight">
          Try another colour
        </h2>
        <div className="mt-6">
          <ColorMatcher initialHex={normalized} showResults={false} />
        </div>
      </section>
    </div>
  );
}
