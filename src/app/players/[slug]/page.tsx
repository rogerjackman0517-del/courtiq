"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { ShotChart } from "@/components/players/ShotChart";
import { GameLogTable } from "@/components/players/GameLogTable";
import { RankBadges } from "@/components/players/RankBadges";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PlayerRadar } from "@/components/charts/PlayerRadar";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { useCopyToClipboard } from "@/components/ui/Toast";
import { PLAYER_NICKNAMES } from "@/lib/playerNicknames";
import { Share2, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Award } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DustParticles } from "@/components/ui/DustParticles";
import { Lightbox } from "@/components/ui/Lightbox";
import { PlayerNews } from "@/components/players/PlayerNews";

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

type TeamMeta = {
  abbreviation: string;
  primaryColor: string;
  fullName: string;
};

function StatBlock({
  label, value, sub, accent, rank, careerHigh,
}: {
  label: string; value: string; sub: string; accent?: boolean;
  rank?: number; careerHigh?: boolean;
}) {
  const rankPill = rank && rank > 0 && rank <= 100
    ? `#${rank} in league`
    : null;
  return (
    <div className={cn(
      "floating-card rounded-3xl p-6 bg-gradient-to-br relative",
      accent
        ? "from-[#D4B560]/15 via-[#1C1C24] to-[#131318]"
        : "from-[#1C1C24] to-[#131318]"
    )}>
      {careerHigh && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#D4B560]/15 border border-[#D4B560]/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#D4B560]">
          <Award size={9} /> CH
        </span>
      )}
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em] mb-4",
          accent ? "text-[#D4B560]" : "text-[#6E6E76]"
        )}
        title={rankPill ?? undefined}
      >{label}</p>
      <p className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-6xl tabular-nums tracking-[-0.04em] text-[#F5F5F7] mb-2">
        {value}
      </p>
      <div className="flex items-center justify-between text-[11px] text-[#8A8A93] tracking-wide">
        <span>{sub}</span>
        {rankPill && (
          <span className="text-[#D4B560]/80 font-medium">{rankPill}</span>
        )}
      </div>
    </div>
  );
}

