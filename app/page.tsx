import { ColorMatcher } from "@/components/ColorMatcher";
import { JsonLd } from "@/components/JsonLd";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${SITE_NAME} — closest Asian Paints and Birla Opus colour from hex or photo`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — closest Asian Paints and Birla Opus colour from hex or photo`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: `${SITE_NAME} — closest Asian Paints and Birla Opus colour from hex or photo`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: SITE_NAME,
          url: absoluteUrl("/"),
          applicationCategory: "DesignApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
          },
          description: SITE_DESCRIPTION,
          isAccessibleForFree: true,
          featureList: [
            "Match hex and RGB to Asian Paints shade codes",
            "Match hex and RGB to Birla Opus shade codes",
            "Sample a colour from a photo",
            "CIEDE2000 ranking",
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I find the closest Asian Paints or Birla Opus colour to a hex?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `Enter a hex or RGB value, or use the colour picker. ${SITE_NAME} ranks official Asian Paints and Birla Opus shades with CIEDE2000 and shows a shortlist. Always confirm with a physical sample.`,
              },
            },
            {
              "@type": "Question",
              name: "Can I match wall paint from a photo?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Upload a photo and tap the wall or object. Sampling runs in your browser. Phone cameras auto-white-balance, so treat the result as a starting point.",
              },
            },
            {
              "@type": "Question",
              name: `Is ${SITE_NAME} affiliated with Asian Paints or Birla Opus?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. It is an unofficial digital reference. Neither brand operates or endorses the site.",
              },
            },
          ],
        }}
      />
      <h1 className="sr-only">Find a shade</h1>
      <ColorMatcher />
    </div>
  );
}
