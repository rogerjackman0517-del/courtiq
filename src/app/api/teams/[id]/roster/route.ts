import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withCache, TTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const season  = req.nextUrl.searchParams.get("season") ?? "2025-26";
  try {
    const data = await withCache(
      `team:roster:${id}:${season}`,
      TTL.roster,
      () => api.teams.roster(Number(id), season),
    );
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
