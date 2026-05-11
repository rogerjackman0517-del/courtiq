import Link from "next/link";
import type { Game } from "@/types";
import { cn } from "@/lib/utils";

interface GameCardProps {
  game: Game;
}

function OddsChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888899]">{label}</span>
      <span className="text-xs font-bold text-[#F0F0F0]">{value}</span>
    </div>
  );
}

export function GameCard({ game }: GameCardProps) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const homeLeads = game.homeTeam.score > game.awayTeam.score;
  const awayLeads = game.awayTeam.score > game.homeTeam.score;

  return (
    <Link
      href={`/scores/${game.id}`}
      className="block rounded-xl border border-white/[0.06] bg-[#111118] p-4 hover:border-white/[0.12] hover:bg-[#1A1A24] transition-all"
    >
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        {isLive ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            Q{game.period} {game.clock}
          </span>
        ) : isFinal ? (
          <span className="text-xs font-bold text-[#888899]">FINAL</span>
        ) : (
          <span className="text-xs font-bold text-[#4B7BE8]">TODAY · 7:00 PM ET</span>
        )}
        {game.odds && !isFinal && (
          <span className="text-[10px] text-[#888899] bg-white/[0.04] px-1.5 py-0.5 rounded">
            O/U {game.odds.total}
          </span>
        )}
      </div>

      {/* Teams & Scores */}
      <div className="space-y-1.5">
        {[
          { team: game.awayTeam, leads: awayLeads },
          { team: game.homeTeam, leads: homeLeads },
        ].map(({ team, leads }) => (
          <div key={team.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[#1A1A24] border border-white/[0.06] flex items-center justify-center text-[10px] font-black text-[#888899]">
                {team.abbr}
              </div>
              <div>
                <span className={cn(
                  "text-sm font-semibold",
                  leads && (isLive || isFinal) ? "text-[#F0F0F0]" : "text-[#888899]"
                )}>
                  {team.name}
                </span>
                {team.record && (
                  <span className="text-[10px] text-[#888899] ml-1.5">{team.record}</span>
                )}
              </div>
            </div>
            {(isLive || isFinal) && (
              <span className={cn(
                "font-[family-name:var(--font-barlow)] font-bold text-xl",
                leads ? "text-[#F0F0F0]" : "text-[#888899]"
              )}>
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Odds row */}
      {game.odds && !isFinal && (
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-white/[0.06]">
          <OddsChip
            label="Spread"
            value={game.odds.spread > 0 ? `+${game.odds.spread}` : game.odds.spread}
          />
          <OddsChip
            label="ML Home"
            value={game.odds.moneylineHome > 0 ? `+${game.odds.moneylineHome}` : game.odds.moneylineHome}
          />
          <OddsChip
            label="ML Away"
            value={game.odds.moneylineAway > 0 ? `+${game.odds.moneylineAway}` : game.odds.moneylineAway}
          />
        </div>
      )}
    </Link>
  );
}
