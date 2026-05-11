import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require a paid Pro subscription
const isPremiumRoute = createRouteMatcher([
  "/analytics(.*)",
  "/fantasy(.*)",
  "/api/analytics(.*)",
]);

// Routes that require any auth (free account)
const isAuthRequired = createRouteMatcher([
  "/account(.*)",
  "/billing(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Premium routes: must be signed in AND have an active subscription
  if (isPremiumRoute(req)) {
    if (!userId) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(loginUrl);
    }

    const isPro = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.subscriptionStatus === "active";
    if (!isPro) {
      return NextResponse.redirect(new URL("/billing", req.url));
    }
  }

  // Auth-required routes: must be signed in
  if (isAuthRequired(req) && !userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
