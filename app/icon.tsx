import { ImageResponse } from "next/og";
import { LOGO_CHIPS, PAPER } from "@/lib/brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
            width: 14,
            height: 14,
            borderRadius: 4,
            background: LOGO_CHIPS.terracotta,
            marginRight: -6,
            marginTop: 2,
          }}
        />
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: 4,
            background: LOGO_CHIPS.cream,
            marginRight: -6,
            marginTop: 6,
          }}
        />
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: 4,
            background: LOGO_CHIPS.slate,
            marginTop: -2,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
