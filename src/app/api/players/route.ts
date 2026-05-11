import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withCache, TTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get("season") ?? "2025-26";
  const q      = req.nextUrl.searchParams.get("q");

  try {
    if (q) {
      // Search is fast static lookup — no Redis needed
      const data = await api.players.search(q);
      return NextResponse.json(data);
    }

    const data = await withCache(
      `players:all:${season}`,
      TTL.roster,
      () => api.players.all(season),
    );
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
