import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Captures email signups for the daily digest. Posts to Resend's
 * audiences API when RESEND_API_KEY + RESEND_AUDIENCE_ID env vars
 * are set; otherwise just logs the address so it's visible in
 * Vercel logs.
 */
export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (apiKey && audienceId) {
    try {
      const r = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        }
      );
      if (!r.ok) {
        const text = await r.text();
        console.error("[email-signup] resend failed:", r.status, text);
        return NextResponse.json({ error: "Sign-up failed. Try again." }, { status: 502 });
      }
    } catch (e) {
      console.error("[email-signup] resend exception:", e);
      return NextResponse.json({ error: "Sign-up failed. Try again." }, { status: 502 });
    }
  } else {
    console.log("[email-signup] (no Resend configured)", email);
  }

  return NextResponse.json({ ok: true });
}