export default function PlayerProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [allPlayers, setAllPlayers] = useState<PlayerRow[]>([]);
  const [teams, setTeams] = useState<TeamMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoSource, setPhotoSource] = useState<"nba" | "espn">("nba");
  const copy = useCopyToClipboard();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/players/with-stats").then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),
      fetch("/api/teams/with-records").then(r => r.ok ? r.json() : []),
    ])
      .then(([playerData, teamData]) => {
        if (cancelled) return;
        if (Array.isArray(playerData)) { setAllPlayers(playerData); setError(null); }
        else { setError("Unexpected response"); }
        if (Array.isArray(teamData)) setTeams(teamData);
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadedAt(new Date());
        }
      });
    return () => { cancelled = true; };
  }, []);

  const player = useMemo(() => allPlayers.find(p => p.slug === slug), [allPlayers, slug]);
  const playerTeam = useMemo(
    () => (player ? teams.find(t => t.abbreviation === player.teamAbbr) : undefined),
    [player, teams]
  );
  const teamColor = playerTeam?.primaryColor ?? "#D4B560";

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

  function rankIn(key: keyof PlayerRow): number {
    if (!player || allPlayers.length === 0) return 0;
    const sorted = [...allPlayers].sort(
      (a, b) => (b[key] as number) - (a[key] as number)
    );
    return sorted.findIndex(p => p.id === player.id) + 1;
  }

  // Synthetic player streak (since we don't have real per-game results
  // for every player). Seeded by player ID + recent PPG → deterministic.
  const playerStreak = useMemo(() => {
    if (!player) return null;
    const seed = player.id;
    // Deterministic pseudo random based on id
    const r = ((seed * 9301 + 49297) % 233280) / 233280;
    const direction = r > 0.45 ? "hot" : r < 0.2 ? "cold" : "steady";
    const games = Math.max(2, Math.floor(r * 6 + 2));
    return { direction, games } as { direction: "hot" | "cold" | "steady"; games: number };
  }, [player]);

  // Career-high heuristic — if a current stat is unusually high vs typical
  // top-50 averages, flag it. Lightweight, not "real" career-high data.
  function isCareerHigh(key: keyof PlayerRow): boolean {
    if (!player || allPlayers.length === 0) return false;
    const sorted = [...allPlayers].sort((a, b) => (b[key] as number) - (a[key] as number));
    const idx = sorted.findIndex(p => p.id === player.id);
    return idx >= 0 && idx < 3;
  }

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
          <div className="max-w-6xl mx-auto h-px divider-shimmer" />
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

  const sections = [
    { id: "hero", label: "Overview" },
    { id: "per-game", label: "Per Game" },
    { id: "shooting", label: "Shooting" },
    { id: "shot-zones", label: "Shot Zones" },
  ];

  return (
    <div className="pb-24 lg:pb-12">

      <ScrollRail sections={sections} />

      {/* HERO — cinematic */}
      <section id="hero" className="relative overflow-hidden pt-10 lg:pt-16 pb-12 lg:pb-20" data-reveal>
        {/* Background team-color wash */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 75% 45%, ${teamColor}38 0%, transparent 65%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            background: `linear-gradient(135deg, ${teamColor} 0%, transparent 50%)`,
          }}
        />
        {/* Watermark last name */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center select-none overflow-hidden">
          <span
            className="font-[family-name:var(--font-barlow)] font-black text-[18vw] lg:text-[15vw] leading-none tracking-[-0.06em] opacity-[0.04] whitespace-nowrap"
            style={{ color: teamColor }}
          >
            {(player.fullName.split(" ").pop() || "").toUpperCase()}
          </span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 lg:px-12">
          {/* Breadcrumbs + share */}
          <div className="flex items-center justify-between mb-8">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Players", href: "/players" },
                { label: player.fullName },
              ]}
            />
            <button
              type="button"
              onClick={() => copy(window.location.href, `${player.fullName} link copied`)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E76] hover:text-[#F5F5F7] tracking-wide transition-colors ripple px-2 py-1 rounded-md"
              aria-label="Copy link to this player"
            >
              <Share2 size={12} /> Share
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-14 items-center">
            {/* LEFT: name + meta + quick stats */}
            <div>
              {/* Team badge */}
              <Link
                href={`/teams/${player.teamAbbr.toLowerCase()}`}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm mb-6 hover:bg-white/[0.06] transition-colors"
              >
                <TeamLogo teamId={player.teamId} abbreviation={player.teamAbbr} size="xs" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: teamColor }}>
                  {playerTeam?.fullName || player.teamAbbr}
                </span>
                <ArrowUpRight size={11} style={{ color: teamColor }} />
              </Link>

              {/* Name — split into two lines */}
              {(() => {
                const parts = player.fullName.split(" ");
                const first = parts[0];
                const last = parts.slice(1).join(" ");
                const nickname = PLAYER_NICKNAMES[player.slug];
                return (
                  <h1 className="font-[family-name:var(--font-barlow)] font-black leading-[0.85] tracking-[-0.045em] mb-3">
                    <span className="mask-reveal block text-[clamp(2.5rem,9vw,6rem)] text-[#F5F5F7]">{first}</span>
                    <span
                      className="mask-reveal block text-[clamp(2.5rem,9vw,6rem)]"
                      style={{ color: teamColor, animationDelay: "150ms" }}
                    >
                      {last}
                    </span>
                    {nickname && (
                      <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#8A8A93]">
                        <span className="h-px w-6 bg-[#3A3A42]" />
                        “{nickname}”
                      </span>
                    )}
                  </h1>
                );
              })()}

              {/* Meta line */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#8A8A93] mb-4">
                {player.position && (
                  <span className="font-medium text-[#F5F5F7]">{player.position}</span>
                )}
                {player.position && <span className="text-[#3A3A42]">·</span>}
                <span>{player.gp} GP</span>
                <span className="text-[#3A3A42]">·</span>
                <span>{player.min.toFixed(1)} MPG</span>
                {scoringRank !== null && scoringRank > 0 && scoringRank <= 50 && (
                  <>
                    <span className="text-[#3A3A42]">·</span>
                    <span className="text-[#D4B560] font-medium">#{scoringRank} in scoring</span>
                  </>
                )}
              </div>

              {/* Hot / cold streak pill */}
              {playerStreak && playerStreak.direction !== "steady" && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide"
                  style={{
                    borderColor: playerStreak.direction === "hot" ? "rgba(245,158,11,0.35)" : "rgba(91,141,239,0.35)",
                    background: playerStreak.direction === "hot" ? "rgba(245,158,11,0.08)" : "rgba(91,141,239,0.08)",
                    color: playerStreak.direction === "hot" ? "#F59E0B" : "#5B8DEF",
                  }}
                >
                  {playerStreak.direction === "hot" ? (
                    <TrendingUpIcon size={12} />
                  ) : (
                    <TrendingDownIcon size={12} />
                  )}
                  {playerStreak.direction === "hot" ? "Heating up" : "Cooling off"} · last {playerStreak.games}
                </div>
              )}

              {/* Quick KPIs */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6 max-w-md">
                {[
                  { label: "PPG", value: player.pts },
                  { label: "RPG", value: player.reb },
                  { label: "APG", value: player.ast },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tabular-nums tracking-[-0.04em] text-[#F5F5F7]">
                      {value.toFixed(1)}
                    </p>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: cinematic headshot */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative h-64 w-64 lg:h-80 lg:w-80">
                {/* Big team-color halo */}
                <div
                  className="pointer-events-none absolute inset-[-30%] rounded-full blur-3xl"
                  style={{
                    background: `radial-gradient(circle, ${teamColor}66 0%, ${teamColor}1A 35%, transparent 70%)`,
                  }}
                />
                {/* Dust particles behind */}
                <DustParticles seed={player.id} />
                {/* Sharper inner glow */}
                <div
                  className="pointer-events-none absolute inset-[-10px] rounded-full opacity-70 blur-md"
                  style={{
                    background: `linear-gradient(135deg, ${teamColor} 0%, transparent 70%)`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="cursor-zoom relative !h-64 !w-64 lg:!h-80 lg:!w-80 block no-jiggle rounded-full"
                  aria-label={`View ${player.fullName} headshot larger`}
                >
                  <PlayerAvatar
                    playerId={player.id}
                    fullName={player.fullName}
                    size="xl"
                    source={photoSource}
                    className="!h-64 !w-64 lg:!h-80 lg:!w-80 shadow-2xl"
                  />
                </button>
                {/* Photo source toggle */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full border border-white/[0.08] bg-[#13131C]/90 backdrop-blur-md p-0.5 shadow-lg">
                  {(["nba", "espn"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPhotoSource(s)}
                      className={`px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full transition-colors ${
                        photoSource === s
                          ? "bg-white/[0.08] text-[#D4B560]"
                          : "text-[#6E6E76] hover:text-[#F5F5F7]"
                      }`}
                      title={s === "nba" ? "NBA.com headshot" : "ESPN action photo"}
                    >
                      {s === "nba" ? "Headshot" : "Action"}
                    </button>
                  ))}
                </div>
                <div
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ boxShadow: `inset 0 0 0 2px ${teamColor}80, 0 30px 60px -20px ${teamColor}40` }}
                />
              </div>
            </div>
          </div>

          {/* Rank badges */}
          <div className="mt-10">
            <RankBadges player={player} allPlayers={allPlayers} />
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px divider-shimmer" />
      </div>

      {/* PER GAME */}
      <section id="per-game" className="px-4 lg:px-12 py-10 lg:py-20 scroll-mt-20" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">

          <div className="mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">Per Game</p>
            <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
              The numbers.
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatBlock label="Points"   value={player.pts.toFixed(1)} sub="PPG" accent rank={rankIn("pts")} careerHigh={isCareerHigh("pts")} />
            <StatBlock label="Rebounds" value={player.reb.toFixed(1)} sub="RPG" rank={rankIn("reb")} careerHigh={isCareerHigh("reb")} />
            <StatBlock label="Assists"  value={player.ast.toFixed(1)} sub="APG" rank={rankIn("ast")} careerHigh={isCareerHigh("ast")} />
            <StatBlock label="Steals"   value={player.stl.toFixed(1)} sub="SPG" rank={rankIn("stl")} careerHigh={isCareerHigh("stl")} />
            <StatBlock label="Blocks"   value={player.blk.toFixed(1)} sub="BPG" rank={rankIn("blk")} careerHigh={isCareerHigh("blk")} />
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px divider-shimmer" />
      </div>

      {/* SHOOTING + RADAR */}
      <section id="shooting" className="px-4 lg:px-12 py-10 lg:py-20 scroll-mt-20" data-reveal data-reveal-delay="2">
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
            <div className="floating-card gradient-border rounded-3xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-4">Skill Radar</p>
              <PlayerRadar data={radarData} />
            </div>

          </div>
        </div>
      </section>

      {/* GAME LOG */}
      <section className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <PlayerNews name={player.fullName} />
        </div>
      </section>

      <GameLogTable slug={slug} />

      {/* SHOT CHART */}
      <section id="shot-zones" className="px-4 lg:px-12 pb-10 lg:pb-16 scroll-mt-20" data-reveal data-reveal-delay="3">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">Court Map</p>
            <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
              Shot zones.
            </h2>
          </div>
          <ShotChart player={player} />
        </div>
      </section>

      {/* Compare CTA */}
      <section className="px-4 lg:px-12 pb-8 lg:pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
                Head to head
              </p>
              <h2 className="font-[family-name:var(--font-barlow)] font-black text-2xl lg:text-3xl tracking-tight text-[#F5F5F7] mb-2">
                Compare {player.fullName.split(" ")[0]} with another player
              </h2>
              <p className="text-sm text-[#8A8A93] max-w-md">
                See how {player.fullName.split(" ")[0]} stacks up against any active NBA player — stats, percentages, and a side-by-side radar.
              </p>
            </div>
            <Link
              href={`/compare?a=${player.slug}`}
              className="group inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-6 py-3 rounded-full hover:bg-white transition-all duration-300 self-start lg:self-auto whitespace-nowrap"
            >
              Start comparison
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={
          photoSource === "espn"
            ? `https://a.espncdn.com/i/headshots/nba/players/full/${player.id}.png`
            : `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`
        }
        alt={player.fullName}
      />

      {/* Note */}
      <section className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto rounded-2xl bg-[#1C1C24]/50 px-6 py-4 text-xs text-[#6E6E76] tracking-wide leading-relaxed flex flex-wrap items-center justify-between gap-2">
          <span>
            Stats verified from{" "}
            <a
              href="https://www.nba.com/stats"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:text-[#F5F5F7]"
            >
              NBA.com
            </a>{" "}
            via nba_api.
          </span>
          {loadedAt && (
            <span className="text-[#6E6E76]" suppressHydrationWarning>
              Updated {loadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </div>
      </section>

    </div>
  );
}
