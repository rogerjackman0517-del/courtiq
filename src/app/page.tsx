"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { ArrowUpRight, Flame, Radio, Sparkles, TrendingUp, Trophy, Zap } from "lucide-react";
import { StatCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type PlayerRow = {
  id: number; fullName: string; slug: string; teamAbbr: string; teamId?: number;
  pts: number; reb: number; ast: number; stl: number; blk: number;
  fgPct: number; fg3Pct: number; ftPct: number; min: number; gp: number;
};
type TeamRow = {
  abbreviation: string; city: string; name: string; slug: string; fullName: string;
  conference: string; confRank: number; wins: number; losses: number;
  streak: string; l10: string; primaryColor?: string;
};
type GameTeam = { teamTricode: string; teamCity: string; teamName: string; score: number; wins: number; losses: number; seed?: number; };
type LiveGame = { gameId: string; gameStatus: number; gameStatusText: string; gameLabel: string; seriesText: string; homeTeam: GameTeam; awayTeam: GameTeam; };
type NewsItem = { title: string; link: string; pubDate: string; description: string; image: string };

function formatNewsTime(pubDate: string): string {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return "";
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function HomePage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [games, setGames] = useState<LiveGame[]>([]);
  const [gamesLoaded, setGamesLoaded] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch("/api/players/with-stats").then(r => r.ok ? r.json() : []).then(d => Array.isArray(d) && setPlayers(d)).catch(() => {});
    fetch("/api/teams/with-records").then(r => r.ok ? r.json() : []).then(d => Array.isArray(d) && setTeams(d)).catch(() => {});
    fetch("/api/games/today").then(r => r.ok ? r.json() : null).then(d => {
      const g = d?.scoreboard?.games;
      if (Array.isArray(g)) setGames(g);
    }).catch(() => {}).finally(() => setGamesLoaded(true));
    fetch("/api/news").then(r => r.ok ? r.json() : []).then(d => Array.isArray(d) && setNews(d)).catch(() => {});
  }, []);

  const ptsLeader = useMemo(() => [...players].sort((a, b) => b.pts - a.pts)[0], [players]);
  const astLeader = useMemo(() => [...players].sort((a, b) => b.ast - a.ast)[0], [players]);
  const bestTeam = useMemo(() => [...teams].sort((a, b) => (b.wins / Math.max(1, b.wins + b.losses)) - (a.wins / Math.max(1, a.wins + a.losses)))[0], [teams]);
  const hottest = useMemo(() => [...teams]
    .filter(t => t.streak?.startsWith("W"))
    .sort((a, b) => parseInt(b.streak.slice(1)) - parseInt(a.streak.slice(1)) || (b.wins / Math.max(1, b.wins + b.losses)) - (a.wins / Math.max(1, a.wins + a.losses)))[0], [teams]);

  const liveGames = games.filter(g => g.gameStatus === 2);
  const liveGame = liveGames[0];

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* HERO — Apple-style massive display type */}
      <section className="relative px-4 lg:px-12 pt-10 lg:pt-24 pb-10 lg:pb-24" data-reveal>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
            <div>

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-8">
            {liveGame ? (
              <>
                <span className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-[#34D399]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75 animate-pulse" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
                  </span>
                  Live Now · {liveGame.gameStatusText}
                </span>
              </>
            ) : (
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560]">
                Stat of the Day
              </span>
            )}
          </div>

          {/* Main display */}
          {(!ptsLeader || !gamesLoaded) ? (
            <div className="mb-10 space-y-3">
              <Skeleton className="h-[clamp(3rem,8vw,7rem)] w-3/4" />
              <Skeleton className="h-[clamp(3rem,8vw,7rem)] w-1/2" />
              <Skeleton className="h-[clamp(3rem,8vw,7rem)] w-2/5" />
            </div>
          ) : liveGame ? (
            <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] tracking-[-0.04em] text-[#F5F5F7] mb-10">
              {liveGame.awayTeam.teamCity}<br />
              vs {liveGame.homeTeam.teamCity}<br />
              <span className="text-[#D4B560]">{liveGame.awayTeam.score}–{liveGame.homeTeam.score}</span>
            </h1>
          ) : (
            <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] tracking-[-0.04em] text-[#F5F5F7] mb-10">
              {ptsLeader.fullName.split(" ")[0]} is averaging<br />
              <span className="stat-gold ticker-number">{ptsLeader.pts.toFixed(1)} points</span><br />
              a game.
            </h1>
          )}

          {/* Subhead */}
          <p className="text-lg lg:text-xl text-[#8A8A93] max-w-2xl mb-12 leading-relaxed">
            {liveGame
              ? `${liveGame.seriesText || "Watch the action unfold in real time."}`
              : ptsLeader
                ? `Across ${ptsLeader.gp} games. ${(ptsLeader.fgPct * 100).toFixed(1)}% from the field, ${ptsLeader.reb.toFixed(1)} rebounds, ${ptsLeader.ast.toFixed(1)} assists.`
                : "Real-time stats, scores, and league insights."
            }
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={liveGame ? "/scores" : ptsLeader ? `/players/${ptsLeader.slug}` : "/players"}
              className="group inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-6 py-3 rounded-full hover:bg-white transition-all duration-300"
            >
              {liveGame ? "View Live Scores" : "View Profile"}
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/players"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[#8A8A93] hover:text-[#F5F5F7] transition-colors px-4 py-3"
            >
              All Stat Leaders →
            </Link>
            </div>
            </div>
            <div className="hidden lg:block">
              {ptsLeader ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4B560]/30 via-[#D4B560]/10 to-transparent blur-3xl scale-110" />
                  <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[#D4B560] via-[#D4B560]/40 to-transparent opacity-60 blur-md" />
                  <PlayerAvatar
                    playerId={ptsLeader.id}
                    fullName={ptsLeader.fullName}
                    size="xl"
                    className="relative !h-80 !w-80 ring-2 ring-[#D4B560]/40 shadow-2xl"
                  />
                </div>
              ) : (
                <Skeleton className="h-80 w-80 rounded-full" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-6 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* TODAY'S GAMES */}
      {games.length > 0 && (
        <section className="px-4 lg:px-12 py-10 lg:py-20" data-reveal data-reveal-delay="1">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">
                  Today
                </p>
                <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
                  Games on now.
                </h2>
              </div>
              <Link href="/scores" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">
                Full schedule <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.slice(0, 3).map(game => {
                const live = game.gameStatus === 2;
                const final = game.gameStatus === 3;
                const awayWin = game.awayTeam.score > game.homeTeam.score;
                return (
                  <Link
                    key={game.gameId}
                    href="/scores"
                    className="group floating-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40"
                  >
                    <div className="flex items-center justify-between mb-6">
                      {live ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#34D399]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                          {game.gameStatusText}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#8A8A93]">
                          {final ? "Final" : game.gameStatusText}
                        </span>
                      )}
                      {game.seriesText && <span className="text-[10px] text-[#6E6E76]">{game.seriesText}</span>}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-base font-medium tracking-tight", awayWin ? "text-[#F5F5F7]" : "text-[#8A8A93]")}>
                          {game.awayTeam.teamTricode}
                        </span>
                        <span className={cn(
                          "font-[family-name:var(--font-barlow)] font-black text-4xl tabular-nums tracking-tight",
                          live || final ? (awayWin ? "text-[#F5F5F7]" : "text-[#6E6E76]") : "text-[#3A3A42]"
                        )}>
                          {live || final ? game.awayTeam.score : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn("text-base font-medium tracking-tight", !awayWin && (live || final) ? "text-[#F5F5F7]" : "text-[#8A8A93]")}>
                          {game.homeTeam.teamTricode}
                        </span>
                        <span className={cn(
                          "font-[family-name:var(--font-barlow)] font-black text-4xl tabular-nums tracking-tight",
                          live || final ? (!awayWin ? "text-[#F5F5F7]" : "text-[#6E6E76]") : "text-[#3A3A42]"
                        )}>
                          {live || final ? game.homeTeam.score : "—"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* DIVIDER */}
      <div className="px-6 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* LEAGUE PULSE — bigger numbers, more space */}
      <section className="px-4 lg:px-12 py-10 lg:py-20" data-reveal data-reveal-delay="2">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">
                League Pulse
              </p>
              <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
                The numbers that matter.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {players.length === 0 && Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={"pulse-skel-" + i} />)}
            {ptsLeader && (
              <Link href={`/players/${ptsLeader.slug}`} className="floating-card group block rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#D4B560]/10">
                <div className="flex items-center gap-1.5 mb-6">
                  <Flame size={11} className="text-[#D4B560]" />
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#D4B560]">Scoring</p>
                </div>
                <p className="font-[family-name:var(--font-barlow)] font-black text-6xl lg:text-7xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-2">
                  {ptsLeader.pts.toFixed(1)}
                </p>
                <p className="text-[11px] text-[#8A8A93] mb-6 tracking-wide">PPG · {ptsLeader.gp} GP</p>
                <div>
                  <div className="flex items-center gap-2.5"><PlayerAvatar playerId={ptsLeader.id} fullName={ptsLeader.fullName} size="sm" /><div className="min-w-0"><p className="text-sm font-semibold text-[#F5F5F7] tracking-tight truncate">{ptsLeader.fullName}</p><p className="text-xs text-[#8A8A93]">{ptsLeader.teamAbbr}</p></div></div>
                </div>
              </Link>
            )}
            {astLeader && (
              <Link href={`/players/${astLeader.slug}`} className="floating-card group block rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40">
                <div className="flex items-center gap-1.5 mb-6">
                  <TrendingUp size={11} className="text-[#8A8A93]" />
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#8A8A93]">Assists</p>
                </div>
                <p className="font-[family-name:var(--font-barlow)] font-black text-6xl lg:text-7xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-2">
                  {astLeader.ast.toFixed(1)}
                </p>
                <p className="text-[11px] text-[#8A8A93] mb-6 tracking-wide">APG · {astLeader.gp} GP</p>
                <div>
                  <div className="flex items-center gap-2.5"><PlayerAvatar playerId={astLeader.id} fullName={astLeader.fullName} size="sm" /><div className="min-w-0"><p className="text-sm font-semibold text-[#F5F5F7] tracking-tight truncate">{astLeader.fullName}</p><p className="text-xs text-[#8A8A93]">{astLeader.teamAbbr}</p></div></div>
                </div>
              </Link>
            )}
            {bestTeam && (
              <Link href={`/teams/${bestTeam.slug}`} className="floating-card group block rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40">
                <div className="flex items-center gap-1.5 mb-6">
                  <Trophy size={11} className="text-[#8A8A93]" />
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#8A8A93]">Top Record</p>
                </div>
                <p className="font-[family-name:var(--font-barlow)] font-black text-6xl lg:text-7xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-2">
                  {bestTeam.wins}<span className="text-[#6E6E76]">–{bestTeam.losses}</span>
                </p>
                <p className="text-[11px] text-[#8A8A93] mb-6 tracking-wide">
                  {((bestTeam.wins / (bestTeam.wins + bestTeam.losses)) * 100).toFixed(1)}% · {bestTeam.conference}
                </p>
                <div>
                  <p className="text-sm font-semibold text-[#F5F5F7] tracking-tight truncate">{bestTeam.city} {bestTeam.name}</p>
                  <p className="text-xs text-[#8A8A93]">{bestTeam.abbreviation}</p>
                </div>
              </Link>
            )}
            {hottest && (
              <Link href={`/teams/${hottest.slug}`} className="floating-card group block rounded-3xl bg-gradient-to-br from-[#34D399]/15 via-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#34D399]/10">
                <div className="flex items-center gap-1.5 mb-6">
                  <Zap size={11} className="text-[#34D399]" />
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#34D399]">Hottest</p>
                </div>
                <p className="font-[family-name:var(--font-barlow)] font-black text-6xl lg:text-7xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-2">
                  {hottest.streak}
                </p>
                <p className="text-[11px] text-[#8A8A93] mb-6 tracking-wide">{hottest.l10} last 10</p>
                <div>
                  <p className="text-sm font-semibold text-[#F5F5F7] tracking-tight truncate">{hottest.city} {hottest.name}</p>
                  <p className="text-xs text-[#8A8A93]">{hottest.abbreviation}</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-6 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* TOP SCORERS + NEWS */}
      <section className="px-4 lg:px-12 py-10 lg:py-20" data-reveal data-reveal-delay="3">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Top scorers */}
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">
                  Leaderboard
                </p>
                <h2 className="font-[family-name:var(--font-barlow)] font-black text-3xl lg:text-4xl tracking-[-0.03em] text-[#F5F5F7]">
                  Top scorers.
                </h2>
              </div>
              <Link href="/players" className="text-sm font-semibold text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">
                See all →
              </Link>
            </div>

            <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
              {players.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                <div key={"top-skel-" + i} className={cn("flex items-center gap-4 px-6 py-4", i !== 5 && "border-b border-white/[0.04]")}>
                  <Skeleton className="h-7 w-6" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-7 w-10" />
                </div>
              ))}
              {players.slice(0, 6).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/players/${p.slug}`}
                  className={cn(
                    "group flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-white/[0.03]",
                    i !== 5 && "border-b border-white/[0.04]"
                  )}
                >
                  <span className={cn(
                    "font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums w-8",
                    i === 0 ? "text-[#D4B560]" : "text-[#6E6E76]"
                  )}>
                    {i + 1}
                  </span>
                  <PlayerAvatar playerId={p.id} fullName={p.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-[#F5F5F7] tracking-tight truncate group-hover:text-[#D4B560] transition-colors">{p.fullName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TeamLogo teamId={p.teamId} abbreviation={p.teamAbbr} size="xs" />
                      <span className="text-xs text-[#8A8A93]">{p.teamAbbr}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums text-[#F5F5F7] tracking-tight">{p.pts.toFixed(1)}</p>
                    <p className="text-[10px] text-[#8A8A93] tracking-wide">PPG</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* News */}
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">
                  News
                </p>
                <h2 className="font-[family-name:var(--font-barlow)] font-black text-3xl lg:text-4xl tracking-[-0.03em] text-[#F5F5F7]">
                  Latest.
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {news.slice(0, 4).map((n, i) => (
                <a
                  key={i}
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="floating-card group block rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-4 transition-all duration-300 hover:scale-[1.02]"
                >
                  <p className="text-sm font-semibold text-[#F5F5F7] group-hover:text-[#D4B560] leading-snug line-clamp-2 transition-colors tracking-tight">
                    {n.title}
                  </p>
                  <p className="text-[10px] text-[#8A8A93] mt-2 tracking-wide">{formatNewsTime(n.pubDate)}</p>
                </a>
              ))}
            </div>
            <Link href="/news" className="block text-sm font-semibold text-[#8A8A93] hover:text-[#F5F5F7] transition-colors mt-6 text-center">
              All news →
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter — minimal Apple style */}
      <section className="px-6 lg:px-12 py-20 lg:py-32" data-reveal data-reveal-delay="4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 mb-6">
            <Sparkles size={11} className="text-[#D4B560]" />
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560]">Newsletter</p>
          </div>
          <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-6xl tracking-[-0.04em] text-[#F5F5F7] mb-6 leading-[1.05]">
            NBA intel,<br />every morning.
          </h2>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-md mx-auto mb-10 leading-relaxed">
            Injury alerts, top performances, prop bet edges. Delivered at 9 AM ET.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            onSubmit={e => {
              e.preventDefault();
              const input = e.currentTarget.querySelector("input") as HTMLInputElement;
              if (input?.value) {
                alert("Thanks! You'll be added when we launch the newsletter.");
                input.value = "";
              }
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              required
              className="flex-1 bg-[#1C1C24] border border-white/[0.06] rounded-full px-6 py-3 text-sm text-[#F5F5F7] placeholder:text-[#6E6E76] outline-none focus:border-[#D4B560]/30 transition-colors"
            />
            <button
              type="submit"
              className="bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold px-8 py-3 rounded-full hover:bg-white transition-all duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
