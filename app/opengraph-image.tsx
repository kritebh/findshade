import { ImageResponse } from "next/og";
import { LOGO_CHIPS, PAPER } from "@/lib/brand";
import { OG_IMAGE_ALT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          color: "#1a1610",
          padding: 72,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 20,
              background: LOGO_CHIPS.terracotta,
              marginRight: -32,
              marginTop: 8,
            }}
          />
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 20,
              background: LOGO_CHIPS.cream,
              marginRight: -32,
              marginTop: 28,
            }}
          />
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 20,
              background: LOGO_CHIPS.slate,
              marginTop: -8,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 48,
              marginLeft: 36,
              letterSpacing: -1,
            }}
          >
            {SITE_NAME}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ fontSize: 56, lineHeight: 1.08 }}>
            Closest Asian Paints and Birla Opus code from any hex.
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.35,
              marginTop: 20,
              color: "#5c564c",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
