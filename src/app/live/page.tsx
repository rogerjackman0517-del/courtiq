"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RadioTower } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Skeleton } from "@/components/ui/Skeleton";
import { CourtEmpty } from "@/components/ui/CourtEmpty";

type Team = {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  wins: number;
  losses: number;
  score: number;
};

type Game = {
  gameId: string;
  gameStatus: number; // 1 = upcoming, 2 = live, 3 = final
  gameStatusText: string;
  seriesText?: string;
  homeTeam: Team;
  awayTeam: Team;
};

type ScoreboardResponse = {
  scoreboard: { gameDate: string; games: Game[] };
};

const POLL_INTERVAL_MS = 30000;

// Animated score that flashes when value changes
function AnimatedScore({ value }: { value: number }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <span
      className={`tabular-nums transition-all duration-300 ${
        flash ? "text-[#D4B560] [text-shadow:0_0_20px_rgba(212,181,96,0.6)]" : ""
      }`}
    >
      {value}
    </span>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#34D399]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
      </span>
      Live
    </span>
  );
}

function MarqueeCard({ game }: { game: Game }) {
  const awayWinning = game.awayTeam.score > game.homeTeam.score;
  const homeWinning = game.homeTeam.score > game.awayTeam.score;

  return (
    <Link
      href={`/scores/${game.gameId}`}
      className="floating-card no-jiggle block rounded-3xl p-6 lg:p-10 relative overflow-hidden"
    >
      {/* Subtle pulsing background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#34D399]/[0.04] to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LiveBadge />
            <span className="text-[#3F3F46]">·</span>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F5F5F7]">
              {game.gameStatusText}
            </span>
          </div>
          {game.seriesText && (
            <span className="hidden sm:inline text-xs text-[#8A8A93]">{game.seriesText}</span>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 lg:gap-12 items-center">
          {/* Away */}
          <div className="flex flex-col items-center text-center gap-3">
            <TeamLogo teamId={game.awayTeam.teamId} abbreviation={game.awayTeam.teamTricode} size="xl" />
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                {game.awayTeam.teamTricode}
              </p>
              <p className="font-[family-name:var(--font-barlow)] font-bold text-lg lg:text-2xl tracking-tight text-[#F5F5F7] mt-1">
                {game.awayTeam.teamName}
              </p>
              <p className="text-xs text-[#6E6E76]">{game.awayTeam.wins}-{game.awayTeam.losses}</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-baseline gap-2 lg:gap-6 font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-tight">
            <span className={awayWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]"}>
              <AnimatedScore value={game.awayTeam.score} />
            </span>
            <span className="text-[#3F3F46] text-2xl lg:text-3xl">·</span>
            <span className={homeWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]"}>
              <AnimatedScore value={game.homeTeam.score} />
            </span>
          </div>

          {/* Home */}
          <div className="flex flex-col items-center text-center gap-3">
            <TeamLogo teamId={game.homeTeam.teamId} abbreviation={game.homeTeam.teamTricode} size="xl" />
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                {game.homeTeam.teamTricode}
              </p>
              <p className="font-[family-name:var(--font-barlow)] font-bold text-lg lg:text-2xl tracking-tight text-[#F5F5F7] mt-1">
                {game.homeTeam.teamName}
              </p>
              <p className="text-xs text-[#6E6E76]">{game.homeTeam.wins}-{game.homeTeam.losses}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MiniCard({ game }: { game: Game }) {
  const awayWinning = game.awayTeam.score > game.homeTeam.score;
  const homeWinning = game.homeTeam.score > game.awayTeam.score;

  return (
    <Link
      href={`/scores/${game.gameId}`}
      className="floating-card no-jiggle block rounded-2xl p-5 hover:scale-[1.01] transition-transform"
    >
      <div className="flex items-center justify-between mb-4">
        <LiveBadge />
        <span className="text-xs text-[#8A8A93]">{game.gameStatusText}</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <TeamLogo teamId={game.awayTeam.teamId} abbreviation={game.awayTeam.teamTricode} size="sm" />
            <p className={`text-sm font-medium truncate ${awayWinning ? "text-[#F5F5F7]" : "text-[#8A8A93]"}`}>
              {game.awayTeam.teamName}
            </p>
          </div>
          <span className={`font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums ${awayWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]"}`}>
            <AnimatedScore value={game.awayTeam.score} />
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <TeamLogo teamId={game.homeTeam.teamId} abbreviation={game.homeTeam.teamTricode} size="sm" />
            <p className={`text-sm font-medium truncate ${homeWinning ? "text-[#F5F5F7]" : "text-[#8A8A93]"}`}>
              {game.homeTeam.teamName}
            </p>
          </div>
          <span className={`font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums ${homeWinning ? "text-[#F5F5F7]" : "text-[#6E6E76]"}`}>
            <AnimatedScore value={game.homeTeam.score} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LivePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const r = await fetch("/api/games/today");
        if (!r.ok) return;
        const data: ScoreboardResponse = await r.json();
        setGames(data.scoreboard?.games ?? []);
        setLastUpdated(new Date());
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
    const interval = setInterval(fetchGames, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const live = games.filter((g) => g.gameStatus === 2);
  const upcoming = games.filter((g) => g.gameStatus === 1).slice(0, 4);
  const final = games.filter((g) => g.gameStatus === 3).slice(0, 4);

  const marquee = live[0];
  const moreLive = live.slice(1);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow relative px-4 lg:px-12 pt-10 lg:pt-16 max-w-6xl mx-auto" data-reveal>
        {/* Header */}
        <div className="flex items-end justify-between mb-10 lg:mb-14 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <RadioTower size={14} className="text-[#34D399]" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#34D399]">
                Live now
              </p>
            </div>
            <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#F5F5F7] mb-3">
              Tonight&apos;s <span className="stat-gold">action.</span>
            </h1>
            <p className="text-base lg:text-lg text-[#8A8A93]">
              {loading
                ? "Checking the league..."
                : live.length > 0
                ? `${live.length} game${live.length === 1 ? "" : "s"} in progress · auto-refreshing`
                : "No games live right now."}
            </p>
          </div>
          {lastUpdated && (
            <p className="text-[10px] text-[#6E6E76] tracking-wider">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
        </div>

        {loading ? (
          <Skeleton className="h-72 rounded-3xl mb-10" />
        ) : marquee ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                Marquee matchup
              </span>
            </div>
            <div className="mb-10 lg:mb-14">
              <MarqueeCard game={marquee} />
            </div>

            {moreLive.length > 0 && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                    Other live games
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 lg:mb-14">
                  {moreLive.map((g) => (
                    <MiniCard key={g.gameId} game={g} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="mb-10 lg:mb-14">
            <CourtEmpty
              title="No games live right now"
              subtitle={
                upcoming.length > 0
                  ? `Next tip-off: ${upcoming[0].gameStatusText} · ${upcoming[0].awayTeam.teamTricode} @ ${upcoming[0].homeTeam.teamTricode}`
                  : "Quiet night across the league. Check back when the next slate tips off."
              }
            />
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                Upcoming
              </span>
              <Link
                href="/scores"
                className="inline-flex items-center gap-1 text-xs text-[#8A8A93] hover:text-[#F5F5F7] no-jiggle"
              >
                All scores <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {upcoming.map((g) => (
                <Link
                  key={g.gameId}
                  href={`/scores/${g.gameId}`}
                  className="floating-card no-jiggle block rounded-2xl p-4 hover:scale-[1.01] transition-transform"
                >
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
                    {g.gameStatusText}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamLogo teamId={g.awayTeam.teamId} abbreviation={g.awayTeam.teamTricode} size="sm" />
                      <p className="text-sm text-[#F5F5F7]">{g.awayTeam.teamName}</p>
                    </div>
                    <span className="text-[#6E6E76] text-xs">@</span>
                    <div className="flex items-center gap-3 min-w-0">
                      <p className="text-sm text-[#F5F5F7]">{g.homeTeam.teamName}</p>
                      <TeamLogo teamId={g.homeTeam.teamId} abbreviation={g.homeTeam.teamTricode} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Recent Finals */}
        {final.length > 0 && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                Recently finished
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {final.map((g) => (
                <MiniCard key={g.gameId} game={g} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
