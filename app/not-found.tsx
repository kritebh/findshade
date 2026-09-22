import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <Link href="/" className="mt-6 inline-block underline">
        Home
      </Link>
    </div>
  );
}
