"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { StandingsRowSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

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

function StandingsTable({ teams, conference, accent }: { teams: TeamRow[]; conference: "East" | "West"; accent: string }) {
  const sorted = teams
    .filter(t => t.conference === conference)
    .sort((a, b) => b.winPct - a.winPct);

  const leaderWins = sorted[0]?.wins ?? 0;
  const leaderLosses = sorted[0]?.losses ?? 0;

  function gamesBehind(team: TeamRow): string {
    if (team === sorted[0]) return "—";
    const gb = ((leaderWins - team.wins) + (team.losses - leaderLosses)) / 2;
    return gb === 0 ? "—" : gb.toFixed(1);
  }

  return (
    <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left px-5 py-4 w-12 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">#</th>
            <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Team</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">W</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">L</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">PCT</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">GB</th>
            <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">L10</th>
            <th className="text-right px-3 py-4 pr-6 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">STRK</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => {
            const isPlayoff = i < 6;
            const isPlayIn = i >= 6 && i < 10;
            const streakUp = team.streak?.startsWith("W");
            return (
              <tr key={team.id} className={cn(
                "border-b border-white/[0.03] last:border-b-0 group",
                i === 5 && "border-b border-b-[#34D399]/20",
                i === 9 && "border-b border-b-[#F87171]/20",
              )}>
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
                  </Link>
                </td>
                <td className="px-3 py-4 text-right font-[family-name:var(--font-barlow)] font-bold text-base text-[#F5F5F7] tabular-nums">{team.wins}</td>
                <td className="px-3 py-4 text-right font-[family-name:var(--font-barlow)] font-bold text-base text-[#6E6E76] tabular-nums">{team.losses}</td>
                <td className="px-3 py-4 text-right text-[#F5F5F7] text-xs font-semibold tabular-nums">{team.winPct.toFixed(3)}</td>
                <td className="px-3 py-4 text-right text-[#8A8A93] text-xs tabular-nums">{gamesBehind(team)}</td>
                <td className="px-3 py-4 text-right text-[#8A8A93] text-xs tabular-nums">{team.l10 || "—"}</td>
                <td className="px-3 py-4 pr-6 text-right text-xs tabular-nums">
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full font-bold",
                    streakUp
                      ? "bg-[#34D399]/10 text-[#34D399]"
                      : team.streak?.startsWith("L")
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
    <div className="pb-24 lg:pb-12">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            Standings
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            The race to<br />
            <span className="text-[#D4B560]">the playoffs.</span>
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
            <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
              <StandingsTable teams={teams} conference="East" accent="#5B8DEF" />
            </div>
          </section>

          {/* DIVIDER */}
          <div className="px-4 lg:px-12">
            <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
              <StandingsTable teams={teams} conference="West" accent="#D4B560" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
