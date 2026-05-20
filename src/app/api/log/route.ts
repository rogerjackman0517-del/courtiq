import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Lightweight error log endpoint. Until Sentry/LogTail is wired, errors
 * land in Vercel logs via console.error.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.error("[client-log]", JSON.stringify(body));
  } catch {
    /* ignore */
  }
  return NextResponse.json({ ok: true });
}
