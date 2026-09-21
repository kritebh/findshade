import Link from "next/link";
import { Logo } from "@/components/Logo";
import { catalog } from "@/lib/catalog";
import { AUTHOR_GITHUB, AUTHOR_NAME } from "@/lib/site";

export function SiteFooter() {
  const ap = catalog.brands["asian-paints"].count.toLocaleString();
  const bo = catalog.brands["birla-opus"].count.toLocaleString();

  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--paper-2)]/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3 text-sm text-[var(--muted)]">
          <Logo />
          <p>
            Unofficial digital shortlist. Not affiliated with Asian Paints or
            Birla Opus. Catalogues sourced {catalog.sourcedAt}. Always sample
            on the wall.
          </p>
          <p>
            Made by{" "}
            <a
              href={AUTHOR_GITHUB}
              className="underline underline-offset-4 hover:text-[var(--ink)]"
              rel="noopener noreferrer"
            >
              {AUTHOR_NAME}
            </a>
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <Link href="/" className="hover:text-[var(--ink)]">
            Matcher
          </Link>
          <Link href="/asian-paints" className="hover:text-[var(--ink)]">
            {ap} Asian Paints
          </Link>
          <Link href="/birla-opus" className="hover:text-[var(--ink)]">
            {bo} Birla Opus
          </Link>
          <Link href="/#limits" className="hover:text-[var(--ink)]">
            How close
          </Link>
          <Link href="/about" className="hover:text-[var(--ink)]">
            About
          </Link>
          <Link href="/disclaimer" className="hover:text-[var(--ink)]">
            Disclaimer
          </Link>
          <Link href="/privacy" className="hover:text-[var(--ink)]">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
