import { LOGO_CHIPS } from "@/lib/brand";
import { SITE_NAME } from "@/lib/site";

export function ChipMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 32"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect x="0" y="6" width="20" height="20" rx="5" fill={LOGO_CHIPS.terracotta} />
      <rect x="10" y="10" width="20" height="20" rx="5" fill={LOGO_CHIPS.cream} />
      <rect x="20" y="2" width="20" height="20" rx="5" fill={LOGO_CHIPS.slate} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <ChipMark className="h-8 w-10 shrink-0" />
      <span className="font-serif text-lg tracking-tight text-[var(--ink)] sm:text-xl">
        {SITE_NAME}
      </span>
    </span>
  );
}
