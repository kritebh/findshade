import { LegalPage } from "@/components/LegalPage";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

const title = "Disclaimer";
const description = `${SITE_NAME} is an unofficial digital shortlist of Asian Paints and Birla Opus shade codes. Screen hex is not wet paint. Always test a physical sample.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title,
    description,
    url: "/disclaimer",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" path="/disclaimer" description={description}>
      <p>
        {SITE_NAME} is not affiliated with, endorsed by, or operated by Asian
        Paints, Birla Opus, or their parent companies. Product names and shade
        codes are used only to identify publicly listed catalogue colours.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">
        This is not a spectrophotometer
      </h2>
      <p>
        Hex values, RGB triples, and photo samples are sRGB approximations.
        Paint catalogues publish design-software RGB, not lab-measured wet film.
        Sheen, primer, substrate, and your room&apos;s lighting can shift a
        “perfect” digital match. A low CIEDE2000 (ΔE) score means two sRGB
        values look similar on a screen — not that the dried wall will match.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">Photos</h2>
      <p>
        Phone cameras auto-white-balance and compress colour. Treat a tapped
        pixel as a starting point, then confirm with a physical sample on the
        actual wall in daylight and evening light.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">No professional advice</h2>
      <p>
        Nothing on this site is a tinting formula, stock check, purchase
        recommendation, or professional design, architectural, or paint-trade
        advice. Use the codes to locate a shade in a store fan deck and buy a
        sample pot.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">Catalogue data</h2>
      <p>
        Shade lists are official catalogue colours. Asian Paints LRV and undertone
        enrichment, where shown, uses{" "}
        <a
          href="https://paintdb.com"
          className="underline underline-offset-4"
          rel="noopener noreferrer"
        >
          PaintDB
        </a>{" "}
        (CC BY 4.0). Codes, names, and hex values can change; always verify
        against the current fan deck.
      </p>
      <p>
        Privacy practices are on the{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          privacy policy
        </Link>
        .
      </p>
    </LegalPage>
  );
}
