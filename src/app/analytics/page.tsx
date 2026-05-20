"use client";

import Link from "next/link";
import { useIsPro } from "@/lib/useIsPro";
import { ProPaywall } from "@/components/billing/ProPaywall";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, Target, Users, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Shot Quality Analysis",
    description: "League-wide shot quality charts, expected vs. actual efficiency breakdowns.",
  },
  {
    icon: TrendingUp,
    title: "Pace & Space",
    description: "Team offensive system analysis — 3PT rate, paint touches, transition frequency.",
  },
  {
    icon: Users,
    title: "Lineup Explorer",
    description: "Build any 5-man lineup from across the NBA and project combined production.",
    href: "/analytics/lineup-explorer",
  },
  {
    icon: Zap,
    title: "On/Off Splits",
    description: "How each team performs with or without any player on the court.",
  },
  {
    icon: Target,
    title: "Clutch Stats",
    description: "Performance in final 5 minutes within 5 points — who shows up when it matters.",
  },
  {
    icon: TrendingUp,
    title: "Prop Bet Analyzer",
    description: "Player prop hit rates vs. current lines. Find the edges before games tip off.",
  },
];

export default function AnalyticsPage() {
  const { isPro, loaded } = useIsPro();

  if (!loaded) {
    return (
      <div className="px-4 lg:px-12 pt-16 pb-24 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <ProPaywall
        title="Analytics Hub"
        description="Advanced team and player analytics for serious fans, bettors, and fantasy players."
        features={[
          "Shot quality and efficiency charts",
          "Pace and space team breakdowns",
          "Lineup explorer with net rating splits",
          "On/off player impact",
          "Clutch performance trackers",
          "Player prop hit-rate analyzer",
        ]}
      />
    );
  }

  return (
    <div className="px-4 lg:px-12 pt-10 lg:pt-16 pb-24 max-w-6xl mx-auto premium-fade-in" data-reveal>
      <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
        Pro · Analytics
      </p>
      <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-3 leading-[0.95]">
        Beyond the box score.
      </h1>
      <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed mb-10">
        Every advanced tool, in one place. New tools land every few weeks.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => {
          const inner = (
            <>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#D4B560]/10 shrink-0">
                  <f.icon size={16} className="text-[#D4B560]" />
                </div>
                <h3 className="font-[family-name:var(--font-barlow)] font-bold text-base text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors">
                  {f.title}
                </h3>
              </div>
              <p className="text-xs text-[#8A8A93] leading-relaxed mb-3">
                {f.description}
              </p>
              <p className={`text-[10px] font-bold tracking-[0.15em] uppercase ${f.href ? "text-[#34D399]" : "text-[#6E6E76]"}`}>
                {f.href ? "Available now →" : "Coming soon"}
              </p>
            </>
          );
          const className = "floating-card group block rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-5";
          return f.href ? (
            <Link key={f.title} href={f.href} className={className}>
              {inner}
            </Link>
          ) : (
            <div key={f.title} className={className}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
