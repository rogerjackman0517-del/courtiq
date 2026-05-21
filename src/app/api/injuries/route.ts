import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

/**
 * Pulls each NBA team's injury list from ESPN. Returns a flat array
 * grouped by team.
 */
export async function GET() {
  try {
    // ESPN provides a single endpoint with all injuries across the league.
    const r = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries",
      { next: { revalidate: 600 } }
    );
    if (!r.ok) return NextResponse.json({ teams: [] });
    const data = await r.json();
    type EspnInjury = {
      athlete?: { displayName?: string; position?: { abbreviation?: string } };
      status?: string;
      details?: { type?: string; detail?: string; returnDate?: string };
      shortComment?: string;
    };
    type EspnTeam = { team?: { displayName?: string; abbreviation?: string }; injuries?: EspnInjury[] };
    const groups: EspnTeam[] = data?.injuries ?? [];
    const out = groups
      .filter((g) => Array.isArray(g.injuries) && g.injuries.length > 0)
      .map((g) => ({
        team: g.team?.abbreviation ?? "",
        teamName: g.team?.displayName ?? "",
        injuries: (g.injuries ?? []).map((i: EspnInjury) => ({
          name: i.athlete?.displayName ?? "",
          position: i.athlete?.position?.abbreviation ?? "",
          status: i.status ?? "",
          comment: i.shortComment ?? "",
          type: i.details?.type ?? "",
          detail: i.details?.detail ?? "",
          returnDate: i.details?.returnDate ?? "",
        })),
      }));
    return NextResponse.json({ teams: out });
  } catch {
    return NextResponse.json({ teams: [] });
  }
}
