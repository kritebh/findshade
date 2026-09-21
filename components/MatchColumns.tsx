import type { RankedMatch } from "@/lib/types";
import { MatchCard } from "./Swatch";

const brandCopy = {
  "asian-paints": { name: "Asian Paints", path: "asian-paints" },
  "birla-opus": { name: "Birla Opus", path: "birla-opus" },
} as const;

export function MatchColumns({
  matches,
}: {
  matches: {
    "asian-paints": RankedMatch[];
    "birla-opus": RankedMatch[];
  };
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {(Object.keys(brandCopy) as Array<keyof typeof brandCopy>).map((brand) => {
        const meta = brandCopy[brand];
        return (
          <section key={brand}>
            <h2 className="font-serif text-2xl text-[var(--ink)]">
              Closest {meta.name}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {matches[brand].map((item) => (
                <MatchCard
                  key={`${item.brand}-${item.slug}`}
                  hex={item.hex}
                  name={item.name}
                  code={item.code}
                  brandLabel={meta.name}
                  deltaE={item.deltaE}
                  quality={item.quality}
                  href={`/${meta.path}/${item.slug}`}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
