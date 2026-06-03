"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, TrendingUp, Award } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Confetti";
import { useCopyToClipboard } from "@/components/ui/Toast";
import { TEAM_COLORS } from "@/lib/teamColors";

type Team = {
  teamId: number;
  tricode: string;
  city: string;
  name: string;
  displayName: string;
  score: number;
  homeAway: string;
  winner: boolean;
  linescores: string[];
};

type Player = {
  id: number;
  name: string;
  shortName: string;
  position: string;
  jersey: string;
  starter: boolean;
  didNotPlay: boolean;
  stats: string[];
};

type PlayersBlock = {
  tricode: string;
  labels: string[];
  athletes: Player[];
};

type Boxscore = {
  gameId: string;
  status: { state: string; text: string; completed: boolean };
  date: string;
  seriesText: string;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: PlayersBlock | null;
  awayPlayers: PlayersBlock | null;
};

// Find the index of a stat label in the boxscore (PTS/REB/AST/+/-).
// ESPN sometimes orders things slightly differently per game so we look up by label.
function findStatIdx(labels: string[], wanted: string[]): number {
  const norm = labels.map((l) => l.toUpperCase().trim());
  for (const w of wanted) {
    const i = norm.indexOf(w.toUpperCase());
    if (i >= 0) return i;
  }
  return -1;
}

