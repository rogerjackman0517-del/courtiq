import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withCache, TTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get("season") ?? "2025-26";
  try {
    const data = await withCache(
      `standings:${season}`,
      TTL.stats,
      () => api.teams.standings(season),
    );
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
