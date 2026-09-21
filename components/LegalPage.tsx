import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  path,
  description,
  children,
}: {
  title: string;
  path: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          url: absoluteUrl(path),
          description,
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: absoluteUrl("/"),
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: absoluteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: title,
              item: absoluteUrl(path),
            },
          ],
        }}
      />
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        <Link href="/">Home</Link> / {title}
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-[var(--muted)] [&_a]:text-[var(--ink)] [&_h2]:mt-8 [&_h2]:text-[var(--ink)]">
        {children}
      </div>
    </article>
  );
}
