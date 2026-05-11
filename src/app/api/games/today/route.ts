import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    console.log(`[games/today] fetching ${BACKEND}/games/today`);
    const r = await fetch(`${BACKEND}/games/today`, { cache: "no-store" });
    console.log(`[games/today] status ${r.status}`);
    if (!r.ok) {
      const text = await r.text();
      console.error(`[games/today] backend error:`, text);
      throw new Error(`Backend ${r.status}`);
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(`[games/today] caught:`, e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
