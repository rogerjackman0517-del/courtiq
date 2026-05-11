"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

function TeamCard({ team }: { team: TeamRow }) {
  const totalGames = team.wins + team.losses;
  const winPctDisplay = totalGames > 0 ? Math.round((team.wins / totalGames) * 100) : 0;
  const streakUp = team.streak?.startsWith("W");
  const playoffTier = team.confRank <= 6 ? "Playoffs" : team.confRank <= 10 ? "Play-in" : "Lottery";

  return (
    <Link
      href={`/teams/${team.slug}`}
      className="floating-card group block rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.02]"
    >
      {/* Top — team badge + record */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center text-xs font-black tracking-tight"
            style={{
              backgroundColor: team.primaryColor + "22",
              border: `1px solid ${team.primaryColor}44`,
              color: team.primaryColor,
            }}
          >
            {team.abbreviation}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76] mb-0.5">
              #{team.confRank} {team.conference}
            </p>
            <p className="font-[family-name:var(--font-barlow)] font-bold text-lg text-[#F5F5F7] tracking-tight leading-tight group-hover:text-[#D4B560] transition-colors">
              {team.city} {team.name}
            </p>
          </div>
        </div>
      </div>

      {/* Big record */}
      <div className="mb-5">
        <p className="font-[family-name:var(--font-barlow)] font-black text-5xl tabular-nums tracking-[-0.04em] text-[#F5F5F7]">
          {team.wins}<span className="text-[#3A3A42]">–{team.losses}</span>
        </p>
        <p className="text-[11px] text-[#8A8A93] tracking-wide mt-1">{winPctDisplay}% · {playoffTier}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${winPctDisplay}%`, backgroundColor: team.primaryColor }}
        />
      </div>

      {/* Bottom strip */}
      <div className="flex items-center justify-between text-[10px] tracking-wide">
        <span className="text-[#6E6E76] font-medium">L10: {team.l10 || "—"}</span>
        <span className={cn(
          "font-bold px-2 py-0.5 rounded-full",
          streakUp
            ? "text-[#34D399] bg-[#34D399]/10"
            : team.streak.startsWith("L")
              ? "text-[#F87171] bg-[#F87171]/10"
              : "text-[#6E6E76] bg-white/[0.04]"
        )}>
          {team.streak || "—"}
        </span>
      </div>
    </Link>
  );
}

export default function TeamsPage() {
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

  const east = teams.filter(t => t.conference === "East").sort((a, b) => (a.confRank || 99) - (b.confRank || 99));
  const west = teams.filter(t => t.conference === "West").sort((a, b) => (a.confRank || 99) - (b.confRank || 99));

  return (
    <div className="pb-24 lg:pb-12">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            Teams
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            All 30 teams.<br />
            <span className="text-[#D4B560]">2025-26 season.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            Current records, win streaks, and playoff positioning.
          </p>
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
        <div className="px-6 lg:px-12 py-16 text-center text-[#8A8A93]">Loading team data…</div>
      )}

      {!loading && !error && (
        <>
          {/* DIVIDER */}
          <div className="px-6 lg:px-12">
            <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* EAST */}
          <section className="px-6 lg:px-12 py-16 lg:py-20" data-reveal data-reveal-delay="1">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#5B8DEF] mb-2">
                  Eastern Conference
                </p>
                <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
                  The East.
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {east.map(t => <TeamCard key={t.id} team={t} />)}
              </div>
            </div>
          </section>

          {/* DIVIDER */}
          <div className="px-6 lg:px-12">
            <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* WEST */}
          <section className="px-6 lg:px-12 py-16 lg:py-20" data-reveal data-reveal-delay="2">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-2">
                  Western Conference
                </p>
                <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
                  The West.
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {west.map(t => <TeamCard key={t.id} team={t} />)}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
