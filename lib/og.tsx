import { ImageResponse } from "next/og";

export function renderPaintOg({
  title,
  eyebrow,
  hex,
  code,
}: {
  title: string;
  eyebrow: string;
  hex: string;
  code?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4efe6",
          color: "#1c1914",
        }}
      >
        <div style={{ width: 420, height: "100%", background: hex }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#6f675c",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, lineHeight: 1.1 }}>{title}</div>
            <div style={{ fontSize: 28, marginTop: 16, fontFamily: "monospace" }}>
              {code ? `${code}  ·  ${hex}` : hex}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
