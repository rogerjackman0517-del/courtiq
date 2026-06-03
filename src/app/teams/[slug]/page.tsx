"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { PlayerCard } from "@/components/players/PlayerCard";
import { ArrowLeft, ArrowUpRight, Star, Calendar } from "lucide-react";
import { useFavoriteTeam } from "@/lib/useFavoriteTeam";

type UpcomingGame = {
  gameId: string;
  gameDate: string; // YYYY-MM-DD
  gameStatus: number; // 1 upcoming, 2 live, 3 final
  gameStatusText: string;
  awayTeam: { teamTricode: string; teamCity?: string; teamName?: string; teamId?: number; score?: number };
  homeTeam: { teamTricode: string; teamCity?: string; teamName?: string; teamId?: number; score?: number };
};

function ScheduleStrip({ teamAbbr, color }: { teamAbbr: string; color: string }) {
  const [games, setGames] = useState<UpcomingGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Fetch next 8 days of scoreboards in parallel; filter to this team's games.
    const dates: string[] = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    Promise.all(
      dates.map((date) =>
        fetch(`/api/games/today?date=${date}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => ({ date, games: (data?.scoreboard?.games ?? []) as UpcomingGame[] }))
          .catch(() => ({ date, games: [] as UpcomingGame[] }))
      )
    ).then((results) => {
      if (cancelled) return;
      const out: UpcomingGame[] = [];
      for (const { date, games: dayGames } of results) {
        for (const g of dayGames) {
          if (g.awayTeam?.teamTricode === teamAbbr || g.homeTeam?.teamTricode === teamAbbr) {
            out.push({ ...g, gameDate: date });
          }
        }
      }
      setGames(out.slice(0, 6));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [teamAbbr]);

  if (!loading && games.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase inline-flex items-center gap-1.5" style={{ color }}>
          <Calendar size={11} />
          Upcoming
        </p>
        <Link href="/scores" className="text-xs text-[#6E6E76] hover:text-[#F5F5F7] transition-colors">
          All scores →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`sched-skel-${i}`} className="h-36 w-[180px] rounded-2xl shrink-0" />
          ))}
        {!loading &&
          games.map((g) => {
            const isHome = g.homeTeam.teamTricode === teamAbbr;
            const opp = isHome ? g.awayTeam : g.homeTeam;
            const d = new Date(g.gameDate + "T12:00:00");
            const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
            const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
            const isLive = g.gameStatus === 2;
            const isFinal = g.gameStatus === 3;
            return (
              <Link
                key={g.gameId}
                href={`/scores/${g.gameId}`}
                className="floating-card no-jiggle relative shrink-0 w-[180px] snap-start rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-4 flex flex-col gap-3 overflow-hidden group transition-transform hover:scale-[1.02]"
              >
                {/* Status accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: isLive ? "#34D399" : isFinal ? color : `${color}66`,
                  }}
                />

                {/* Date row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#6E6E76]">{dayLabel}</p>
                    <p className="text-[11px] font-bold tracking-wide text-[#F5F5F7]">{dateLabel}</p>
                  </div>
                  {isLive && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.15em] uppercase text-[#34D399]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                      Live
                    </span>
                  )}
                  {isFinal && (
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#D4B560]">Final</span>
                  )}
                </div>

                {/* Matchup */}
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold tracking-[0.15em] uppercase shrink-0"
                    style={{ color: isHome ? color : "#6E6E76" }}
                  >
                    {isHome ? "vs" : "@"}
                  </span>
                  <TeamLogo teamId={opp.teamId} abbreviation={opp.teamTricode} size="md" />
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-barlow)] font-black text-lg tracking-tight text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors leading-none">
                      {opp.teamTricode}
                    </p>
                    {opp.teamCity && (
                      <p className="text-[10px] text-[#6E6E76] truncate mt-1">{opp.teamCity}</p>
                    )}
                  </div>
                </div>

                {/* Score or tip time */}
                <div className="mt-auto">
                  {(isLive || isFinal) && typeof g.awayTeam.score === "number" && typeof g.homeTeam.score === "number" ? (
                    <div className="flex items-baseline gap-2">
                      <span className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums text-[#F5F5F7]">
                        {isHome ? g.homeTeam.score : g.awayTeam.score}
                      </span>
                      <span className="text-[#3A3A42] text-xs">·</span>
                      <span className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums text-[#6E6E76]">
                        {isHome ? g.awayTeam.score : g.homeTeam.score}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold text-[#8A8A93] tracking-wide">
                      {g.gameStatusText}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

function PlayerGallery({ players, color }: {
  players: Array<{ id: number; fullName: string; slug: string; teamAbbr: string; pts: number; reb: number; ast: number; blk: number; stl: number; gp: number; min: number }>;
  color: string;
}) {
  const [active, setActive] = useState(0);
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (players.length <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % players.length), 4200);
    return () => clearInterval(t);
  }, [players.length]);

  if (players.length === 0) return null;
  const p = players[active];

  const STATS = [
    { label: "PTS", value: p.pts.toFixed(1), accent: true },
    { label: "REB", value: p.reb.toFixed(1) },
    { label: "AST", value: p.ast.toFixed(1) },
    { label: "STL", value: p.stl.toFixed(1) },
    { label: "BLK", value: p.blk.toFixed(1) },
    { label: "MIN", value: p.min.toFixed(1) },
  ];

  const showPhoto = !failedIds.has(p.id);

  return (
    <div className="floating-card no-jiggle rounded-3xl overflow-hidden relative">
      {/* Team-colour left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: color }} />

      <div className="relative flex items-stretch">

        {/* ── Content ── */}
        <div className="flex-1 pl-8 pr-6 py-8 lg:py-10 flex flex-col gap-6 min-w-0">

          {/* Name */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-3">
              Spotlight
            </p>
            <Link href={`/players/${p.slug}`} className="group block">
              <h3 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors leading-[1.05] mb-2">
                {p.fullName}
              </h3>
            </Link>
            <p className="text-xs text-[#8A8A93] tracking-wide tabular-nums">
              {p.teamAbbr} &middot; {p.min.toFixed(1)} MPG &middot; {p.gp} GP
            </p>
          </div>

          {/* 6 stat chips */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/[0.04] border border-white/[0.04] p-3 text-center"
                style={s.accent ? { borderColor: `${color}50`, background: `${color}12` } : {}}
              >
                <p
                  className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums leading-none"
                  style={{ color: s.accent ? color : "#F5F5F7" }}
                >
                  {s.value}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6E6E76] mt-1.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Selectors + profile link */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {players.map((pl, i) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-full transition-all duration-300 no-jiggle",
                  i === active ? "ring-2 scale-110" : "opacity-40 hover:opacity-80"
                )}
                style={i === active ? { ["--tw-ring-color" as string]: color } : {}}
                aria-label={`Show ${pl.fullName}`}
              >
                <PlayerAvatar playerId={pl.id} fullName={pl.fullName} size="sm" />
              </button>
            ))}
            <Link
              href={`/players/${p.slug}`}
              className="ml-auto no-jiggle text-xs font-semibold text-[#D4B560] hover:text-[#F5F5F7] inline-flex items-center gap-1 transition-colors"
            >
              View profile <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>

        {/* ── Photo panel ── */}
        {showPhoto && (
          <div className="hidden md:block relative w-44 lg:w-60 shrink-0 self-stretch overflow-hidden">
            {/* Team colour glow at base of photo */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{ background: `radial-gradient(ellipse 100% 50% at 50% 100%, ${color}55 0%, transparent 55%)` }}
            />
            {/* Left-side fade into card bg */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{ background: "linear-gradient(to right, #131318 0%, transparent 38%)" }}
            />
            <img
              key={p.id}
              src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${p.id}.png`}
              alt={p.fullName}
              className="w-full h-full object-cover object-top"
              onError={() => setFailedIds((prev) => new Set([...prev, p.id]))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

type TeamRow = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  slug: string;
  fullName: string;
  conference: string;
  confRank?: number;
  wins: number;
  losses: number;
  winPct?: number;
  pct?: number;
  streak: string;
  l10?: string;
  primaryColor?: string;
  color?: string;
};

type PlayerRow = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  pts: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
  gp: number;
  min: number;
};

export default function TeamProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const { team: favoriteAbbr, setTeam: setFavorite } = useFavoriteTeam();

  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/teams/with-records").then(r => r.ok ? r.json() : []),
      fetch("/api/players/with-stats").then(r => r.ok ? r.json() : []),
    ])
      .then(([t, p]) => {
        if (cancelled) return;
        setTeams(Array.isArray(t) ? t : []);
        setPlayers(Array.isArray(p) ? p : []);
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const team = useMemo(() => {
    const s = slug.toLowerCase();
    return teams.find(t =>
      t.slug?.toLowerCase() === s ||
      t.abbreviation?.toLowerCase() === s
    );
  }, [teams, slug]);

  const roster = useMemo(() => {
    if (!team) return [];
    return players
      .filter(p => p.teamAbbr === team.abbreviation)
      .sort((a, b) => b.pts - a.pts);
  }, [team, players]);

  if (loading) {
    return (
      <div className="pb-24 lg:pb-12">
        <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-3 w-24 mb-8" />
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-10">
              <Skeleton className="h-32 w-32 rounded-2xl" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-[clamp(3rem,8vw,7rem)] w-2/3" />
                <Skeleton className="h-[clamp(3rem,8vw,7rem)] w-1/2" />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-14 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-14 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </section>
        <div className="px-4 lg:px-12">
          <div className="max-w-6xl mx-auto h-px divider-shimmer" />
        </div>
        <section className="px-6 lg:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-12 w-56 mb-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={"tl-stat-" + i} className="rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 lg:px-12 py-20 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 text-sm text-[#F87171]">
          Failed to load: {error}
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="px-6 lg:px-12 py-32 text-center max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl text-[#F5F5F7] mb-4 tracking-[-0.03em]">
          Team not found.
        </h1>
        <p className="text-base text-[#8A8A93] mb-8">&ldquo;{slug}&rdquo; doesn&apos;t match any team.</p>
        <Link href="/teams" className="inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold px-6 py-3 rounded-full hover:bg-white transition-all">
          <ArrowLeft size={14} /> Back to Teams
        </Link>
      </div>
    );
  }

  const color = team.primaryColor ?? team.color ?? "#D4B560";
  const total = team.wins + team.losses;
  const winPct = total > 0 ? ((team.wins / total) * 100).toFixed(1) : "0.0";
  const streakUp = team.streak?.startsWith("W");
  const tier = (team.confRank ?? 99) <= 6 ? "Playoffs" : (team.confRank ?? 99) <= 10 ? "Play-in" : "Lottery";
  const topScorer = roster[0];
  const topRebounder = [...roster].sort((a, b) => b.reb - a.reb)[0];
  const topPlaymaker = [...roster].sort((a, b) => b.ast - a.ast)[0];
  const topBlocker = [...roster].sort((a, b) => b.blk - a.blk)[0];

  return (
    <div
      className="pb-24 lg:pb-12"
      style={{ ["--team-glow" as string]: `${color}66` }}
    >

      {/* HERO — magazine-cover layout with full team identity */}
      <section
        className="relative px-6 lg:px-12 pt-16 lg:pt-20 pb-12 overflow-hidden min-h-[600px] lg:min-h-[680px]"
        data-reveal
      >
        {/* Team color ambient wash — anchored to the right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 78% 50%, ${color}55 0%, ${color}18 40%, transparent 70%)`,
          }}
        />
        {/* Diagonal team color sweep */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.10]"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, transparent 55%)`,
          }}
        />
        {/* Bottom dark vignette */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(10,10,14,0.55) 100%)" }}
        />

        <div className="relative max-w-6xl mx-auto">

          {/* Back link + favorite */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/teams" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E76] hover:text-[#F5F5F7] tracking-wide transition-colors">
              <ArrowLeft size={12} /> All Teams
            </Link>
            <button
              type="button"
              onClick={() => setFavorite(favoriteAbbr === team.abbreviation ? "" : team.abbreviation)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
              style={
                favoriteAbbr === team.abbreviation
                  ? { color, borderColor: `${color}60`, background: `${color}15` }
                  : { color: "#6E6E76", borderColor: "rgba(255,255,255,0.08)", background: "transparent" }
              }
              title={favoriteAbbr === team.abbreviation ? "Remove from My Team" : "Set as My Team"}
            >
              <Star
                size={12}
                fill={favoriteAbbr === team.abbreviation ? "currentColor" : "none"}
              />
              {favoriteAbbr === team.abbreviation ? "My Team" : "Follow"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-end">
            {/* LEFT: eyebrow + name + record */}
            <div>
              {/* Eyebrow */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {team.conference}ern Conference {team.confRank ? `· #${team.confRank}` : ""}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">
                  · {tier}
                </span>
              </div>

              {/* Big team name — magazine title style */}
              <h1 className="font-[family-name:var(--font-barlow)] font-black leading-[0.85] tracking-[-0.045em] mb-8">
                <span className="mask-reveal block text-[clamp(2.25rem,9vw,6rem)] text-[#F5F5F7]">{team.city}</span>
                <span
                  className="mask-reveal block text-[clamp(2.25rem,9vw,6rem)]"
                  style={{ color, animationDelay: "150ms" }}
                >
                  {team.name}
                </span>
              </h1>

              {/* Record + streak stat columns */}
              <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-2">Record</p>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-6xl tabular-nums tracking-[-0.04em] text-[#F5F5F7]">
                    {team.wins}<span className="text-[#3A3A42]">–{team.losses}</span>
                  </p>
                  <p className="text-xs text-[#8A8A93] mt-1">{winPct}% win rate</p>
                </div>
                {team.streak && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-2">Streak</p>
                    <p className={cn(
                      "font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-6xl tabular-nums tracking-[-0.04em]",
                      streakUp ? "text-[#34D399]" : "text-[#F87171]"
                    )}>
                      {team.streak}
                    </p>
                    <p className="text-xs text-[#8A8A93] mt-1">{team.l10 ? `${team.l10} last 10` : "current"}</p>
                  </div>
                )}
                {team.confRank && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-2">Seed</p>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-6xl tabular-nums tracking-[-0.04em]" style={{ color }}>
                      #{team.confRank}
                    </p>
                    <p className="text-xs text-[#8A8A93] mt-1">in {team.conference[0]}.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: oversized team logo with halo + abbreviation watermark */}
            <div className="relative flex justify-center lg:justify-end self-end">
              <div className="relative w-[280px] h-[360px] sm:w-[340px] sm:h-[420px] lg:w-[400px] lg:h-[480px] flex items-center justify-center">
                {/* Atmospheric team color halo */}
                <div
                  className="pointer-events-none absolute inset-[-15%] blur-3xl"
                  style={{
                    background: `radial-gradient(ellipse 60% 70% at 50% 45%, ${color}77 0%, ${color}22 40%, transparent 75%)`,
                  }}
                />
                {/* Cone of light from above */}
                <div
                  className="pointer-events-none absolute inset-x-0 -top-10 h-3/4"
                  style={{
                    background: `linear-gradient(180deg, ${color}45 0%, transparent 70%)`,
                  }}
                />
                {/* Abbreviation watermark behind logo */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-[family-name:var(--font-barlow)] font-black leading-none tracking-[-0.07em] select-none mix-blend-screen"
                  style={{
                    color,
                    fontSize: "clamp(8rem, 18vw, 18rem)",
                    opacity: 0.10,
                  }}
                >
                  {team.abbreviation}
                </span>
                {/* The logo itself */}
                <TeamLogo
                  teamId={team.id}
                  abbreviation={team.abbreviation}
                  primaryColor={color}
                  size="xl"
                  className="relative !h-56 !w-56 lg:!h-72 lg:!w-72 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px divider-shimmer" />
      </div>

      {/* TEAM LEADERS */}
      {roster.length > 0 && (
        <section className="px-4 lg:px-12 py-10 lg:py-20" data-reveal data-reveal-delay="1">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">Team Leaders</p>
              <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7] text-shine">
                The franchise.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topScorer && (
                <Link href={`/players/${topScorer.slug}`} className="floating-card no-jiggle group block rounded-3xl p-5 transition-transform hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>Top Scorer</p>
                    <div className="rounded-full p-[2px]" style={{ background: `${color}55` }}>
                      <PlayerAvatar playerId={topScorer.id} fullName={topScorer.fullName} size="md" />
                    </div>
                  </div>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-5xl tabular-nums tracking-[-0.04em] stat-gold mb-1">
                    {topScorer.pts.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-[#8A8A93] mb-3 tracking-wide">PPG · {topScorer.gp} GP</p>
                  <p className="text-sm font-semibold text-[#F5F5F7] truncate group-hover:text-[#D4B560] transition-colors">{topScorer.fullName}</p>
                </Link>
              )}
              {topRebounder && (
                <Link href={`/players/${topRebounder.slug}`} className="floating-card no-jiggle group block rounded-3xl p-5 transition-transform hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">Top Rebounder</p>
                    <PlayerAvatar playerId={topRebounder.id} fullName={topRebounder.fullName} size="md" className="ring-2 ring-white/[0.06]" />
                  </div>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-5xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-1">
                    {topRebounder.reb.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-[#8A8A93] mb-3 tracking-wide">RPG · {topRebounder.gp} GP</p>
                  <p className="text-sm font-semibold text-[#F5F5F7] truncate group-hover:text-[#D4B560] transition-colors">{topRebounder.fullName}</p>
                </Link>
              )}
              {topPlaymaker && (
                <Link href={`/players/${topPlaymaker.slug}`} className="floating-card no-jiggle group block rounded-3xl p-5 transition-transform hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">Top Playmaker</p>
                    <PlayerAvatar playerId={topPlaymaker.id} fullName={topPlaymaker.fullName} size="md" className="ring-2 ring-white/[0.06]" />
                  </div>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-5xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-1">
                    {topPlaymaker.ast.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-[#8A8A93] mb-3 tracking-wide">APG · {topPlaymaker.gp} GP</p>
                  <p className="text-sm font-semibold text-[#F5F5F7] truncate group-hover:text-[#D4B560] transition-colors">{topPlaymaker.fullName}</p>
                </Link>
              )}
              {topBlocker && topBlocker.blk > 0 && (
                <Link href={`/players/${topBlocker.slug}`} className="floating-card no-jiggle group block rounded-3xl p-5 transition-transform hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">Rim Protector</p>
                    <PlayerAvatar playerId={topBlocker.id} fullName={topBlocker.fullName} size="md" className="ring-2 ring-white/[0.06]" />
                  </div>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-5xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-1">
                    {topBlocker.blk.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-[#8A8A93] mb-3 tracking-wide">BPG · {topBlocker.gp} GP</p>
                  <p className="text-sm font-semibold text-[#F5F5F7] truncate group-hover:text-[#D4B560] transition-colors">{topBlocker.fullName}</p>
                </Link>
              )}
            </div>

            {/* Spotlight gallery */}
            <div className="mt-8">
              <PlayerGallery
                players={roster.slice(0, Math.min(5, roster.length)).map(p => ({
                  id: p.id,
                  fullName: p.fullName,
                  slug: p.slug,
                  teamAbbr: team.abbreviation,
                  pts: p.pts,
                  reb: p.reb,
                  ast: p.ast,
                  blk: p.blk,
                  stl: p.stl,
                  gp: p.gp,
                  min: p.min,
                }))}
                color={color}
              />
            </div>

            {/* Schedule strip */}
            <div className="mt-10">
              <ScheduleStrip teamAbbr={team.abbreviation} color={color} />
            </div>
          </div>
        </section>
      )}

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px divider-shimmer" />
      </div>

      {/* ROSTER */}
      <section className="px-4 lg:px-12 py-10 lg:py-20" data-reveal data-reveal-delay="2">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">Roster</p>
              <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7] text-shine">
                Every player.
              </h2>
            </div>
            <Link href="/players" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">
              All Players <ArrowUpRight size={14} />
            </Link>
          </div>

          {roster.length === 0 ? (
            <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-8 text-sm text-[#8A8A93] text-center">
              No roster data available for {team.abbreviation}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roster.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={{
                    id: p.id,
                    fullName: p.fullName,
                    slug: p.slug,
                    teamAbbr: team.abbreviation,
                    teamId: team.id,
                    pts: p.pts,
                    reb: p.reb,
                    ast: p.ast,
                    gp: p.gp,
                  }}
                  variant="wide"
                />
              ))}
            </div>
          )}

          <p className="text-xs text-[#6E6E76] mt-4 tracking-wide leading-relaxed">
            Roster shows players from our top-150 scorers list. Some bench players may not appear.
          </p>
        </div>
      </section>

    </div>
  );
}
