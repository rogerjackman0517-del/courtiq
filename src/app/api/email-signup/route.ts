import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Captures email signups for the (future) daily digest. Without a Resend
 * account hooked up yet, this just acknowledges. Once Resend is wired,
 * post to the Resend audiences API here.
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

  // TODO: once Resend is configured, POST to:
  //   https://api.resend.com/audiences/{AUDIENCE_ID}/contacts
  //   with Authorization: Bearer ${RESEND_API_KEY}
  console.log("[email-signup]", email);

  return NextResponse.json({ ok: true });
}
