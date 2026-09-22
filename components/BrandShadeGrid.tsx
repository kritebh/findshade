"use client";

import { useMemo, useState } from "react";
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
  const shownCount = hexQuery
    ? hexMatches.length
    : textFiltered.reduce((sum, [, shades]) => sum + shades.length, 0);

  return (
    <div className="space-y-10">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Name, code, or hex"
        aria-label="Search this catalogue"
        className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-base"
      />

      {hexQuery ? (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif text-2xl text-[var(--ink)]">
              {hexQuery}
            </h2>
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
                  note={`ΔE ${item.deltaE.toFixed(2)}`}
                  title={quality.label}
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
        <p className="text-sm text-[var(--muted)]">No matches for “{needle}”.</p>
      ) : null}

      {needle ? (
        <p className="text-sm text-[var(--muted)]">
          {shownCount.toLocaleString()} of {total.toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
