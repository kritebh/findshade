const rows = [
  {
    range: "ΔE < 2",
    label: "Very close digitally",
    copy: "Hard to tell apart on a calibrated screen. Still sample the wall.",
  },
  {
    range: "ΔE 2–5",
    label: "Useful substitute",
    copy: "A close stand-in. Check undertone in daylight and evening light.",
  },
  {
    range: "ΔE 5–10",
    label: "Noticeable difference",
    copy: "Same family, visibly different side by side.",
  },
  {
    range: "ΔE > 10",
    label: "Nearest available",
    copy: "Not a match — the closest catalogue shade we have.",
  },
];

export function DeltaEGuide() {
  return (
    <section id="limits" className="scroll-mt-24">
      <h2 className="font-serif text-3xl tracking-tight text-[var(--ink)]">
        How close is close?
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Scores are CIEDE2000 (ΔE): how similar two sRGB values look, not how
        the dried wall will look.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.range}
            className="rounded-2xl border border-[var(--line)] bg-white/70 p-4"
          >
            <p className="font-mono text-xs tracking-wide text-[var(--accent)]">
              {row.range}
            </p>
            <p className="mt-1 font-medium text-[var(--ink)]">{row.label}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{row.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
