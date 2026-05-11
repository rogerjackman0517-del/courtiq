import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withCache, TTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "PTS";
  const season   = req.nextUrl.searchParams.get("season")   ?? "2025-26";
  try {
    const data = await withCache(
      `leaders:${category}:${season}`,
      TTL.leaders,
      () => api.stats.leaders(category, season),
    );
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
