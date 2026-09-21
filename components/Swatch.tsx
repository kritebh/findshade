import Link from "next/link";
import { CopyButton } from "./CopyButton";
import { contrastText } from "@/lib/color";
import type { MatchQuality } from "@/lib/types";

export function Swatch({
  hex,
  name,
  code,
  href,
  large = false,
}: {
  hex: string;
  name?: string;
  code?: string;
  href?: string;
  large?: boolean;
}) {
  const text = contrastText(hex);
  const overlay =
    text === "#1c1914"
      ? "bg-gradient-to-t from-black/10 to-transparent"
      : "bg-gradient-to-t from-black/35 to-transparent";
  const inner = (
    <div
      className={`overflow-hidden border border-black/10 ${
        large ? "min-h-[22rem] rounded-[2rem] md:min-h-[28rem]" : "min-h-28 rounded-2xl"
      }`}
      style={{ backgroundColor: hex }}
    >
      <div
        className={`flex h-full min-h-inherit flex-col justify-end p-3 ${overlay}`}
        style={{ color: text }}
      >
        {code ? (
          <p className="font-mono text-[11px] tracking-wide opacity-90">
            {code}
          </p>
        ) : null}
        {name ? (
          <p className="text-sm font-medium leading-tight">{name}</p>
        ) : null}
        <p className="font-mono text-[11px] opacity-90">{hex}</p>
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <Link
      href={href}
      className="block transition-transform duration-200 hover:-translate-y-0.5"
    >
      {inner}
    </Link>
  );
}

export function MatchCard({
  hex,
  name,
  code,
  brandLabel,
  deltaE,
  quality,
  href,
}: {
  hex: string;
  name: string;
  code: string;
  brandLabel: string;
  deltaE: number;
  quality: MatchQuality;
  href: string;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/80 shadow-[0_18px_40px_-32px_rgba(40,24,8,0.4)] transition-transform duration-200 hover:-translate-y-0.5">
      <Link href={href} className="block">
        <div className="h-36" style={{ backgroundColor: hex }} />
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          {brandLabel}
        </p>
        <Link href={href} className="block">
          <h3 className="font-medium leading-snug text-[var(--ink)]">{name}</h3>
          <p className="font-mono text-sm text-[var(--muted)]">{code}</p>
        </Link>
        <p className="text-sm text-[var(--ink)]">
          ΔE {deltaE.toFixed(2)} · {quality.label}
        </p>
        <CopyButton value={code} />
      </div>
    </article>
  );
}

export function ShadeChip({
  hex,
  name,
  code,
  href,
  note,
}: {
  hex: string;
  name: string;
  code: string;
  href: string;
  note?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--line)] hover:bg-white/90"
    >
      <span
        className="h-12 w-12 shrink-0 rounded-xl border border-black/5"
        style={{ backgroundColor: hex }}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm text-[var(--ink)]">{name}</span>
        <span className="block font-mono text-[11px] text-[var(--muted)]">
          {code}
          {note ? ` · ${note}` : ""}
        </span>
      </span>
    </Link>
  );
}

export function shadeHref(brand: "asian-paints" | "birla-opus", slug: string) {
  return `/${brand}/${slug}`;
}
