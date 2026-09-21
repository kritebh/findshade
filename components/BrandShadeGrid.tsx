"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { matchQuality, normalizeHex, rankShades } from "@/lib/color";
import type { Shade } from "@/lib/types";
import { ShadeChip } from "./Swatch";

export function BrandShadeGrid({
  brand,
  groups,
}: {
  brand: Shade["brand"];
  groups: [string, Shade[]][];
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim();
  const hexQuery = normalizeHex(needle);
  const allShades = useMemo(
    () => groups.flatMap(([, shades]) => shades),
    [groups],
  );
  const total = allShades.length;

  const textFiltered = useMemo(() => {
    if (!needle || hexQuery) return groups;
    const q = needle.toLowerCase();
    return groups
      .map(([family, shades]) => {
        const next = shades.filter(
          (shade) =>
            shade.name.toLowerCase().includes(q) ||
            shade.code.toLowerCase().includes(q) ||
            shade.hex.toLowerCase().includes(q),
        );
        return [family, next] as [string, Shade[]];
      })
      .filter(([, shades]) => shades.length > 0);
  }, [groups, hexQuery, needle]);

  const hexMatches = useMemo(() => {
    if (!hexQuery) return [];
    return rankShades(hexQuery, allShades, 12);
  }, [allShades, hexQuery]);
  const exactHex = Boolean(
    hexQuery && allShades.some((shade) => shade.hex === hexQuery),
  );

  const shownCount = hexQuery
    ? hexMatches.length
    : textFiltered.reduce((sum, [, shades]) => sum + shades.length, 0);

  return (
    <div className="space-y-10">
      <label className="block max-w-md">
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Search this catalogue
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, code, or hex like #C19E76"
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-base"
        />
      </label>

      {hexQuery ? (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-[var(--ink)]">
                Closest to {hexQuery}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
                {exactHex ? "Exact hex in this catalogue. " : null}
                <Link
                  href={`/hex/${hexQuery.slice(1).toLowerCase()}`}
                  className="underline"
                >
                  Compare both brands
                </Link>
              </p>
            </div>
            <span
              className="h-10 w-10 rounded-lg border border-black/10"
              style={{ backgroundColor: hexQuery }}
              aria-hidden
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {hexMatches.map((item) => {
              const quality = matchQuality(item.deltaE);
              return (
                <ShadeChip
                  key={item.slug}
                  hex={item.hex}
                  name={item.name}
                  code={item.code}
                  href={`/${brand}/${item.slug}`}
                  note={`ΔE ${item.deltaE.toFixed(2)} · ${quality.label}`}
                />
              );
            })}
          </div>
        </section>
      ) : (
        textFiltered.map(([family, shades]) => (
          <section key={family} id={family} className="scroll-mt-28">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-2xl capitalize text-[var(--ink)]">
                {shades[0]?.familyLabel ?? family}
              </h2>
              <p className="text-sm text-[var(--muted)]">
                {shades.length} shades
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {shades.map((shade) => (
                <ShadeChip
                  key={shade.slug}
                  hex={shade.hex}
                  name={shade.name}
                  code={shade.code}
                  href={`/${brand}/${shade.slug}`}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {!hexQuery && needle && shownCount === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No names or codes match “{needle}”. Paste a hex such as #C19E76 to
          find the closest shade in this catalogue.
        </p>
      ) : null}

      <p className="text-sm text-[var(--muted)]">
        Showing {shownCount.toLocaleString()} of {total.toLocaleString()}{" "}
        shades.
      </p>
    </div>
  );
}
