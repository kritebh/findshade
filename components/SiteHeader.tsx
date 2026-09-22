"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SITE_NAME } from "@/lib/site";

const links = [
  { href: "/asian-paints", label: "Asian Paints" },
  { href: "/birla-opus", label: "Birla Opus" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--paper)]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-x-3 px-5 py-3">
        <Link href="/" className="min-w-0 shrink" aria-label={`${SITE_NAME} home`}>
          <Logo />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-[var(--muted)] transition-colors duration-200 hover:text-[var(--ink)] sm:inline"
            >
              {link.label}
            </Link>
          ))}
          {pathname !== "/" ? (
            <Link
              href="/#matcher"
              className="inline-flex min-h-9 items-center rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-sm text-[var(--paper)] transition-transform duration-200 hover:-translate-y-px"
            >
              Match
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
