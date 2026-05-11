import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year") ?? "2025";
  try {
    const r = await fetch(`${BACKEND}/draft/history?year=${year}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend ${r.status}`);
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
