"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { PlayerCard } from "@/components/players/PlayerCard";
import { ArrowLeft, ArrowUpRight, Star } from "lucide-react";
import { useFavoriteTeam } from "@/lib/useFavoriteTeam";

function PlayerGallery({ players, color }: { players: Array<{ id: number; fullName: string; slug: string; pts: number; reb: number; ast: number }>; color: string }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (players.length <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % players.length), 4200);
    return () => clearInterval(t);
  }, [players.length]);
  if (players.length === 0) return null;
  return (
    <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 60% at 75% 50%, ${color}66 0%, transparent 65%)` }}
      />
      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-2">Spotlight</p>
          {players.map((p, i) => (
            <Link
              key={p.id}
              href={`/players/${p.slug}`}
              className={`block transition-all duration-700 ${i === active ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden"}`}
              aria-hidden={i !== active}
            >
              <h3 className="font-[family-name:var(--font-barlow)] font-black text-3xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7] hover:text-[#D4B560] transition-colors">
                {p.fullName}
              </h3>
              <p className="mt-2 text-sm text-[#8A8A93] tabular-nums">
                {p.pts.toFixed(1)} pts · {p.reb.toFixed(1)} reb · {p.ast.toFixed(1)} ast
              </p>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 md:flex-col">
          {players.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full transition-all ${i === active ? "ring-2 scale-110" : "opacity-50 hover:opacity-100"}`}
              style={{ ["--tw-ring-color" as string]: color }}
              aria-label={`Show ${p.fullName}`}
            >
              <PlayerAvatar playerId={p.id} fullName={p.fullName} size="md" />
            </button>
          ))}
        </div>
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
    <div className="pb-24 lg:pb-12">

      {/* HERO with subtle team color wash */}
      <section
        className="relative px-6 lg:px-12 pt-16 lg:pt-20 pb-12 overflow-hidden"
        data-reveal
      >
        {/* Team color radial glow background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${color}40 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at 20% 80%, ${color}30 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${color}, transparent 60%)` }}
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

          {/* Big team display */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-10">
            <TeamLogo teamId={team.id} abbreviation={team.abbreviation} primaryColor={color} size="xl" className="h-32 w-32 shrink-0" />
            <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.25rem,8vw,7rem)] leading-[0.9] tracking-[-0.045em] text-[#F5F5F7]">
              {team.city}<br />
              <span style={{ color }}>{team.name}</span>
            </h1>
          </div>

          {/* Record block */}
          <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-2">Record</p>
              <p className="font-[family-name:var(--font-barlow)] font-black text-6xl tabular-nums tracking-[-0.04em] text-[#F5F5F7]">
                {team.wins}<span className="text-[#3A3A42]">–{team.losses}</span>
              </p>
              <p className="text-xs text-[#8A8A93] mt-1">{winPct}% win rate</p>
            </div>
            {team.streak && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-2">Streak</p>
                <p className={cn(
                  "font-[family-name:var(--font-barlow)] font-black text-6xl tabular-nums tracking-[-0.04em]",
                  streakUp ? "text-[#34D399]" : "text-[#F87171]"
                )}>
                  {team.streak}
                </p>
                <p className="text-xs text-[#8A8A93] mt-1">{team.l10 ? `${team.l10} last 10` : "current"}</p>
              </div>
            )}
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
              <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
                The franchise.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topScorer && (
                <Link href={`/players/${topScorer.slug}`} className="floating-card no-jiggle group block rounded-3xl p-5 transition-transform hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>Top Scorer</p>
                    <PlayerAvatar playerId={topScorer.id} fullName={topScorer.fullName} size="md" className="ring-2 ring-[#D4B560]/30" />
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

            {/* Rotating gallery */}
            <div className="mt-8">
              <PlayerGallery
                players={roster.slice(0, Math.min(4, roster.length))}
                color={color}
              />
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
              <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
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
