import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get("season") ?? "2025-26";

  try {
    console.log(`[teams/with-records] fetching ${BACKEND}/teams/with-records?season=${season}`);
    const r = await fetch(`${BACKEND}/teams/with-records?season=${season}`, {
      cache: "no-store",
    });
    console.log(`[teams/with-records] status ${r.status}`);

    if (!r.ok) {
      const text = await r.text();
      console.error(`[teams/with-records] backend error:`, text);
      throw new Error(`Backend ${r.status}`);
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(`[teams/with-records] caught:`, e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
