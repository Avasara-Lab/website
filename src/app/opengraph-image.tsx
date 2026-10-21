import { ImageResponse } from "next/og";

export const alt = "Avasara Lab. Turn business signals into automation opportunities.";
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
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          color: "#111318",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#111318",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 2, background: "#2563EB" }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>Avasara Lab</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5 }}>
            Find the opportunity. Build the intelligence. Automate the outcome.
          </div>
          <div style={{ marginTop: 24, fontSize: 26, lineHeight: 1.4, color: "#5F6673" }}>
            Turn business signals into automation opportunities.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
