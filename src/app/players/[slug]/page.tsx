"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PlayerRadar } from "@/components/charts/PlayerRadar";

type PlayerRow = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  teamId?: number;
  position: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  min: number;
  gp: number;
};

function StatBlock({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn(
      "floating-card rounded-3xl p-6 bg-gradient-to-br",
      accent
        ? "from-[#D4B560]/15 via-[#1C1C24] to-[#131318]"
        : "from-[#1C1C24] to-[#131318]"
    )}>
      <p className={cn(
        "text-[10px] font-bold uppercase tracking-[0.2em] mb-4",
        accent ? "text-[#D4B560]" : "text-[#6E6E76]"
      )}>{label}</p>
      <p className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-6xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-2">
        {value}
      </p>
      <p className="text-[11px] text-[#8A8A93] tracking-wide">{sub}</p>
    </div>
  );
}

export default function PlayerProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [allPlayers, setAllPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/players/with-stats")
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) { setAllPlayers(data); setError(null); }
        else { setError("Unexpected response"); }
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const player = useMemo(() => allPlayers.find(p => p.slug === slug), [allPlayers, slug]);

  const radarData = useMemo(() => {
    if (!player) return [];
    return [
      { label: "Scoring",    value: Math.min(100, (player.pts / 35) * 100) },
      { label: "Rebounding", value: Math.min(100, (player.reb / 14) * 100) },
      { label: "Playmaking", value: Math.min(100, (player.ast / 12) * 100) },
      { label: "Defense",    value: Math.min(100, ((player.stl + player.blk) / 4) * 100) },
      { label: "FG%",        value: Math.min(100, player.fgPct * 180) },
      { label: "3P%",        value: Math.min(100, player.fg3Pct * 220) },
    ];
  }, [player]);

  // Find rank in scoring
  const scoringRank = useMemo(() => {
    if (!player) return null;
    const sorted = [...allPlayers].sort((a, b) => b.pts - a.pts);
    return sorted.findIndex(p => p.id === player.id) + 1;
  }, [player, allPlayers]);

  if (loading) {
    return (
      <div className="pb-24 lg:pb-12">
        <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-3 w-24 mb-8" />
            <Skeleton className="h-3 w-32 mb-6" />
            <div className="flex flex-col lg:flex-row lg:items-end gap-8 mb-8">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-[clamp(3rem,8vw,7rem)] w-3/4" />
              </div>
            </div>
            <Skeleton className="h-4 w-80" />
          </div>
        </section>
        <div className="px-4 lg:px-12">
          <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <section className="px-4 lg:px-12 py-10 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-12 w-64 mb-10" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={"pp-stat-" + i} className="rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-12 w-20" />
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

  if (!player) {
    return (
      <div className="px-6 lg:px-12 py-32 text-center max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl text-[#F5F5F7] mb-4 tracking-[-0.03em]">
          Player not found.
        </h1>
        <p className="text-base text-[#8A8A93] mb-8">
          &ldquo;{slug}&rdquo; doesn&apos;t match any player in our top 150 scorers.
        </p>
        <Link href="/players" className="inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold px-6 py-3 rounded-full hover:bg-white transition-all">
          <ArrowLeft size={14} /> Back to Players
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-12">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">

          {/* Back link */}
          <Link href="/players" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E76] hover:text-[#F5F5F7] mb-8 tracking-wide transition-colors">
            <ArrowLeft size={12} /> All Players
          </Link>

          {/* Eyebrow with team + rank */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link href={`/teams/${player.teamAbbr.toLowerCase()}`} className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <TeamLogo teamId={player.teamId} abbreviation={player.teamAbbr} size="xs" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4B560]">{player.teamAbbr}</span>
              <ArrowUpRight size={10} className="text-[#D4B560]" />
            </Link>
            {scoringRank !== null && scoringRank > 0 && scoringRank <= 50 && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76]">
                · #{scoringRank} in Scoring
              </span>
            )}
          </div>

          {/* Name display */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-8 mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4B560]/30 via-[#D4B560]/10 to-transparent blur-3xl scale-110" />
              <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[#D4B560] via-[#D4B560]/40 to-transparent opacity-50 blur-md" />
              <PlayerAvatar playerId={player.id} fullName={player.fullName} size="xl" className="relative ring-2 ring-[#D4B560]/40 shadow-2xl shadow-[#D4B560]/20" />
            </div>
            <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.25rem,8vw,7rem)] leading-[0.9] tracking-[-0.045em] text-[#F5F5F7]">
              {player.fullName}
            </h1>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#8A8A93]">
            <span>{player.gp} games played</span>
            <span className="text-[#3A3A42]">·</span>
            <span>{player.min.toFixed(1)} minutes per game</span>
            <span className="text-[#3A3A42]">·</span>
            <span>2025-26 Regular Season</span>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* PER GAME */}
      <section className="px-4 lg:px-12 py-10 lg:py-20" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">

          <div className="mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">Per Game</p>
            <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
              The numbers.
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatBlock label="Points"   value={player.pts.toFixed(1)} sub="PPG" accent />
            <StatBlock label="Rebounds" value={player.reb.toFixed(1)} sub="RPG" />
            <StatBlock label="Assists"  value={player.ast.toFixed(1)} sub="APG" />
            <StatBlock label="Steals"   value={player.stl.toFixed(1)} sub="SPG" />
            <StatBlock label="Blocks"   value={player.blk.toFixed(1)} sub="BPG" />
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* SHOOTING + RADAR */}
      <section className="px-4 lg:px-12 py-10 lg:py-20" data-reveal data-reveal-delay="2">
        <div className="max-w-6xl mx-auto">

          <div className="mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">Profile</p>
            <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
              Shooting & skill.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Shooting */}
            <div className="space-y-4">
              <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-4">Field Goal</p>
                <div className="flex items-baseline justify-between mb-4">
                  <p className="font-[family-name:var(--font-barlow)] font-black text-5xl tabular-nums tracking-[-0.04em] text-[#F5F5F7]">
                    {(player.fgPct * 100).toFixed(1)}<span className="text-2xl text-[#6E6E76]">%</span>
                  </p>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4B560] to-[#B8954A] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, player.fgPct * 180)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-4">3-Point</p>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-4xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-3">
                    {(player.fg3Pct * 100).toFixed(1)}<span className="text-xl text-[#6E6E76]">%</span>
                  </p>
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5B8DEF] rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, player.fg3Pct * 220)}%` }}
                    />
                  </div>
                </div>

                <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-4">Free Throw</p>
                  <p className="font-[family-name:var(--font-barlow)] font-black text-4xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-3">
                    {(player.ftPct * 100).toFixed(1)}<span className="text-xl text-[#6E6E76]">%</span>
                  </p>
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#34D399] rounded-full transition-all duration-700"
                      style={{ width: `${player.ftPct * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Radar */}
            <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-4">Skill Radar</p>
              <PlayerRadar data={radarData} />
            </div>

          </div>
        </div>
      </section>

      {/* Note */}
      <section className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto rounded-2xl bg-[#1C1C24]/50 px-6 py-4 text-xs text-[#6E6E76] tracking-wide leading-relaxed">
          Stats verified from NBA.com via nba_api. Game log, shot chart, and advanced metrics coming soon.
        </div>
      </section>

    </div>
  );
}
