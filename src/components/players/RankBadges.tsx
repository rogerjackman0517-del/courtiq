"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

type Player = {
  id: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
};

type RankItem = { label: string; rank: number; value: string };

const STATS: Array<{ key: keyof Player; label: string; fmt: (n: number) => string }> = [
  { key: "pts", label: "PPG", fmt: (n) => n.toFixed(1) },
  { key: "reb", label: "RPG", fmt: (n) => n.toFixed(1) },
  { key: "ast", label: "APG", fmt: (n) => n.toFixed(1) },
  { key: "stl", label: "SPG", fmt: (n) => n.toFixed(1) },
  { key: "blk", label: "BPG", fmt: (n) => n.toFixed(1) },
  { key: "fgPct", label: "FG%", fmt: (n) => (n * 100).toFixed(1) + "%" },
  { key: "fg3Pct", label: "3P%", fmt: (n) => (n * 100).toFixed(1) + "%" },
];

export function RankBadges({ player, allPlayers }: { player: Player; allPlayers: Player[] }) {
  const ranks = useMemo<RankItem[]>(() => {
    if (!allPlayers || allPlayers.length === 0) return [];
    const items: RankItem[] = [];
    for (const stat of STATS) {
      const sorted = [...allPlayers].sort((a, b) => (b[stat.key] as number) - (a[stat.key] as number));
      const idx = sorted.findIndex((p) => p.id === player.id);
      if (idx >= 0 && idx < 50) {
        items.push({
          label: stat.label,
          rank: idx + 1,
          value: stat.fmt(player[stat.key] as number),
        });
      }
    }
    // Only show top 4 best ranks
    return items.sort((a, b) => a.rank - b.rank).slice(0, 4);
  }, [player, allPlayers]);

  if (ranks.length === 0) return null;

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ranks.map((r) => (
        <div
          key={r.label}
          className={`floating-card no-jiggle inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${
            r.rank <= 5 ? "ring-1 ring-[#D4B560]/30" : ""
          } ${r.rank === 1 ? "rank-badge-pulse" : ""}`}
        >
          {r.rank <= 5 && <TrendingUp size={12} className="text-[#D4B560]" />}
          <span className={`text-xs font-bold tabular-nums ${r.rank <= 5 ? "text-[#D4B560]" : "text-[#F5F5F7]"}`}>
            {ordinal(r.rank)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8A93]">
            in {r.label}
          </span>
        </div>
      ))}
    </div>
  );
}
