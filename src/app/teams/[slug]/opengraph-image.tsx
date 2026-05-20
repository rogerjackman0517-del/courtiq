import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CourtIQ team page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Team = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  slug: string;
  wins: number;
  losses: number;
  winPct: number;
  conference: string;
  confRank: number;
  streak: string;
  primaryColor: string;
};

async function fetchTeam(slug: string): Promise<Team | null> {
  try {
    const r = await fetch(`https://courtiq.uk/api/teams/with-records`, {
      next: { revalidate: 3600 },
    });
    if (!r.ok) return null;
    const teams: Team[] = await r.json();
    return teams.find((t) => t.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const team = await fetchTeam(params.slug);
  const fullName = team ? `${team.city} ${team.name}` : "CourtIQ";
  const color = team?.primaryColor ?? "#D4B560";
  const logo = team ? `https://cdn.nba.com/logos/nba/${team.id}/global/L/logo.svg` : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${color}33 0%, #0A0A0E 60%, #13131C 100%)`,
          color: "#F5F5F7",
          padding: 80,
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            background: `radial-gradient(circle, ${color}66 0%, transparent 70%)`,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 24 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 800,
              color,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            CourtIQ · Team
          </span>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>
            {fullName}
          </div>
          {team && (
            <div style={{ display: "flex", gap: 36, marginTop: 12, alignItems: "baseline" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 72, fontWeight: 900 }}>
                  {team.wins}<span style={{ color: "#6E6E76" }}>–{team.losses}</span>
                </span>
                <span style={{ fontSize: 18, color: "#8A8A93", letterSpacing: 3 }}>RECORD</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 56, fontWeight: 900, color }}>
                  #{team.confRank}
                </span>
                <span style={{ fontSize: 18, color: "#8A8A93", letterSpacing: 3 }}>
                  {team.conference.toUpperCase()}
                </span>
              </div>
              {team.streak && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 56, fontWeight: 900 }}>{team.streak}</span>
                  <span style={{ fontSize: 18, color: "#8A8A93", letterSpacing: 3 }}>STREAK</span>
                </div>
              )}
            </div>
          )}
        </div>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={fullName}
            width={300}
            height={300}
            style={{ objectFit: "contain", alignSelf: "center" }}
          />
        )}
      </div>
    ),
    { ...size }
  );
}
