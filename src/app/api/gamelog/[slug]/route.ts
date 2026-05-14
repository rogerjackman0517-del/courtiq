import { NextResponse } from "next/server";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const r = await fetch(`${BACKEND}/players/${encodeURIComponent(slug)}/gamelog`, { next: { revalidate: 300 } });
    if (!r.ok) return NextResponse.json({ games: [] }, { status: r.status });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ games: [] }, { status: 502 });
  }
}
