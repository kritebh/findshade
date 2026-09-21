import { LegalPage } from "@/components/LegalPage";
import { AUTHOR_GITHUB, AUTHOR_NAME, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

const title = "Privacy policy";
const description = `How ${SITE_NAME} handles photos, colour values, and analytics. Images are sampled in your browser; we do not run user accounts.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title,
    description,
    url: "/privacy",
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

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" path="/privacy" description={description}>
      <p>Last updated 20 September 2026.</p>
      <h2 className="font-serif text-2xl tracking-tight">What this site does</h2>
      <p>
        {SITE_NAME} is a colour-matching reference. You can type a hex or RGB
        value, use the browser colour picker, or upload a photo and tap a pixel.
        Matching runs against a static shade catalogue in your browser (and, for
        shareable hex URLs, on the server as a precomputed shortlist). There are
        no user accounts.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">
        Photos and colour samples
      </h2>
      <p>
        Image files you choose stay on your device for sampling. The photo is
        drawn onto a canvas in your browser; pixels are averaged locally to
        produce a hex. We do not upload your photo to our servers as part of
        matching.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">Logs and hosting</h2>
      <p>
        The site is served over HTTPS. The host may record standard request
        metadata (for example IP address, user agent, and the page URL) for
        security, uptime, and abuse prevention. Shareable pages such as{" "}
        <span className="font-mono">/hex/c4a484</span> only contain the colour
        you chose to publish in the URL.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">Cookies and analytics</h2>
      <p>
        We do not set advertising cookies. If a privacy-respecting analytics
        tool is added later, this page will be updated. Your browser may still
        send data required to load fonts, scripts, and pages.
      </p>
      <h2 className="font-serif text-2xl tracking-tight">Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a
          href={AUTHOR_GITHUB}
          className="underline underline-offset-4"
          rel="noopener noreferrer"
        >
          {AUTHOR_NAME} on GitHub
        </a>
        . Also see the{" "}
        <Link href="/disclaimer" className="underline underline-offset-4">
          disclaimer
        </Link>{" "}
        and{" "}
        <Link href="/about" className="underline underline-offset-4">
          about
        </Link>{" "}
        pages.
      </p>
    </LegalPage>
  );
}
