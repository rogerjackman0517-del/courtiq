import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

/**
 * Lightweight player news proxy. Queries ESPN's general NBA news feed
 * and filters for items mentioning a player name. ESPN doesn't expose
 * a player-scoped news endpoint in their public API so this is the
 * pragmatic version.
 */
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ items: [] });
  }
  try {
    const r = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=40",
      { next: { revalidate: 1800 } }
    );
    if (!r.ok) return NextResponse.json({ items: [] });
    const data = await r.json();
    const articles: Array<{ headline?: string; description?: string; published?: string; links?: { web?: { href?: string } } }> = data?.articles ?? [];
    const lower = name.toLowerCase();
    const matches = articles
      .filter(
        (a) =>
          (a.headline ?? "").toLowerCase().includes(lower) ||
          (a.description ?? "").toLowerCase().includes(lower)
      )
      .slice(0, 5)
      .map((a) => ({
        title: a.headline ?? "",
        link: a.links?.web?.href ?? "",
        published: a.published ?? "",
      }));
    return NextResponse.json({ items: matches });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
