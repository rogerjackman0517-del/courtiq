import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const r = await fetch(`${BACKEND}/news/feed`, { cache: "no-store" });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Backend ${r.status}: ${text}`);
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[news] caught:", e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
