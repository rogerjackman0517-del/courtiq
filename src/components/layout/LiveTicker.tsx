"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LiveClock } from "@/components/ui/LiveClock";

type Team = { teamTricode: string; score: number };
type Game = {
  gameId: string;
  gameStatus: number;       // 1 = upcoming, 2 = live, 3 = final
  gameStatusText: string;
  homeTeam: Team;
  awayTeam: Team;
};

export function LiveTicker() {
  const [games, setGames] = useState<Game[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const prevScoresRef = useRef<Record<string, { home: number; away: number }>>({});
  const [pulseKeys, setPulseKeys] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchAll() {
      try {
        const r = await fetch("/api/games/today");
        if (!r.ok) return;
        const data = await r.json();
        const all: Game[] = data?.scoreboard?.games ?? [];
        if (cancelled) return;

        // Detect score changes for pulse — only on live games
        const next: Record<string, number> = {};
        all.filter((g) => g.gameStatus === 2).forEach((g) => {
          const prev = prevScoresRef.current[g.gameId];
          if (prev) {
            if (prev.home !== g.homeTeam.score) next[g.gameId + ":home"] = Date.now();
            if (prev.away !== g.awayTeam.score) next[g.gameId + ":away"] = Date.now();
          }
          prevScoresRef.current[g.gameId] = {
            home: g.homeTeam.score,
            away: g.awayTeam.score,
          };
        });
        if (Object.keys(next).length > 0) {
          setPulseKeys((p) => ({ ...p, ...next }));
        }

        // Sort: live first, then upcoming, then finals (most recent finals end first)
        const sorted = [...all].sort((a, b) => {
          const order = (g: Game) => (g.gameStatus === 2 ? 0 : g.gameStatus === 1 ? 1 : 2);
          return order(a) - order(b);
        });
        setGames(sorted);
      } catch {
        // ignore
      }
    }

    fetchAll();
    interval = setInterval(fetchAll, 30_000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);

  if (dismissed || games.length === 0) return null;

  const hasLive = games.some((g) => g.gameStatus === 2);
  const labelColor = hasLive ? "text-[#34D399]" : "text-[#8A8A93]";
  const dotColor = hasLive ? "bg-[#34D399]" : "bg-[#6E6E76]";
  const borderColor = hasLive ? "border-[#34D399]/20" : "border-white/[0.04]";
  const label = hasLive ? "Live" : "Today";

  return (
    <div className={`sticky top-0 z-40 bg-gradient-to-r from-[#0A0A0E] via-[#101018] to-[#0A0A0E] border-b ${borderColor} backdrop-blur-md`}>
      <div className="relative overflow-hidden">
        <div className="flex items-center gap-4 px-4 lg:px-6 h-9">
          {/* Live/Today dot + label */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              {hasLive && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75 animate-pulse" />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
            </span>
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${labelColor}`}>
              {label}
            </span>
          </div>

          {/* Scrolling games */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-6 text-xs whitespace-nowrap animate-ticker-slide">
              {games.concat(games).map((g, i) => {
                const isLive = g.gameStatus === 2;
                const isFinal = g.gameStatus === 3;
                const isUpcoming = g.gameStatus === 1;
                const awayWin = g.awayTeam.score > g.homeTeam.score;
                const homeWin = g.homeTeam.score > g.awayTeam.score;
                const homeKey = g.gameId + ":home";
                const awayKey = g.gameId + ":away";
                const homePulsed = isLive && pulseKeys[homeKey] && Date.now() - pulseKeys[homeKey] < 1800;
                const awayPulsed = isLive && pulseKeys[awayKey] && Date.now() - pulseKeys[awayKey] < 1800;
                const renderSparkles = (count = 6) =>
                  Array.from({ length: count }).map((_, k) => {
                    const angle = (k / count) * Math.PI * 2;
                    const dx = Math.cos(angle) * 14;
                    const dy = Math.sin(angle) * 14;
                    return (
                      <span
                        key={k}
                        className="sparkle"
                        style={{
                          left: "50%",
                          top: "50%",
                          ["--sx" as string]: `${dx.toFixed(1)}px`,
                          ["--sy" as string]: `${dy.toFixed(1)}px`,
                          animationDelay: `${k * 30}ms`,
                        }}
                      />
                    );
                  });
                const teamColor = (winner: boolean) => {
                  if (isUpcoming) return "text-[#6E6E76]";
                  if (isLive) return "text-[#F5F5F7]";
                  return winner ? "text-[#F5F5F7]" : "text-[#6E6E76]";
                };
                return (
                  <Link
                    key={`${g.gameId}-${i}`}
                    href={`/scores/${g.gameId}`}
                    className="flex items-center gap-2.5 hover:text-[#D4B560] transition-colors group"
                  >
                    <span className={`font-medium ${isUpcoming ? "text-[#8A8A93]" : "text-[#8A8A93]"}`}>{g.awayTeam.teamTricode}</span>
                    <span
                      className={`relative font-[family-name:var(--font-barlow)] font-bold tabular-nums ${teamColor(awayWin)} ${awayPulsed ? "score-pulse" : ""}`}
                    >
                      {isUpcoming ? "—" : g.awayTeam.score}
                      {awayPulsed && renderSparkles()}
                    </span>
                    <span className="text-[#3A3A42]">·</span>
                    <span
                      className={`relative font-[family-name:var(--font-barlow)] font-bold tabular-nums ${teamColor(homeWin)} ${homePulsed ? "score-pulse" : ""}`}
                    >
                      {isUpcoming ? "—" : g.homeTeam.score}
                      {homePulsed && renderSparkles()}
                    </span>
                    <span className="text-[#8A8A93] font-medium">{g.homeTeam.teamTricode}</span>
                    {isFinal ? (
                      <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#6E6E76]">Final</span>
                    ) : (
                      <LiveClock statusText={g.gameStatusText} className="text-[10px] text-[#6E6E76]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-[#6E6E76] hover:text-[#F5F5F7] text-xs no-jiggle shrink-0"
            aria-label="Hide live ticker"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
