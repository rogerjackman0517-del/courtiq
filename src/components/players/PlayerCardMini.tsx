import Link from "next/link";
import type { Player, PlayerStats } from "@/types";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface PlayerCardMiniProps {
  player: Player;
  stats?: PlayerStats;
}

const injuryColor: Record<string, string> = {
  Healthy: "text-[#22C55E]",
  GTD: "text-[#F59E0B]",
  Out: "text-[#EF4444]",
  IL: "text-[#EF4444]",
};

export function PlayerCardMini({ player, stats }: PlayerCardMiniProps) {
  return (
    <Link
      href={`/players/${player.slug}`}
      className="group rounded-xl border border-white/[0.06] bg-[#111118] p-4 hover:border-white/[0.12] hover:bg-[#1A1A24] transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Avatar placeholder */}
        <div className="shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-[#1A1A24] to-[#0A0A0F] border border-white/[0.06] flex items-center justify-center text-sm font-bold text-[#C8A84B] font-[family-name:var(--font-barlow)]">
          {player.jerseyNumber}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-[family-name:var(--font-barlow)] font-bold text-base text-[#F0F0F0] truncate group-hover:text-[#C8A84B] transition-colors">
            {player.fullName}
          </p>
          <p className="text-xs text-[#888899] truncate">
            {player.teamCity} {player.teamName} · {player.position} · #{player.jerseyNumber}
          </p>
          {player.injuryStatus && player.injuryStatus !== "Healthy" && (
            <span className={cn("flex items-center gap-1 text-xs font-semibold mt-0.5", injuryColor[player.injuryStatus])}>
              <AlertCircle size={10} /> {player.injuryStatus}
            </span>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          {[
            { label: "PPG", value: stats.pts.toFixed(1) },
            { label: "RPG", value: stats.reb.toFixed(1) },
            { label: "APG", value: stats.ast.toFixed(1) },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-[family-name:var(--font-barlow)] font-bold text-lg text-[#F0F0F0] leading-none">{s.value}</p>
              <p className="text-[10px] font-semibold text-[#888899] uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
