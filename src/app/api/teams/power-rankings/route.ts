import { NextResponse } from "next/server";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const r = await fetch(`${BACKEND}/teams/power-rankings`, { next: { revalidate: 300 } });
    if (!r.ok) return NextResponse.json([], { status: r.status });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
