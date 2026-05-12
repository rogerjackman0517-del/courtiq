import { NextResponse } from "next/server";

const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const url = `${BACKEND}/games/${encodeURIComponent(gameId)}/boxscore`;
  console.log(`[games/boxscore] fetching ${url}`);
  try {
    const r = await fetch(url, { next: { revalidate: 60 } });
    console.log(`[games/boxscore] status ${r.status}`);
    if (!r.ok) {
      return NextResponse.json({ error: "Boxscore not found" }, { status: r.status });
    }
    return NextResponse.json(await r.json());
  } catch (e) {
    console.error(`[games/boxscore] error`, e);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
