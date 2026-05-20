import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CourtIQ player profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Player = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  pts: number;
  reb: number;
  ast: number;
};

async function fetchPlayer(slug: string): Promise<Player | null> {
  try {
    const r = await fetch(`https://courtiq.uk/api/players/with-stats`, {
      next: { revalidate: 3600 },
    });
    if (!r.ok) return null;
    const players: Player[] = await r.json();
    return players.find((p) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const player = await fetchPlayer(params.slug);
  const name = player?.fullName ?? "CourtIQ";
  const headshot = player ? `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png` : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0A0A0E 0%, #13131C 60%, #1C1C24 100%)",
          color: "#F5F5F7",
          padding: 80,
          fontFamily: "system-ui",
        }}
      >
        {/* Gold halo */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(212,181,96,0.30) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#D4B560",
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              CourtIQ · Player
            </span>
          </div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>
            {name}
          </div>
          {player && (
            <div style={{ display: "flex", gap: 36, marginTop: 12 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 72, fontWeight: 900, color: "#D4B560" }}>
                  {player.pts.toFixed(1)}
                </span>
                <span style={{ fontSize: 18, color: "#8A8A93", letterSpacing: 3 }}>PPG</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 72, fontWeight: 900 }}>{player.reb.toFixed(1)}</span>
                <span style={{ fontSize: 18, color: "#8A8A93", letterSpacing: 3 }}>RPG</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 72, fontWeight: 900 }}>{player.ast.toFixed(1)}</span>
                <span style={{ fontSize: 18, color: "#8A8A93", letterSpacing: 3 }}>APG</span>
              </div>
            </div>
          )}
        </div>
        {headshot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headshot}
            alt={name}
            width={360}
            height={360}
            style={{
              borderRadius: 9999,
              objectFit: "cover",
              border: "4px solid rgba(212,181,96,0.35)",
              alignSelf: "center",
            }}
          />
        )}
      </div>
    ),
    { ...size }
  );
}
