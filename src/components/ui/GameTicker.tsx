"use client";

import { cn } from "@/lib/utils";

interface TickerGame {
  id: string;
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
  status: string;
  period?: string;
}

const MOCK_GAMES: TickerGame[] = [
  { id: "1", homeTeam: "LAL", homeScore: 112, awayTeam: "GSW", awayScore: 108, status: "live", period: "Q4 2:34" },
  { id: "2", homeTeam: "BOS", homeScore: 98,  awayTeam: "MIA", awayScore: 95,  status: "live", period: "Q3 8:12" },
  { id: "3", homeTeam: "PHX", homeScore: 0,   awayTeam: "DEN", awayScore: 0,   status: "scheduled", period: "7:00 PM" },
  { id: "4", homeTeam: "NYK", homeScore: 118, awayTeam: "PHI", awayScore: 104, status: "final" },
  { id: "5", homeTeam: "MIL", homeScore: 0,   awayTeam: "IND", awayScore: 0,   status: "scheduled", period: "8:30 PM" },
  { id: "6", homeTeam: "DAL", homeScore: 107, awayTeam: "OKC", awayScore: 111, status: "final" },
];

function GameChip({ game }: { game: TickerGame }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-r border-white/[0.06] shrink-0">
      <div className="flex flex-col gap-0.5 text-right w-7">
        <span className="text-[11px] font-bold text-[#888899]">{game.awayTeam}</span>
        <span className="text-[11px] font-bold text-[#888899]">{game.homeTeam}</span>
      </div>
      <div className="flex flex-col gap-0.5 w-6 text-right">
        <span className={cn("text-[11px] font-bold", game.awayScore > game.homeScore && isFinal ? "text-[#F0F0F0]" : "text-[#888899]")}>
          {isFinal || isLive ? game.awayScore : "-"}
        </span>
        <span className={cn("text-[11px] font-bold", game.homeScore > game.awayScore && isFinal ? "text-[#F0F0F0]" : "text-[#888899]")}>
          {isFinal || isLive ? game.homeScore : "-"}
        </span>
      </div>
      <div className="flex flex-col items-start gap-0.5">
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#22C55E]">
            <span className="h-1 w-1 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            {game.period}
          </span>
        )}
        {isFinal && (
          <span className="text-[10px] font-semibold text-[#888899]">FINAL</span>
        )}
        {game.status === "scheduled" && (
          <span className="text-[10px] font-semibold text-[#888899]">{game.period}</span>
        )}
      </div>
    </div>
  );
}

export function GameTicker() {
  return (
    <div className="w-full bg-[#111118] border-b border-white/[0.06] overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        <div className="flex items-center px-3 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A84B] whitespace-nowrap">Today</span>
        </div>
        {MOCK_GAMES.map(game => (
          <GameChip key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
