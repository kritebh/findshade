import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24">
      <h1 className="font-serif text-4xl">That colour page is missing.</h1>
      <p className="mt-4 text-[var(--muted)]">
        The shade code or hex may be invalid. Head back to the matcher and try
        another value.
      </p>
      <Link href="/" className="mt-6 inline-block underline">
        Match a colour
      </Link>
    </div>
  );
}
