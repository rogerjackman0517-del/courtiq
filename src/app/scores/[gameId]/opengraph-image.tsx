import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CourtIQ boxscore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Boxscore = {
  gameId: string;
  status: { state: string; text: string };
  date: string;
  homeTeam: { tricode: string; city: string; name: string; score: number; winner: boolean };
  awayTeam: { tricode: string; city: string; name: string; score: number; winner: boolean };
  seriesText?: string;
};

async function fetchBox(gameId: string): Promise<Boxscore | null> {
  try {
    const r = await fetch(`https://courtiq.uk/api/games/${gameId}/boxscore`, {
      next: { revalidate: 300 },
    });
    if (!r.ok) return null;
    return (await r.json()) as Boxscore;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { gameId: string } }) {
  const box = await fetchBox(params.gameId);
  if (!box) {
    // Fallback minimal card
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A0A0E", color: "#F5F5F7", padding: 80, fontFamily: "system-ui" }}>
          <span style={{ fontSize: 48, fontWeight: 800 }}>CourtIQ — Boxscore</span>
        </div>
      ),
      size
    );
  }
  const isFinal = box.status.state === "post";
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0A0A0E 0%, #13131C 60%, #1C1C24 100%)",
          color: "#F5F5F7",
          padding: 80,
          fontFamily: "system-ui",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, color: "#D4B560", letterSpacing: 4, textTransform: "uppercase" }}>
          CourtIQ · {isFinal ? "Final" : box.status.text}
        </span>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: 40, marginTop: 40 }}>
          {/* Away */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 28, color: "#8A8A93", letterSpacing: 4, textTransform: "uppercase" }}>
              {box.awayTeam.city}
            </span>
            <span style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2, color: box.awayTeam.winner ? "#F5F5F7" : "#6E6E76" }}>
              {box.awayTeam.name}
            </span>
            <span style={{ fontSize: 144, fontWeight: 900, letterSpacing: -6, color: box.awayTeam.winner ? "#F5F5F7" : "#6E6E76", lineHeight: 1, marginTop: 16 }}>
              {box.awayTeam.score}
            </span>
          </div>
          <span style={{ fontSize: 80, color: "#3A3A42" }}>·</span>
          {/* Home */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "flex-end" }}>
            <span style={{ fontSize: 28, color: "#8A8A93", letterSpacing: 4, textTransform: "uppercase" }}>
              {box.homeTeam.city}
            </span>
            <span style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2, color: box.homeTeam.winner ? "#F5F5F7" : "#6E6E76" }}>
              {box.homeTeam.name}
            </span>
            <span style={{ fontSize: 144, fontWeight: 900, letterSpacing: -6, color: box.homeTeam.winner ? "#F5F5F7" : "#6E6E76", lineHeight: 1, marginTop: 16 }}>
              {box.homeTeam.score}
            </span>
          </div>
        </div>
        {box.seriesText && (
          <span style={{ fontSize: 20, color: "#6E6E76", letterSpacing: 2, marginTop: 20 }}>
            {box.seriesText}
          </span>
        )}
      </div>
    ),
    size
  );
}
