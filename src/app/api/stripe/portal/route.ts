import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the Stripe customer ID stored in Clerk private metadata
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const customerId = (user.privateMetadata as Record<string, string>).stripeCustomerId;

  if (!customerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
