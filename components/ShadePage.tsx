import { CopyButton } from "@/components/CopyButton";
import { Disclaimer } from "@/components/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { ShadeChip, Swatch } from "@/components/Swatch";
import { getBrand, getShade, getShades, shadePath } from "@/lib/catalog";
import { matchQuality } from "@/lib/color";
import { getMatches } from "@/lib/server-match";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import type { BrandId } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  brand: BrandId;
  code: string;
};

export function shadeStaticParams(brand: BrandId) {
  return getShades(brand).map((shade) => ({ code: shade.slug }));
}

export function shadeMetadata(brand: BrandId, slug: string): Metadata {
  const shade = getShade(brand, slug);
  if (!shade) return {};
  const other = getBrand(brand === "asian-paints" ? "birla-opus" : "asian-paints");
  const title = `${shade.brandName} ${shade.code} ${shade.name} — hex ${shade.hex}`;
  const description = `${shade.name} (${shade.code}) is ${shade.hex} / RGB ${shade.r}, ${shade.g}, ${shade.b}. Closest ${other.name} equivalents and related ${shade.brandName} shades. Unofficial digital match.`;
  return {
    title,
    description,
    alternates: { canonical: shadePath(shade) },
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/og?brand=${brand}&code=${slug}`,
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
          url: `/og?brand=${brand}&code=${slug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export function ShadePage({ brand, code }: Props) {
  const shade = getShade(brand, code);
  if (!shade) notFound();
  const meta = getBrand(brand);
  const otherBrand: BrandId = brand === "asian-paints" ? "birla-opus" : "asian-paints";
  const other = getBrand(otherBrand);
  const { equivalents, related } = getMatches(brand, shade.slug);
  const hexSlug = shade.hex.slice(1).toLowerCase();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${shade.brandName} ${shade.code} ${shade.name}`,
          url: absoluteUrl(shadePath(shade)),
          description: `${shade.name} hex ${shade.hex}, RGB ${shade.r}, ${shade.g}, ${shade.b}.`,
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: absoluteUrl("/"),
          },
        }}
      />
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        <Link href="/">Home</Link> /{" "}
        <Link href={`/${meta.path}`}>{meta.name}</Link> / {shade.code}
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-stretch">
        <Swatch hex={shade.hex} name={shade.name} code={shade.code} large />
        <div className="flex flex-col justify-center rounded-[2rem] border border-[var(--line)] bg-white/70 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            {meta.name} · {shade.familyLabel}
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
            {shade.name}
          </h1>
          <p className="mt-3 font-mono text-lg text-[var(--muted)]">{shade.code}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-3 py-1">
              Official catalogue shade
            </span>
            {shade.sourceUrl ? (
              <a
                href={shade.sourceUrl}
                className="underline underline-offset-4"
                rel="noopener noreferrer"
                target="_blank"
              >
                View on {meta.name}
              </a>
            ) : null}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Hex</dt>
              <dd className="font-mono">{shade.hex}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">RGB</dt>
              <dd className="font-mono">
                {shade.r}, {shade.g}, {shade.b}
              </dd>
            </div>
            {shade.lrv != null ? (
              <div>
                <dt className="text-[var(--muted)]">LRV (approx.)</dt>
                <dd>{shade.lrv}</dd>
              </div>
            ) : null}
            {shade.undertone ? (
              <div>
                <dt className="text-[var(--muted)]">Undertone</dt>
                <dd>{shade.undertone}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <CopyButton value={shade.code} />
            <Link
              href={`/hex/${hexSlug}`}
              className="text-sm underline underline-offset-4"
            >
              Match this hex in both brands
            </Link>
          </div>
          <div className="mt-6">
            <Disclaimer compact />
          </div>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-3xl tracking-tight">
          Closest {other.name} codes
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {equivalents.map((item) => {
            const quality = matchQuality(item.deltaE);
            return (
              <article
                key={item.slug}
                className="rounded-3xl border border-[var(--line)] bg-white/80 p-2 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Link href={shadePath(item)}>
                  <div
                    className="h-24 rounded-2xl"
                    style={{ backgroundColor: item.hex }}
                  />
                  <h3 className="mt-3 text-sm font-medium">{item.name}</h3>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {item.code}
                  </p>
                  <p className="mt-1 text-xs">
                    ΔE {item.deltaE.toFixed(2)} · {quality.label}
                  </p>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-3xl tracking-tight">Nearby {meta.name} shades</h2>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ShadeChip
              key={item.slug}
              hex={item.hex}
              name={item.name}
              code={item.code}
              href={shadePath(item)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
