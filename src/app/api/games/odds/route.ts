import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withCache, TTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await withCache("games:odds", TTL.odds, () => api.games.odds());
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
