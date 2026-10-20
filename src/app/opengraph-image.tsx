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
          background: "#f3f6f8",
          color: "#0c2340",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#0c2340",
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600 }}>Avasara Lab</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5 }}>
            Turn business signals into automation opportunities.
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#445668" }}>
            Practical AI, workflow automation, and feedback insight for growing businesses.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
