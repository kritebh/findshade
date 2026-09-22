import { BrandShadeGrid } from "@/components/BrandShadeGrid";
import { JsonLd } from "@/components/JsonLd";
import { familyGroups, getBrand } from "@/lib/catalog";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";
import type { BrandId } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export function brandMetadata(brand: BrandId): Metadata {
  const meta = getBrand(brand);
  const title = `${meta.name} official colour catalogue — ${meta.count.toLocaleString()} shade codes`;
  const description = `Browse ${meta.count.toLocaleString()} official ${meta.name} wall paint shades with hex, RGB, and the closest match in the other catalogue. Unofficial digital reference.`;
  return {
    title,
    description,
    alternates: { canonical: `/${meta.path}` },
    openGraph: {
      title,
      description,
      url: `/${meta.path}`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { title, description, images: [DEFAULT_OG_IMAGE] },
  };
}

export function BrandIndexPage({ brand }: { brand: BrandId }) {
  const meta = getBrand(brand);
  const groups = familyGroups(brand);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${meta.name} colour catalogue`,
          url: absoluteUrl(`/${meta.path}`),
          description: `Digital hex reference for ${meta.count} ${meta.name} shades.`,
        }}
      />
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        <Link href="/">Home</Link> / {meta.name}
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">
        {meta.name}
      </h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {groups.map(([family, list]) => (
          <a
            key={family}
            href={`#${family}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-white"
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/10"
              style={{ backgroundColor: list[0]?.hex }}
              aria-hidden
            />
            {list[0]?.familyLabel ?? family} · {list.length}
          </a>
        ))}
      </div>
      <div className="mt-10">
        <BrandShadeGrid brand={brand} groups={groups} />
      </div>
    </div>
  );
}
