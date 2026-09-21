import { ImageResponse } from "next/og";
import { LOGO_CHIPS, PAPER } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: 20,
            background: LOGO_CHIPS.terracotta,
            marginRight: -28,
            marginTop: 8,
          }}
        />
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: 20,
            background: LOGO_CHIPS.cream,
            marginRight: -28,
            marginTop: 28,
          }}
        />
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: 20,
            background: LOGO_CHIPS.slate,
            marginTop: -12,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
