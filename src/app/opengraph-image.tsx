import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CourtIQ — NBA Analytics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0A0A0E 0%, #1C1C24 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row: logo + eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#0A0A0E",
              border: "2px solid rgba(212, 181, 96, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M17 4 A9 9 0 1 0 17 20" stroke="#D4B560" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2.2" fill="#D4B560" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#D4B560",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              NBA Analytics
            </div>
            <div
              style={{
                color: "#F5F5F7",
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginTop: 4,
                display: "flex",
              }}
            >
              Court<span style={{ color: "#D4B560", marginLeft: 4 }}>IQ</span>
            </div>
          </div>
        </div>

        {/* Big headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#F5F5F7",
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            Real-time stats.
          </div>
          <div
            style={{
              color: "#D4B560",
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            Smarter takes.
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              color: "#8A8A93",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            Scores · Stats · Standings · Analytics
          </div>
          <div
            style={{
              color: "#6E6E76",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            courtiq.uk
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
