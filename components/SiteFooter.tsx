import Link from "next/link";

const links = [
  { href: "/", label: "FindShade" },
  { href: "/asian-paints", label: "Asian Paints" },
  { href: "/birla-opus", label: "Birla Opus" },
  { href: "/about", label: "About" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p>Unofficial. Sample on the wall.</p>
      </div>
    </footer>
  );
}