function parseStatNum(s: string | undefined): number {
  if (!s) return 0;
  // "+/-" comes back as "+8" or "-3"; PTS comes back as "28"
  const n = parseInt(s.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

type TopPerformer = {
  player: Player;
  pts: number;
  reb: number;
  ast: number;
  plusMinus: number;
};

function getTopPerformer(block: PlayersBlock | null): TopPerformer | null {
  if (!block) return null;
  const ptsIdx = findStatIdx(block.labels, ["PTS"]);
  const rebIdx = findStatIdx(block.labels, ["REB"]);
  const astIdx = findStatIdx(block.labels, ["AST"]);
  const pmIdx = findStatIdx(block.labels, ["+/-", "PM"]);
  if (ptsIdx < 0) return null;
  let top: Player | null = null;
  let topPts = -1;
  for (const p of block.athletes) {
    if (p.didNotPlay) continue;
    const pts = parseStatNum(p.stats[ptsIdx]);
    if (pts > topPts) {
      topPts = pts;
      top = p;
    }
  }
  if (!top) return null;
  return {
    player: top,
    pts: parseStatNum(top.stats[ptsIdx]),
    reb: rebIdx >= 0 ? parseStatNum(top.stats[rebIdx]) : 0,
    ast: astIdx >= 0 ? parseStatNum(top.stats[astIdx]) : 0,
    plusMinus: pmIdx >= 0 ? parseStatNum(top.stats[pmIdx]) : 0,
  };
}

export default function BoxscorePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const [data, setData] = useState<Boxscore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<"away" | "home">("away");
  const [playerSlugByName, setPlayerSlugByName] = useState<Record<string, string>>({});
  const copy = useCopyToClipboard();

  useEffect(() => {
    fetch(`/api/games/${gameId}/boxscore`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then(setData)
      .catch(() => setError("Couldn't load this game."));
  }, [gameId]);

  // Build name → slug lookup from player database so boxscore names link to profiles
  useEffect(() => {
    fetch("/api/players/with-stats")
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: Array<{ fullName: string; slug: string }>) => {
        if (!Array.isArray(arr)) return;
        const map: Record<string, string> = {};
        arr.forEach((p) => {
          map[p.fullName.toLowerCase()] = p.slug;
        });
        setPlayerSlugByName(map);
      })
      .catch(() => {});
  }, []);

  if (error) {
    return (
      <div className="px-4 lg:px-12 py-16 max-w-6xl mx-auto">
        <Link href="/scores" className="inline-flex items-center gap-1 text-sm text-[#8A8A93] hover:text-[#F5F5F7] mb-8">
          <ArrowLeft size={14} /> Back to scores
        </Link>
        <p className="text-[#8A8A93]">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 lg:px-12 py-10 lg:py-16 max-w-6xl mx-auto">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const dateStr = data.date
    ? new Date(data.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const activeBlock = activeTeam === "away" ? data.awayPlayers : data.homePlayers;

  // Top performers (computed only when boxscore data is present)
  const awayTop = useMemo(() => getTopPerformer(data.awayPlayers), [data.awayPlayers]);
  const homeTop = useMemo(() => getTopPerformer(data.homePlayers), [data.homePlayers]);

  // Lead-change timeline: compute lead (home - away) at end of each quarter
  const leadByQuarter = useMemo(() => {
    const aQ = data.awayTeam.linescores.map((s) => parseStatNum(s));
    const hQ = data.homeTeam.linescores.map((s) => parseStatNum(s));
    const n = Math.min(aQ.length, hQ.length);
    const points: { quarter: number; aTotal: number; hTotal: number; lead: number }[] = [];
    let aSum = 0;
    let hSum = 0;
    for (let i = 0; i < n; i++) {
      aSum += aQ[i];
      hSum += hQ[i];
      points.push({ quarter: i + 1, aTotal: aSum, hTotal: hSum, lead: hSum - aSum });
    }
    return points;
  }, [data.awayTeam.linescores, data.homeTeam.linescores]);

  // Team colors
  const awayColor = TEAM_COLORS[data.awayTeam.tricode] ?? "#5B8DEF";
  const homeColor = TEAM_COLORS[data.homeTeam.tricode] ?? "#D4B560";

  return (
    <div className="pb-24 lg:pb-12">
      <section className="px-4 lg:px-12 pt-10 lg:pt-16 max-w-6xl mx-auto" data-reveal>
        {/* Back link */}
        <Link
          href="/scores"
          className="inline-flex items-center gap-1 text-sm text-[#8A8A93] hover:text-[#F5F5F7] mb-6"
        >
          <ArrowLeft size={14} /> Back to scores
        </Link>

        {/* Status eyebrow */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-bold tracking-[0.2em] uppercase ${
                data.status.state === "post"
                  ? "text-[#8A8A93]"
                  : data.status.state === "in"
                  ? "text-[#34D399]"
                  : "text-[#D4B560]"
              }`}
            >
              {data.status.text}
            </span>
            {data.seriesText && (
              <>
                <span className="text-[#3F3F46]">·</span>
                <span className="text-xs text-[#8A8A93]">{data.seriesText}</span>
              </>
            )}
            <span className="text-[#3F3F46]">·</span>
            <span className="text-xs text-[#8A8A93]">{dateStr}</span>
          </div>
          <button
            type="button"
            onClick={() => copy(window.location.href, "Game link copied")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E76] hover:text-[#F5F5F7] tracking-wide transition-colors ripple px-2 py-1 rounded-md shrink-0"
            aria-label="Copy link to this game"
          >
            <Share2 size={12} /> Share
          </button>
        </div>

        {/* Matchup card — sticky while scrolling through player stats */}
        <div className="floating-card gradient-border no-jiggle rounded-3xl p-6 lg:p-10 mb-10 relative overflow-hidden sticky top-16 z-20 backdrop-blur-md">
          {data.status.state === "post" && <Confetti />}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 lg:gap-12 items-center">
            {/* Away team */}
            <Link
              href={`/teams/${data.awayTeam.tricode.toLowerCase()}`}
              className="flex flex-col items-center text-center gap-3 group no-jiggle"
            >
              <TeamLogo
                teamId={data.awayTeam.teamId}
                abbreviation={data.awayTeam.tricode}
                size="xl"
                className={`group-hover:scale-105 transition-transform ${data.awayTeam.winner ? "ring-2 ring-[#D4B560]/60 shadow-[0_0_30px_rgba(212,181,96,0.35)]" : ""}`}
              />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                  {data.awayTeam.tricode}
                </p>
                <p className="font-[family-name:var(--font-barlow)] font-bold text-xl lg:text-2xl tracking-tight text-[#F5F5F7] mt-1">
                  {data.awayTeam.name}
                </p>
              </div>
            </Link>

            {/* Score */}
            <div className="text-center">
              <div className="flex items-baseline gap-3 lg:gap-6">
                <span
                  className={`font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-tight ${
                    data.awayTeam.winner ? "text-[#F5F5F7]" : "text-[#6E6E76]"
                  }`}
                >
                  {data.awayTeam.score}
                </span>
                <span className="text-[#3F3F46] text-2xl lg:text-3xl">·</span>
                <span
                  className={`font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-tight ${
                    data.homeTeam.winner ? "text-[#F5F5F7]" : "text-[#6E6E76]"
                  }`}
                >
                  {data.homeTeam.score}
                </span>
              </div>
            </div>

            {/* Home team */}
            <Link
              href={`/teams/${data.homeTeam.tricode.toLowerCase()}`}
              className="flex flex-col items-center text-center gap-3 group no-jiggle"
            >
              <TeamLogo
                teamId={data.homeTeam.teamId}
                abbreviation={data.homeTeam.tricode}
                size="xl"
                className={`group-hover:scale-105 transition-transform ${data.homeTeam.winner ? "ring-2 ring-[#D4B560]/60 shadow-[0_0_30px_rgba(212,181,96,0.35)]" : ""}`}
              />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                  {data.homeTeam.tricode}
                </p>
                <p className="font-[family-name:var(--font-barlow)] font-bold text-xl lg:text-2xl tracking-tight text-[#F5F5F7] mt-1">
                  {data.homeTeam.name}
                </p>
              </div>
            </Link>
          </div>

          {/* Win probability — only meaningful when game is live or final */}
          {data.status.state !== "pre" && (data.awayTeam.score > 0 || data.homeTeam.score > 0) && (() => {
            const diff = data.homeTeam.score - data.awayTeam.score;
            // Crude logistic: each +1 point of differential = ~+3% home win prob
            const homeWP =
              data.status.state === "post"
                ? data.homeTeam.winner ? 100 : 0
                : Math.max(2, Math.min(98, 50 + diff * 3.2));
            const awayWP = 100 - homeWP;
            return (
              <div className="mt-6 pt-6 border-t border-white/[0.04]">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-3 text-center">
                  Win probability
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold tabular-nums text-[#F5F5F7] w-12 text-right">
                    {awayWP.toFixed(0)}%
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/[0.05] flex">
                    <div className="bg-[#5B8DEF] transition-all duration-700" style={{ width: `${awayWP}%` }} />
                    <div className="bg-[#D4B560] transition-all duration-700" style={{ width: `${homeWP}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-[#F5F5F7] w-12">
                    {homeWP.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-[#6E6E76] tracking-wider mt-1.5 px-12">
                  <span>{data.awayTeam.tricode}</span>
                  <span>{data.homeTeam.tricode}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Empty state for upcoming games */}
        {data.status.state === "pre" && (
          <div className="floating-card no-jiggle rounded-2xl p-10 text-center">
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
              Tip-off
            </p>
            <p className="text-2xl font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7] mb-3">
              {data.status.text}
            </p>
            <p className="text-sm text-[#8A8A93] max-w-md mx-auto">
              Box score, player stats, and quarter-by-quarter scoring will be available once the game begins.
            </p>
          </div>
        )}

        {/* Top performers — one per team */}
        {(awayTop || homeTop) && (
          <div className="mb-10">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4 inline-flex items-center gap-1.5">
              <Award size={11} className="text-[#D4B560]" />
              Top performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { perf: awayTop, color: awayColor, team: data.awayTeam },
                { perf: homeTop, color: homeColor, team: data.homeTeam },
              ].map(({ perf, color, team }) =>
                perf ? (
                  <div
                    key={team.tricode}
                    className="floating-card no-jiggle rounded-3xl p-5 lg:p-6 bg-gradient-to-br from-[#1C1C24] to-[#131318] relative overflow-hidden"
                  >
                    {/* Team color accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: color }} />
                    <div
                      className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-25 pointer-events-none"
                      style={{ background: color }}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color }}>
                          <TeamLogo teamId={team.teamId} abbreviation={team.tricode} size="xs" />
                          {team.tricode} · Top scorer
                        </span>
                        {perf.plusMinus !== 0 && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold tabular-nums tracking-wider ${perf.plusMinus > 0 ? "text-[#34D399]" : "text-[#F87171]"}`}>
                            {perf.plusMinus > 0 ? "+" : ""}{perf.plusMinus}
                          </span>
                        )}
                      </div>

                      <Link
                        href={
                          playerSlugByName[perf.player.name.toLowerCase()]
                            ? `/players/${playerSlugByName[perf.player.name.toLowerCase()]}`
                            : `/players?q=${encodeURIComponent(perf.player.name)}`
                        }
                        className="flex items-center gap-4 group"
                      >
                        <PlayerAvatar
                          playerId={perf.player.id}
                          fullName={perf.player.name}
                          size="xl"
                          source="espn"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-[family-name:var(--font-barlow)] font-black text-2xl tracking-tight text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors truncate">
                            {perf.player.name}
                          </p>
                          <p className="text-xs text-[#8A8A93] mt-0.5">
                            {perf.player.starter ? "Starter" : "Bench"} · {perf.player.position || "—"} · #{perf.player.jersey || "—"}
                          </p>
                        </div>
                      </Link>

                      <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.04]">
                        <div>
                          <p className="font-[family-name:var(--font-barlow)] font-black text-3xl tabular-nums tracking-tight" style={{ color }}>
                            {perf.pts}
                          </p>
                          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6E6E76] mt-0.5">PTS</p>
                        </div>
                        <div>
                          <p className="font-[family-name:var(--font-barlow)] font-black text-3xl tabular-nums tracking-tight text-[#F5F5F7]">
                            {perf.reb}
                          </p>
                          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6E6E76] mt-0.5">REB</p>
                        </div>
                        <div>
                          <p className="font-[family-name:var(--font-barlow)] font-black text-3xl tabular-nums tracking-tight text-[#F5F5F7]">
                            {perf.ast}
                          </p>
                          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6E6E76] mt-0.5">AST</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Quarter scoring — visual bars + table */}
        {data.status.state !== "pre" && (data.awayTeam.linescores.length > 0 || data.homeTeam.linescores.length > 0) && (
          <div className="mb-10">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4 inline-flex items-center gap-1.5">
              <TrendingUp size={11} className="text-[#D4B560]" />
              Quarter by quarter
            </h2>

            {/* Visual bars — one row per quarter, both teams */}
            <div className="floating-card no-jiggle rounded-3xl p-5 lg:p-6 mb-3 bg-gradient-to-br from-[#1C1C24] to-[#131318]">
              {(() => {
                const aQ = data.awayTeam.linescores.map(parseStatNum);
                const hQ = data.homeTeam.linescores.map(parseStatNum);
                const maxQuarter = Math.max(1, ...aQ, ...hQ);
                const labels = aQ.map((_, i) => (i < 4 ? `Q${i + 1}` : `OT${i - 3}`));
                return (
                  <div className="space-y-4">
                    {labels.map((label, i) => {
                      const a = aQ[i] ?? 0;
                      const h = hQ[i] ?? 0;
                      const aWon = a > h;
                      const hWon = h > a;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">{label}</span>
                            <span className="text-[10px] text-[#6E6E76] tracking-wider tabular-nums">
                              {a + h} total pts
                            </span>
                          </div>
                          <div className="grid grid-cols-[60px_1fr_40px_1fr_60px] items-center gap-2">
                            {/* Away score */}
                            <span className={`font-[family-name:var(--font-barlow)] font-black text-xl tabular-nums text-right ${aWon ? "text-[#F5F5F7]" : "text-[#6E6E76]"}`}>
                              {a}
                            </span>
                            {/* Away bar (right-to-left) */}
                            <div className="flex justify-end">
                              <div
                                className="h-2 rounded-full transition-all duration-700"
                                style={{
                                  width: `${(a / maxQuarter) * 100}%`,
                                  background: aWon ? awayColor : `${awayColor}66`,
                                }}
                              />
                            </div>
                            {/* Center divider with tricode */}
                            <div className="flex justify-center">
                              <span className="text-[9px] tracking-wider text-[#4A4A52]">
                                vs
                              </span>
                            </div>
                            {/* Home bar (left-to-right) */}
                            <div className="flex justify-start">
                              <div
                                className="h-2 rounded-full transition-all duration-700"
                                style={{
                                  width: `${(h / maxQuarter) * 100}%`,
                                  background: hWon ? homeColor : `${homeColor}66`,
                                }}
                              />
                            </div>
                            {/* Home score */}
                            <span className={`font-[family-name:var(--font-barlow)] font-black text-xl tabular-nums ${hWon ? "text-[#F5F5F7]" : "text-[#6E6E76]"}`}>
                              {h}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Totals row */}
              <div className="mt-5 pt-5 border-t border-white/[0.04] grid grid-cols-[60px_1fr_40px_1fr_60px] items-center gap-2">
                <span className={`font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums text-right ${data.awayTeam.winner ? "text-[#F5F5F7]" : "text-[#6E6E76]"}`}>
                  {data.awayTeam.score}
                </span>
                <span className="text-right text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: awayColor }}>
                  {data.awayTeam.tricode}
                </span>
                <span className="text-center text-[10px] text-[#4A4A52]">final</span>
                <span className="text-left text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: homeColor }}>
                  {data.homeTeam.tricode}
                </span>
                <span className={`font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums ${data.homeTeam.winner ? "text-[#F5F5F7]" : "text-[#6E6E76]"}`}>
                  {data.homeTeam.score}
                </span>
              </div>
            </div>

            {/* Lead-change timeline */}
            {leadByQuarter.length >= 2 && (() => {
              const maxAbs = Math.max(1, ...leadByQuarter.map((p) => Math.abs(p.lead)));
              const W = 600;
              const H = 120;
              const padX = 30;
              const padY = 20;
              const stepX = (W - 2 * padX) / Math.max(1, leadByQuarter.length);
              // Always include t=0 as origin
              const pts = [{ x: padX, y: H / 2, lead: 0, quarter: 0 }];
              leadByQuarter.forEach((p, i) => {
                const x = padX + stepX * (i + 1);
                const y = H / 2 - (p.lead / maxAbs) * (H / 2 - padY);
                pts.push({ x, y, lead: p.lead, quarter: p.quarter });
              });
              const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
              // Build an area fill split by zero crossing
              const areaPath = `${pathD} L ${pts[pts.length - 1].x} ${H / 2} L ${pts[0].x} ${H / 2} Z`;
              return (
                <div className="floating-card no-jiggle rounded-3xl p-5 lg:p-6 bg-gradient-to-br from-[#1C1C24] to-[#131318]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">Lead change</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
                      <span style={{ color: awayColor }}>{data.awayTeam.tricode} ↑</span>
                      <span className="text-[#6E6E76]">/</span>
                      <span style={{ color: homeColor }}>{data.homeTeam.tricode} ↓</span>
                    </div>
                  </div>
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: H }}>
                    {/* zero line */}
                    <line x1={padX} y1={H / 2} x2={W - padX} y2={H / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 3" />
                    {/* Quarter ticks */}
                    {pts.slice(1).map((p) => (
                      <g key={p.quarter}>
                        <line x1={p.x} y1={padY} x2={p.x} y2={H - padY} stroke="rgba(255,255,255,0.04)" />
                        <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#4A4A52" fontWeight="bold">
                          {p.quarter <= 4 ? `Q${p.quarter}` : `OT${p.quarter - 4}`}
                        </text>
                      </g>
                    ))}
                    {/* Area fill — gradient via mask trick */}
                    <defs>
                      <linearGradient id={`area-${data.gameId}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={homeColor} stopOpacity="0.35" />
                        <stop offset="50%" stopColor="transparent" />
                        <stop offset="100%" stopColor={awayColor} stopOpacity="0.35" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill={`url(#area-${data.gameId})`} />
                    {/* Line */}
                    <path d={pathD} fill="none" stroke="#F5F5F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Quarter points + lead labels */}
                    {pts.slice(1).map((p) => (
                      <g key={`pt-${p.quarter}`}>
                        <circle cx={p.x} cy={p.y} r="3" fill={p.lead === 0 ? "#6E6E76" : p.lead > 0 ? homeColor : awayColor} stroke="#0A0A0E" strokeWidth="1.5" />
                        <text x={p.x} y={p.lead > 0 ? p.y - 8 : p.y + 14} textAnchor="middle" fontSize="9" fill="#8A8A93" fontWeight="bold">
                          {p.lead === 0 ? "tied" : `${p.lead > 0 ? data.homeTeam.tricode : data.awayTeam.tricode} +${Math.abs(p.lead)}`}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              );
            })()}
          </div>
        )}

        {/* Boxscore */}
        {data.status.state !== "pre" && (data.awayPlayers || data.homePlayers) && (
          <div>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4">
              Boxscore
            </h2>

            {/* Team toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-white/[0.03] rounded-full mb-4">
              <button
                onClick={() => setActiveTeam("away")}
                className={`no-jiggle flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTeam === "away" ? "bg-white text-[#0A0A0E]" : "text-[#8A8A93] hover:text-[#F5F5F7]"
                }`}
              >
                <TeamLogo teamId={data.awayTeam.teamId} abbreviation={data.awayTeam.tricode} size="xs" />
                {data.awayTeam.tricode}
              </button>
              <button
                onClick={() => setActiveTeam("home")}
                className={`no-jiggle flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTeam === "home" ? "bg-white text-[#0A0A0E]" : "text-[#8A8A93] hover:text-[#F5F5F7]"
                }`}
              >
                <TeamLogo teamId={data.homeTeam.teamId} abbreviation={data.homeTeam.tricode} size="xs" />
                {data.homeTeam.tricode}
              </button>
            </div>

            {/* Stats table */}
            {activeBlock && (
              <div className="floating-card no-jiggle rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left px-4 lg:px-6 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider sticky left-0 bg-[#131318]">
                          Player
                        </th>
                        {activeBlock.labels.map((lbl) => (
                          <th
                            key={lbl}
                            className="text-right px-2 lg:px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider"
                          >
                            {lbl}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeBlock.athletes
                        .filter((p) => !p.didNotPlay)
                        .map((p) => (
                          <tr key={p.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 lg:px-6 py-3 sticky left-0 bg-[#131318]">
                              <Link
                                href={
                                  playerSlugByName[p.name.toLowerCase()]
                                    ? `/players/${playerSlugByName[p.name.toLowerCase()]}`
                                    : `/players?q=${encodeURIComponent(p.name)}`
                                }
                                className="flex items-center gap-2 min-w-[180px] group no-jiggle"
                              >
                                <PlayerAvatar playerId={p.id} fullName={p.name} size="sm" source="espn" />
                                <div>
                                  <p className="text-[#F5F5F7] font-medium leading-tight group-hover:text-[#D4B560] transition-colors">
                                    {p.shortName || p.name}
                                  </p>
                                  <p className="text-[10px] text-[#6E6E76]">
                                    {p.starter ? "Starter · " : ""}
                                    {p.position}
                                  </p>
                                </div>
                              </Link>
                            </td>
                            {p.stats.map((s, i) => (
                              <td
                                key={i}
                                className={`text-right px-2 lg:px-3 py-3 tabular-nums ${
                                  i === 1 ? "text-[#F5F5F7] font-semibold" : "text-[#8A8A93]"
                                }`}
                              >
                                {s}
                              </td>
                            ))}
                          </tr>
                        ))}
                      {activeBlock.athletes.filter((p) => p.didNotPlay).length > 0 && (
                        <tr className="border-t border-white/[0.04]">
                          <td colSpan={activeBlock.labels.length + 1} className="px-4 lg:px-6 py-2 text-[10px] uppercase tracking-wider text-[#6E6E76]">
                            DNP: {activeBlock.athletes.filter((p) => p.didNotPlay).map((p) => p.shortName || p.name).join(", ")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
