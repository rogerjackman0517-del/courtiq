"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { GameCardSkeleton } from "@/components/ui/Skeleton";
import { CourtEmpty } from "@/components/ui/CourtEmpty";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GameTeam = {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  wins: number;
  losses: number;
  score: number;
  seed?: number;
};

type GameLeader = {
  name: string;
  points: number;
  rebounds: number;
  assists: number;
};

type LiveGame = {
  gameId: string;
  gameStatus: number;
  gameStatusText: string;
  gameLabel: string;
  gameSubLabel: string;
  seriesText: string;
  seriesConference: string;
  gameEt: string;
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  gameLeaders: {
    homeLeaders: GameLeader;
    awayLeaders: GameLeader;
  };
};

const TABS = ["All", "Live", "Final", "Upcoming"] as const;
type Tab = typeof TABS[number];

function statusBucket(g: LiveGame): "live" | "final" | "scheduled" {
  if (g.gameStatus === 2) return "live";
  if (g.gameStatus === 3) return "final";
  return "scheduled";
}

function GameCard({ game }: { game: LiveGame }) {
  const status = statusBucket(game);
  const awayWinning = game.awayTeam.score > game.homeTeam.score;
  const homeWinning = game.homeTeam.score > game.awayTeam.score;

  return (
    <Link
      href={`/scores/${game.gameId}`}
      className="floating-card no-jiggle group block rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.01]"
    >
      {/* Status header */}
      <div className="flex items-center justify-between mb-6">
        {status === "live" ? (
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#34D399]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75 animate-pulse" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
            </span>
            {game.gameStatusText}
          </span>
        ) : status === "final" ? (
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8A8A93]">Final</span>
        ) : (
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8A8A93]">
            {game.gameStatusText}
          </span>
        )}
        {game.seriesText && (
          <span className="text-[10px] tracking-wide text-[#6E6E76]">{game.seriesText}</span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-3">
        {/* Away */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {game.awayTeam.seed ? (
              <span className="text-[10px] font-bold text-[#6E6E76] tabular-nums w-3 text-center">{game.awayTeam.seed}</span>
            ) : (
              <span className="w-3" />
            )}
            <TeamLogo teamId={game.awayTeam.teamId} abbreviation={game.awayTeam.teamTricode} size="md" />
            <div className="min-w-0">
              <p className={cn("text-xs font-bold tracking-wide", awayWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]")}>
                {game.awayTeam.teamTricode}
              </p>
              <p className={cn("text-sm font-medium tracking-tight truncate", awayWinning ? "text-[#F5F5F7]" : "text-[#8A8A93]")}>
                {game.awayTeam.teamName}
              </p>
            </div>
          </div>
          <span className={cn(
            "font-[family-name:var(--font-barlow)] font-black text-4xl tabular-nums tracking-[-0.04em] ml-4",
            status === "scheduled" ? "text-[#3A3A42]" :
            awayWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]"
          )}>
            {status === "scheduled" ? "—" : game.awayTeam.score}
          </span>
        </div>

        {/* Home */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {game.homeTeam.seed ? (
              <span className="text-[10px] font-bold text-[#6E6E76] tabular-nums w-3 text-center">{game.homeTeam.seed}</span>
            ) : (
              <span className="w-3" />
            )}
            <TeamLogo teamId={game.homeTeam.teamId} abbreviation={game.homeTeam.teamTricode} size="md" />
            <div className="min-w-0">
              <p className={cn("text-xs font-bold tracking-wide", homeWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]")}>
                {game.homeTeam.teamTricode}
              </p>
              <p className={cn("text-sm font-medium tracking-tight truncate", homeWinning ? "text-[#F5F5F7]" : "text-[#8A8A93]")}>
                {game.homeTeam.teamName}
              </p>
            </div>
          </div>
          <span className={cn(
            "font-[family-name:var(--font-barlow)] font-black text-4xl tabular-nums tracking-[-0.04em] ml-4",
            status === "scheduled" ? "text-[#3A3A42]" :
            homeWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]"
          )}>
            {status === "scheduled" ? "—" : game.homeTeam.score}
          </span>
        </div>
      </div>

      {/* Game leaders */}
      {(status === "live" || status === "final") && game.gameLeaders.awayLeaders.name && (
        <div className="mt-6 pt-5 border-t border-white/[0.04] grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76] mb-1.5">{game.awayTeam.teamTricode} Leader</p>
            <p className="text-xs font-semibold text-[#F5F5F7] truncate tracking-tight">{game.gameLeaders.awayLeaders.name}</p>
            <p className="text-[11px] text-[#8A8A93] mt-0.5 tabular-nums">
              {game.gameLeaders.awayLeaders.points} pts · {game.gameLeaders.awayLeaders.rebounds} reb · {game.gameLeaders.awayLeaders.assists} ast
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76] mb-1.5">{game.homeTeam.teamTricode} Leader</p>
            <p className="text-xs font-semibold text-[#F5F5F7] truncate tracking-tight">{game.gameLeaders.homeLeaders.name}</p>
            <p className="text-[11px] text-[#8A8A93] mt-0.5 tabular-nums">
              {game.gameLeaders.homeLeaders.points} pts · {game.gameLeaders.homeLeaders.rebounds} reb · {game.gameLeaders.homeLeaders.assists} ast
            </p>
          </div>
        </div>
      )}

      {game.gameLabel && (
        <div className="mt-4 text-[10px] text-[#D4B560] font-bold uppercase tracking-[0.2em]">
          {game.gameLabel}
        </div>
      )}
    </Link>
  );
}

export default function ScoresPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [tab, setTab] = useState<Tab>("All");
  const [games, setGames] = useState<LiveGame[]>([]);
  const [gameDate, setGameDate] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = selectedDate === todayStr
      ? "/api/games/today"
      : `/api/games/today?date=${selectedDate}`;
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(data => {
        if (cancelled) return;
        const sb = data?.scoreboard;
        if (sb && Array.isArray(sb.games)) {
          setGames(sb.games);
          setGameDate(sb.gameDate ?? "");
          setError(null);
        } else {
          setError("Unexpected response shape");
        }
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Date nav helpers
  const shiftDate = (deltaDays: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(d.toISOString().slice(0, 10));
  };
  const dateLabel = (() => {
    if (selectedDate === todayStr) return "Today";
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (selectedDate === yesterday) return "Yesterday";
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    if (selectedDate === tomorrow) return "Tomorrow";
    return new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  })();

  const filtered = games.filter(g => {
    if (tab === "Live") return statusBucket(g) === "live";
    if (tab === "Final") return statusBucket(g) === "final";
    if (tab === "Upcoming") return statusBucket(g) === "scheduled";
    return true;
  });

  const liveCount = games.filter(g => statusBucket(g) === "live").length;
  const dateStr = gameDate ? new Date(gameDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "";

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            {dateStr || "Today"}
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            {liveCount > 0 ? (
              <>
                <span className="text-[#34D399]">{liveCount} game{liveCount !== 1 ? "s" : ""} live</span><br />
                right now.
              </>
            ) : (
              <>
                Scores &<br />
                <span className="text-[#D4B560]">schedule.</span>
              </>
            )}
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            {liveCount > 0
              ? "Live scores, game leaders, and playoff series updates."
              : "All games and final scores for the day."
            }
          </p>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <section className="px-4 lg:px-12 py-8 lg:py-16" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">

          {/* Tabs */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button type="button" onClick={() => shiftDate(-1)} className="no-jiggle flex items-center gap-1.5 text-xs font-medium text-[#8A8A93] hover:text-[#F5F5F7] px-3 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.06] transition-colors">
              <ChevronLeft size={14} /> Previous
            </button>
            <div className="px-4 py-2 rounded-full bg-[#1C1C24] border border-white/[0.06]">
              <span className="text-sm font-bold tracking-tight text-[#F5F5F7]">{dateLabel}</span>
            </div>
            <button type="button" onClick={() => shiftDate(1)} className="no-jiggle flex items-center gap-1.5 text-xs font-medium text-[#8A8A93] hover:text-[#F5F5F7] px-3 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.06] transition-colors">
              Next <ChevronRight size={14} />
            </button>
            {selectedDate !== todayStr && (
              <button type="button" onClick={() => setSelectedDate(todayStr)} className="no-jiggle text-xs font-medium text-[#D4B560] hover:text-[#E8C770] px-3 py-2 transition-colors">
                Back to today
              </button>
            )}
          </div>

          <div className="inline-flex items-center gap-1 bg-[#1C1C24] border border-white/[0.05] rounded-full p-1 mb-10">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-all duration-300",
                  tab === t ? "bg-[#F5F5F7] text-[#0A0A0E]" : "text-[#8A8A93] hover:text-[#F5F5F7]"
                )}
              >
                {t}
                {t === "Live" && liveCount > 0 && (
                  <span className={cn(
                    "ml-1.5 text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full",
                    tab === t ? "bg-[#34D399] text-[#0A0A0E]" : "bg-[#34D399]/15 text-[#34D399]"
                  )}>
                    {liveCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 mb-6 text-sm text-[#F87171]">
              Failed to load: {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={"game-skel-" + i} />)}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <CourtEmpty
              title={games.length === 0 ? "No games on the slate today." : "Nothing in this category."}
              subtitle={
                games.length === 0
                  ? "Check back tomorrow, or jump to the standings to see where every team sits."
                  : "Try a different filter — there are games in another category."
              }
            />
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(game => <GameCard key={game.gameId} game={game} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
