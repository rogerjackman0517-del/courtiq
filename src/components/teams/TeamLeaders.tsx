"use client";

import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";

type Player = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  pts: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
};

const CATEGORIES = [
  { key: "pts" as const, label: "Top Scorer", unit: "PPG" },
  { key: "reb" as const, label: "Top Rebounder", unit: "RPG" },
  { key: "ast" as const, label: "Top Playmaker", unit: "APG" },
  { key: "blk" as const, label: "Top Rim Protector", unit: "BPG" },
];

export function TeamLeaders({ teamAbbr, players }: { teamAbbr: string; players: Player[] }) {
  const roster = players.filter((p) => p.teamAbbr === teamAbbr);
  if (roster.length === 0) return null;

  const leaders = CATEGORIES.map((cat) => {
    const sorted = [...roster].sort((a, b) => (b[cat.key] as number) - (a[cat.key] as number));
    const top = sorted[0];
    if (!top || (top[cat.key] as number) <= 0) return null;
    return { ...cat, player: top, value: top[cat.key] as number };
  }).filter(Boolean) as Array<{ key: string; label: string; unit: string; player: Player; value: number }>;

  if (leaders.length === 0) return null;

  return (
    <section className="px-4 lg:px-12 py-10 lg:py-16" data-reveal>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 lg:mb-10">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">
            Team Leaders
          </p>
          <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
            Who&apos;s carrying.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaders.map((l) => (
            <Link
              key={l.key}
              href={`/players/${l.player.slug}`}
              className="floating-card no-jiggle group rounded-3xl p-5 hover:scale-[1.02] transition-transform"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4B560] mb-4">
                {l.label}
              </p>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4B560]/20 to-transparent blur-2xl scale-110" />
                  <PlayerAvatar
                    playerId={l.player.id}
                    fullName={l.player.fullName}
                    size="lg"
                    className="relative ring-2 ring-[#D4B560]/30"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-barlow)] font-bold text-base text-[#F5F5F7] tracking-tight truncate group-hover:text-[#D4B560] transition-colors">
                    {l.player.fullName}
                  </p>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-3xl tabular-nums tracking-tight stat-gold mt-1">
                    {l.value.toFixed(1)}
                    <span className="text-sm text-[#8A8A93] font-medium ml-1">{l.unit}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
