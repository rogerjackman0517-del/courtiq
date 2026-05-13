import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const target = date
    ? `${BACKEND}/games/today?date=${encodeURIComponent(date)}`
    : `${BACKEND}/games/today`;
  try {
    console.log(`[games/today] fetching ${target}`);
    const r = await fetch(target, { cache: "no-store" });
    console.log(`[games/today] status ${r.status}`);
    if (!r.ok) {
      const text = await r.text();
      console.error(`[games/today] backend error:`, text);
      throw new Error(`Backend ${r.status}`);
    }
    return NextResponse.json(await r.json());
  } catch (e) {
    console.error(`[games/today] caught:`, e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
