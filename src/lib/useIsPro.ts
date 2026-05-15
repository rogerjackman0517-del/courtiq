"use client";

import { useUser } from "@clerk/nextjs";

/**
 * Reads the subscription status that the Stripe webhook writes onto the
 * Clerk user's publicMetadata. Active = Pro.
 */
export function useIsPro(): { isPro: boolean; isSignedIn: boolean; loaded: boolean } {
  const { isLoaded, isSignedIn, user } = useUser();
  const status = (user?.publicMetadata as { subscriptionStatus?: string } | undefined)?.subscriptionStatus;
  return {
    loaded: isLoaded,
    isSignedIn: !!isSignedIn,
    isPro: status === "active",
  };
}
