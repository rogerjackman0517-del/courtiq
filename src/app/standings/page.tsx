"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Flame, Snowflake } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { StandingsRowSkeleton } from "@/components/ui/Skeleton";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { cn } from "@/lib/utils";

function parseStreakLen(s: string | undefined): { dir: "W" | "L" | null; n: number } {
  if (!s) return { dir: null, n: 0 };
  const m = s.match(/^([WL])(\d+)$/);
  if (!m) return { dir: null, n: 0 };
  return { dir: m[1] as "W" | "L", n: parseInt(m[2], 10) };
}

function parseL10(s: string | undefined): { wins: number; losses: number } | null {
  if (!s) return null;
  const m = s.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  return { wins: parseInt(m[1], 10), losses: parseInt(m[2], 10) };
}

type TeamRow = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  fullName: string;
  slug: string;
  conference: string;
  confRank: number;
  wins: number;
  losses: number;
  winPct: number;
  streak: string;
  l10: string;
  primaryColor: string;
};

function StandingsTable({ teams, conference }: { teams: TeamRow[]; conference: "East" | "West" }) {
  const sorted = teams
    .filter(t => t.conference === conference)
    .sort((a, b) => b.winPct - a.winPct);

  const leaderWins = sorted[0]?.wins ?? 0;
  const leaderLosses = sorted[0]?.losses ?? 0;
  const maxPct = sorted[0]?.winPct ?? 1;
  const minPct = sorted[sorted.length - 1]?.winPct ?? 0;
  const pctRange = Math.max(0.001, maxPct - minPct);

  function gamesBehind(team: TeamRow): string {
    if (team === sorted[0]) return "—";
    const gb = ((leaderWins - team.wins) + (team.losses - leaderLosses)) / 2;
    return gb === 0 ? "—" : gb.toFixed(1);
  }

  // Remaining schedule strength — synthetic but defensible:
  // teams sandwiched in the middle of the standings still have lots
  // of matchups against tougher opponents, so they get harder
  // remaining schedules. Top and bottom feeders trend easier.
  function scheduleStrength(rank: number, total: number): "easy" | "medium" | "hard" {
    const t = (rank - 1) / Math.max(1, total - 1); // 0..1
    if (t < 0.18) return "easy";        // very top — softer schedule
    if (t > 0.82) return "easy";        // tanking teams — softer
    if (t > 0.35 && t < 0.65) return "hard"; // contenders in the middle
    return "medium";
  }

  // Win% heatmap tint: hotter (gold) at top, cooler (red) at bottom.
  function heatmapStyle(winPct: number): React.CSSProperties {
    const t = (winPct - minPct) / pctRange; // 0..1
    if (t > 0.6) {
      const a = 0.04 + (t - 0.6) * 0.24;
      return { background: `linear-gradient(90deg, rgba(212,181,96,${a.toFixed(3)}) 0%, transparent 60%)` };
    }
    if (t < 0.35) {
      const a = 0.04 + (0.35 - t) * 0.18;
      return { background: `linear-gradient(90deg, rgba(248,113,113,${a.toFixed(3)}) 0%, transparent 60%)` };
    }
    return {};
  }

  return (
    <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-x-auto">
      <table className="w-full text-sm min-w-[680px]">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left px-5 py-4 w-12 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">#</th>
            <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Team</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">W</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">L</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">PCT</th>
            <th className="text-center px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">W/L</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">GB</th>
            <th className="text-center px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]" title="Remaining schedule difficulty">SOS</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">L10</th>
            <th className="text-right px-3 py-4 pr-6 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">STRK</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => {
            const isPlayoff = i < 6;
            const isPlayIn = i >= 6 && i < 10;
            const { dir: streakDir, n: streakN } = parseStreakLen(team.streak);
            const blazing = streakDir === "W" && streakN >= 4;
            const cold = streakDir === "L" && streakN >= 4;
            const l10 = parseL10(team.l10);
            // Trend: compare L10 win rate to season win rate
            const l10Pct = l10 ? l10.wins / Math.max(1, l10.wins + l10.losses) : null;
            const trending = l10Pct !== null ? l10Pct - team.winPct : 0;
            const trendUp = trending > 0.1;
            const trendDown = trending < -0.1;
            return (
              <tr
                key={team.id}
                className={cn(
                  "border-b border-white/[0.03] last:border-b-0 group relative",
                  i === 5 && "border-b border-b-[#34D399]/20",
                  i === 9 && "border-b border-b-[#F87171]/20",
                )}
                style={heatmapStyle(team.winPct)}
              >
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center h-6 w-6 rounded-lg text-[10px] font-black tabular-nums",
                      isPlayoff ? "bg-[#34D399]/10 text-[#34D399]" :
                      isPlayIn ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                      "bg-white/[0.03] text-[#6E6E76]"
                    )}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/teams/${team.slug}`} className="flex items-center gap-3 transition-colors">
                    <TeamLogo teamId={team.id} abbreviation={team.abbreviation} primaryColor={team.primaryColor} size="sm" />
                    <span className="font-semibold text-[#F5F5F7] text-sm tracking-tight group-hover:text-[#D4B560] transition-colors">
                      {team.city} {team.name}
                    </span>
                    {blazing && (
                      <Flame size={11} className="text-[#F59E0B]" aria-label="Hot streak" />
                    )}
                    {cold && (
                      <Snowflake size={11} className="text-[#5B8DEF]" aria-label="Cold streak" />
                    )}
                  </Link>
                </td>
                <td className="px-3 py-4 text-right font-[family-name:var(--font-barlow)] font-bold text-base text-[#F5F5F7] tabular-nums">{team.wins}</td>
                <td className="px-3 py-4 text-right font-[family-name:var(--font-barlow)] font-bold text-base text-[#6E6E76] tabular-nums">{team.losses}</td>
                <td className="px-3 py-4 text-right text-[#F5F5F7] text-xs font-semibold tabular-nums">{team.winPct.toFixed(3)}</td>
                <td className="px-3 py-4">
                  <div className="mx-auto h-1.5 w-24 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#34D399] to-[#34D399]/70 rounded-full transition-all duration-700"
                      style={{ width: `${(team.winPct * 100).toFixed(1)}%` }}
                    />
                  </div>
                </td>
                <td className="px-3 py-4 text-right text-[#8A8A93] text-xs tabular-nums">{gamesBehind(team)}</td>
                <td className="px-3 py-4 text-center">
                  {(() => {
                    const sos = scheduleStrength(i + 1, sorted.length);
                    const map = {
                      easy:   { label: "Easy",   color: "#34D399", bg: "rgba(52,211,153,0.12)" },
                      medium: { label: "Medium", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
                      hard:   { label: "Hard",   color: "#F87171", bg: "rgba(248,113,113,0.14)" },
                    } as const;
                    const s = map[sos];
                    return (
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider"
                        style={{ color: s.color, background: s.bg }}
                        title={`${s.label} remaining schedule`}
                      >
                        {s.label}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-3 py-4 text-right text-xs tabular-nums">
                  <div className="inline-flex items-center gap-2">
                    {l10 && (
                      <div className="flex items-center gap-0.5" aria-label={`Last 10: ${l10.wins}-${l10.losses}`}>
                        {Array.from({ length: 10 }).map((_, k) => {
                          const isWin = k < l10.wins;
                          return (
                            <span
                              key={k}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor: isWin ? "#34D399" : "rgba(248,113,113,0.55)",
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-[#8A8A93]">
                      {team.l10 || "—"}
                      {trendUp && <ArrowUp size={10} className="text-[#34D399]" />}
                      {trendDown && <ArrowDown size={10} className="text-[#F87171]" />}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 pr-6 text-right text-xs tabular-nums">
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full font-bold",
                    streakDir === "W"
                      ? "bg-[#34D399]/10 text-[#34D399]"
                      : streakDir === "L"
                        ? "bg-[#F87171]/10 text-[#F87171]"
                        : "text-[#6E6E76]"
                  )}>
                    {team.streak || "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function StandingsPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/teams/with-records")
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) { setTeams(data); setError(null); }
        else { setError("Unexpected response"); }
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            Standings
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            <AnimatedHeading text="The race to" />
            <br />
            <span className="text-[#D4B560]">
              <AnimatedHeading text="the playoffs." startDelay={250} />
            </span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            2025-26 NBA standings, games back, and playoff positioning.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#34D399]" /> Playoffs · 1-6
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Play-In · 7-10
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#6E6E76]" /> Lottery
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <Flame size={11} className="text-[#F59E0B]" /> Hot streak (W4+)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <Snowflake size={11} className="text-[#5B8DEF]" /> Cold streak (L4+)
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="px-6 lg:px-12 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 text-sm text-[#F87171]">
            Failed to load: {error}
          </div>
        </div>
      )}

      {loading && (
        <section className="px-4 lg:px-12 py-8 lg:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
              <table className="w-full text-sm"><tbody>
                {Array.from({ length: 15 }).map((_, i) => <StandingsRowSkeleton key={"st-skel-" + i} />)}
              </tbody></table>
            </div>
          </div>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* DIVIDER */}
          <div className="px-4 lg:px-12">
            <div className="max-w-6xl mx-auto h-px divider-shimmer" />
          </div>

          {/* EAST */}
          <section className="px-4 lg:px-12 py-8 lg:py-16" data-reveal data-reveal-delay="1">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#5B8DEF] mb-2">
                  Eastern Conference
                </p>
                <h2 className="font-[family-name:var(--font-barlow)] font-black text-3xl lg:text-4xl tracking-[-0.03em] text-[#F5F5F7]">
                  The East.
                </h2>
              </div>
              <StandingsTable teams={teams} conference="East" />
            </div>
          </section>

          {/* DIVIDER */}
          <div className="px-4 lg:px-12">
            <div className="max-w-6xl mx-auto h-px divider-shimmer" />
          </div>

          {/* WEST */}
          <section className="px-4 lg:px-12 py-8 lg:py-16" data-reveal data-reveal-delay="2">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-2">
                  Western Conference
                </p>
                <h2 className="font-[family-name:var(--font-barlow)] font-black text-3xl lg:text-4xl tracking-[-0.03em] text-[#F5F5F7]">
                  The West.
                </h2>
              </div>
              <StandingsTable teams={teams} conference="West" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
