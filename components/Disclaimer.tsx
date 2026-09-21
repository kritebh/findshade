export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-[var(--muted)]">
        Digital ΔE shortlist only. Finish, lighting, and substrate change the
        wall. Confirm with a physical sample.
      </p>
    );
  }

  return (
    <aside className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-5 text-sm leading-relaxed text-[var(--muted)]">
      <p className="font-medium text-[var(--ink)]">This is not a spectrophotometer.</p>
      <p className="mt-2">
        Hex and photo samples are sRGB approximations. Paint catalogues publish
        design-software RGB, not lab-measured wet film. Sheen, primer, and your
        room&apos;s bulbs can shift a &ldquo;perfect&rdquo; digital match. Use
        the codes below to buy a sample pot, then live with it on the wall.
      </p>
    </aside>
  );
}
