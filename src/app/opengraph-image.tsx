import { ImageResponse } from "next/og";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";
import { opportunity } from "@/lib/opportunity";

export const alt = "The Opportunity Intelligence Layer. Find opportunities, rank actions, and run agentic execution.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const marketing = await marketingSiteIsVisible();
  const headline = marketing
    ? "Find the opportunity. Build the intelligence. Automate the outcome."
    : opportunity.title;
  const subhead = marketing ? "Turn business signals into automation opportunities." : opportunity.description;
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
          <div style={{ fontSize: 28, fontWeight: 600 }}>
            {marketing ? "Avasara Lab" : "Avasara Lab · Opportunity Intelligence"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ fontSize: marketing ? 64 : 68, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5 }}>
            {headline}
          </div>
          <div style={{ marginTop: 24, fontSize: 26, lineHeight: 1.4, color: "#5F6673" }}>{subhead}</div>
        </div>
      </div>
    ),
    size,
  );
}
