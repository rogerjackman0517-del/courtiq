"use client";

import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Sparkline } from "@/components/players/Sparkline";
import { PLAYER_NICKNAMES } from "@/lib/playerNicknames";
import { cn } from "@/lib/utils";

type Props = {
  player: {
    id: number;
    fullName: string;
    slug: string;
    teamAbbr: string;
    teamId?: number;
    position?: string;
    pts: number;
    reb: number;
    ast: number;
    fgPct?: number;
    gp?: number;
  };
  variant?: "compact" | "default" | "wide";
  badge?: React.ReactNode;
  className?: string;
};

/**
 * Reusable player card — used in trending, comparison shortlists,
 * roster grids, and anywhere a player needs a consistent presentation.
 */
export function PlayerCard({ player, variant = "default", badge, className }: Props) {
  const nickname = PLAYER_NICKNAMES[player.slug];
  return (
    <Link
      href={`/players/${player.slug}`}
      className={cn(
        "floating-card group block rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] transition-all hover:scale-[1.02]",
        variant === "compact" ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar
          playerId={player.id}
          fullName={player.fullName}
          size={variant === "compact" ? "sm" : "md"}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#F5F5F7] truncate group-hover:text-[#D4B560] transition-colors">
              {player.fullName}
            </p>
            {badge}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E6E76] tracking-wider">
            <TeamLogo teamId={player.teamId} abbreviation={player.teamAbbr} size="xs" />
            <span>{player.teamAbbr}</span>
            {player.position && (
              <>
                <span className="text-[#3A3A42]">·</span>
                <span>{player.position}</span>
              </>
            )}
            {nickname && variant !== "compact" && (
              <>
                <span className="text-[#3A3A42]">·</span>
                <span className="text-[#8A8A93] italic">&ldquo;{nickname}&rdquo;</span>
              </>
            )}
          </div>
        </div>
      </div>

      {variant !== "compact" && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "PTS", value: player.pts },
            { label: "REB", value: player.reb },
            { label: "AST", value: player.ast },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-[family-name:var(--font-barlow)] font-black text-xl tabular-nums text-[#F5F5F7]">
                {s.value.toFixed(1)}
              </p>
              <p className="text-[9px] text-[#6E6E76] tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {variant === "wide" && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <Sparkline seed={player.id} average={player.pts} width={64} height={18} />
          {player.fgPct !== undefined && (
            <span className="text-[10px] text-[#8A8A93] tabular-nums">
              {(player.fgPct * 100).toFixed(1)}% FG
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
