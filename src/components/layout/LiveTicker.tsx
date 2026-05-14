"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Team = { teamTricode: string; score: number };
type Game = {
  gameId: string;
  gameStatus: number;
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

    async function fetchLive() {
      try {
        const r = await fetch("/api/games/today");
        if (!r.ok) return;
        const data = await r.json();
        const all: Game[] = data?.scoreboard?.games ?? [];
        const live = all.filter((g) => g.gameStatus === 2);
        if (cancelled) return;

        // Detect score changes for pulse
        const next: Record<string, number> = {};
        live.forEach((g) => {
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
        setGames(live);
      } catch {
        // ignore
      }
    }

    fetchLive();
    interval = setInterval(fetchLive, 30_000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);

  if (dismissed || games.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-[#0A0A0E] via-[#101018] to-[#0A0A0E] border-b border-[#34D399]/20 backdrop-blur-md">
      <div className="relative overflow-hidden">
        <div className="flex items-center gap-4 px-4 lg:px-6 h-9">
          {/* Live dot + label */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75 animate-pulse" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#34D399]">
              Live
            </span>
          </div>

          {/* Scrolling games */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-6 text-xs whitespace-nowrap animate-ticker-slide">
              {games.concat(games).map((g, i) => {
                const homeKey = g.gameId + ":home";
                const awayKey = g.gameId + ":away";
                const homePulsed = pulseKeys[homeKey] && Date.now() - pulseKeys[homeKey] < 1800;
                const awayPulsed = pulseKeys[awayKey] && Date.now() - pulseKeys[awayKey] < 1800;
                return (
                  <Link
                    key={`${g.gameId}-${i}`}
                    href={`/scores/${g.gameId}`}
                    className="flex items-center gap-2.5 hover:text-[#D4B560] transition-colors group"
                  >
                    <span className="text-[#8A8A93] font-medium">{g.awayTeam.teamTricode}</span>
                    <span
                      className={`font-[family-name:var(--font-barlow)] font-bold tabular-nums text-[#F5F5F7] ${awayPulsed ? "score-pulse" : ""}`}
                    >
                      {g.awayTeam.score}
                    </span>
                    <span className="text-[#3A3A42]">·</span>
                    <span
                      className={`font-[family-name:var(--font-barlow)] font-bold tabular-nums text-[#F5F5F7] ${homePulsed ? "score-pulse" : ""}`}
                    >
                      {g.homeTeam.score}
                    </span>
                    <span className="text-[#8A8A93] font-medium">{g.homeTeam.teamTricode}</span>
                    <span className="text-[10px] text-[#6E6E76]">{g.gameStatusText}</span>
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
