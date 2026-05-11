import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Lazy — only instantiated at request time when env var is available
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
    amount: 999,
    interval: "month" as const,
    label: "$9.99/mo",
  },
  annual: {
    priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
    amount: 7900,
    interval: "year" as const,
    label: "$79/yr",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
