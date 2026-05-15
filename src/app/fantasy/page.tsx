"use client";

import { useIsPro } from "@/lib/useIsPro";
import { ProPaywall } from "@/components/billing/ProPaywall";
import { Skeleton } from "@/components/ui/Skeleton";
import { Star, Layers, TrendingUp, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Star,
    title: "Daily Lineup Optimizer",
    description: "Build optimal DraftKings / FanDuel lineups under salary cap with projected points.",
  },
  {
    icon: Layers,
    title: "Stacking Strategy",
    description: "Auto-suggest game stacks and player correlations for tournament play.",
  },
  {
    icon: TrendingUp,
    title: "Injury Heatmap",
    description: "Real-time injury tags + minutes projection so you never start a DNP.",
  },
  {
    icon: Zap,
    title: "Late Swap Engine",
    description: "Rebalance lineups in real time as news breaks and slates shift.",
  },
];

export default function FantasyPage() {
  const { isPro, loaded } = useIsPro();

  if (!loaded) {
    return (
      <div className="px-4 lg:px-12 pt-16 pb-24 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <ProPaywall
        title="Fantasy Edge"
        description="Tools for daily fantasy and season-long managers — built on the same data powering the rest of CourtIQ."
        features={[
          "Daily DFS lineup optimizer",
          "Stacking and correlation suggestions",
          "Real-time injury impact heatmap",
          "Late-swap engine for live slates",
        ]}
      />
    );
  }

  return (
    <div className="px-4 lg:px-12 pt-10 lg:pt-16 pb-24 max-w-6xl mx-auto premium-fade-in" data-reveal>
      <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
        Pro · Fantasy
      </p>
      <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-3 leading-[0.95]">
        Win your league.
      </h1>
      <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed mb-10">
        DFS optimizer, injury heatmap, stacking engine. Rolling out tool-by-tool.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="floating-card rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#D4B560]/10 shrink-0">
                <Icon size={16} className="text-[#D4B560]" />
              </div>
              <h3 className="font-[family-name:var(--font-barlow)] font-bold text-base text-[#F5F5F7]">
                {title}
              </h3>
            </div>
            <p className="text-xs text-[#8A8A93] leading-relaxed mb-3">
              {description}
            </p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6E6E76]">
              Coming soon
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
