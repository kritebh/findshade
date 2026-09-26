import { LegalPage } from "@/components/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import {
  AUTHOR_GITHUB,
  AUTHOR_NAME,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

const title = `About ${SITE_NAME}`;
const description = `Who built ${SITE_NAME}, how the unofficial Asian Paints and Birla Opus colour matcher works, and how to get in touch.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title,
    description,
    url: "/about",
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

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: title,
          url: absoluteUrl("/about"),
          description,
          mainEntity: {
            "@type": "Person",
            name: AUTHOR_NAME,
            url: AUTHOR_GITHUB,
            sameAs: [AUTHOR_GITHUB],
          },
        }}
      />
      <LegalPage title="About" path="/about" description={description}>
        <p>
          {SITE_NAME} is a free, unofficial tool that ranks publicly listed{" "}
          <Link href="/asian-paints" className="underline underline-offset-4">
            Asian Paints
          </Link>{" "}
          and{" "}
          <Link href="/birla-opus" className="underline underline-offset-4">
            Birla Opus
          </Link>{" "}
          shade codes against any hex, RGB value, or pixel from a photo. Matching
          uses CIEDE2000 in CIE Lab so the shortlist is about how colours look,
          not a tinting formula.
        </p>
        <p>
          {SITE_DESCRIPTION} Neither brand operates or endorses this site. Use
          the codes to buy a sample pot, then judge the colour on the actual
          wall. Read the{" "}
          <Link href="/disclaimer" className="underline underline-offset-4">
            full disclaimer
          </Link>
          .
        </p>
        <p>
          Developed with ❤️ by{" "}
          <a
            href={AUTHOR_GITHUB}
            className="underline underline-offset-4"
            rel="noopener noreferrer"
          >
            {AUTHOR_NAME}
          </a>
          .
        </p>
        <p>
          <a
            href={AUTHOR_GITHUB}
            className="underline underline-offset-4"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </LegalPage>
    </>
  );
}
