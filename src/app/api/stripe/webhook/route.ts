import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";

// Stripe requires the raw body for signature verification — disable body parsing
export const dynamic = "force-dynamic";

async function updateUserSubscription(
  userId: string,
  status: "active" | "canceled" | "past_due",
  customerId: string,
  subscriptionId: string,
) {
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata:  { subscriptionStatus: status },
    privateMetadata: { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId  = session.metadata?.userId;
      const subId   = session.subscription as string;
      const custId  = session.customer as string;
      if (userId && subId) {
        await updateUserSubscription(userId, "active", custId, subId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled";
      if (userId) {
        await updateUserSubscription(userId, status as "active" | "canceled" | "past_due", sub.customer as string, sub.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await updateUserSubscription(userId, "canceled", sub.customer as string, sub.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
