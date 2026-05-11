import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get("season") ?? "2025-26";

  try {
    console.log(`[players/with-stats] fetching ${BACKEND}/players/with-stats?season=${season}`);
    const r = await fetch(`${BACKEND}/players/with-stats?season=${season}`, {
      cache: "no-store",
    });
    console.log(`[players/with-stats] status ${r.status}`);

    if (!r.ok) {
      const text = await r.text();
      console.error(`[players/with-stats] backend error body:`, text);
      throw new Error(`Backend ${r.status}: ${text}`);
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(`[players/with-stats] caught:`, e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
