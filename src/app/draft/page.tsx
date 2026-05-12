"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { cn } from "@/lib/utils";

type DraftPick = {
  year: number;
  round: number;
  pick: number;
  playerName: string;
  teamAbbr: string;
  origin: string;
  originType: string;
};

const _TEAM_IDS: Record<string, number> = {
  ATL: 1610612737, BOS: 1610612738, BKN: 1610612751, CHA: 1610612766,
  CHI: 1610612741, CLE: 1610612739, DAL: 1610612742, DEN: 1610612743,
  DET: 1610612765, GSW: 1610612744, HOU: 1610612745, IND: 1610612754,
  LAC: 1610612746, LAL: 1610612747, MEM: 1610612763, MIA: 1610612748,
  MIL: 1610612749, MIN: 1610612750, NOP: 1610612740, NYK: 1610612752,
  OKC: 1610612760, ORL: 1610612753, PHI: 1610612755, PHX: 1610612756,
  POR: 1610612757, SAC: 1610612758, SAS: 1610612759, TOR: 1610612761,
  UTA: 1610612762, WAS: 1610612764,
};

const _TEAM_COLORS: Record<string, string> = {
  ATL: "#E03A3E", BOS: "#007A33", BKN: "#000000", CHA: "#1D1160",
  CHI: "#CE1141", CLE: "#860038", DAL: "#00538C", DEN: "#0E2240",
  DET: "#C8102E", GSW: "#1D428A", HOU: "#CE1141", IND: "#002D62",
  LAC: "#C8102E", LAL: "#552583", MEM: "#5D76A9", MIA: "#98002E",
  MIL: "#00471B", MIN: "#0C2340", NOP: "#0C2340", NYK: "#006BB6",
  OKC: "#007AC1", ORL: "#0077C0", PHI: "#006BB6", PHX: "#1D1160",
  POR: "#E03A3E", SAC: "#5A2D81", SAS: "#C4CED4", TOR: "#CE1141",
  UTA: "#002B5C", WAS: "#002B5C",
};

export default function DraftPage() {
  const [year, setYear] = useState(2025);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/draft/history?year=${year}`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) { setPicks(data); setError(null); }
        else { setError("Unexpected response"); }
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [year]);

  const top3 = picks.slice(0, 3);

  return (
    <div className="pb-24 lg:pb-12">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            NBA Draft
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            The class of<br />
            <span className="text-[#D4B560]">{year}.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            Round 1 picks, teams, and player origins.
          </p>

          {/* Year switcher */}
          <div className="inline-flex items-center gap-1 bg-[#1C1C24] border border-white/[0.05] rounded-full p-1 mt-8">
            {[2025].map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-all duration-300",
                  year === y ? "bg-[#F5F5F7] text-[#0A0A0E]" : "text-[#8A8A93] hover:text-[#F5F5F7]"
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-6 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* TOP 3 spotlight */}
      {!loading && top3.length === 3 && (
        <section className="px-6 lg:px-12 py-16 lg:py-20" data-reveal data-reveal-delay="1">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-2">Top 3</p>
              <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
                The headliners.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map(p => {
                const color = _TEAM_COLORS[p.teamAbbr] ?? "#D4B560";
                return (
                  <Link
                    key={p.pick}
                    href={`/teams/${p.teamAbbr.toLowerCase()}`}
                    className="floating-card group block rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-6 transition-all duration-500 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-[family-name:var(--font-barlow)] font-black text-7xl tabular-nums tracking-[-0.04em] text-[#D4B560]">
                        #{p.pick}
                      </span>
                      <TeamLogo teamId={_TEAM_IDS[p.teamAbbr]} abbreviation={p.teamAbbr} primaryColor={color} size="md" />
                    </div>
                    <p className="font-[family-name:var(--font-barlow)] font-bold text-2xl text-[#F5F5F7] tracking-tight leading-tight mb-2 group-hover:text-[#D4B560] transition-colors">
                      {p.playerName}
                    </p>
                    <p className="text-xs text-[#8A8A93] tracking-wide">{p.origin} · {p.originType}</p>
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

      {/* FULL DRAFT */}
      <section className="px-6 lg:px-12 py-12 lg:py-16" data-reveal data-reveal-delay="2">
        <div className="max-w-6xl mx-auto">

          <div className="mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">Round 1</p>
            <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
              All 30 picks.
            </h2>
          </div>

          {/* 2026 Draft notice */}
          <div className="mb-8 rounded-3xl border border-[#D4B560]/15 bg-gradient-to-br from-[#D4B560]/10 via-[#1C1C24] to-[#131318] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4B560] mb-2">
              Coming Up
            </p>
            <p className="font-[family-name:var(--font-barlow)] font-bold text-xl text-[#F5F5F7] tracking-tight mb-1">
              2026 NBA Draft Lottery — May 10
            </p>
            <p className="text-sm text-[#8A8A93] tracking-wide">
              The 2026 NBA Draft Lottery is today. Full draft results coming in June.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 mb-6 text-sm text-[#F87171]">
              Failed to load: {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-16 text-[#8A8A93]">Loading draft picks…</div>
          )}

          {!loading && !error && (
            <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76] w-20">Pick</th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Team</th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Player</th>
                    <th className="text-left px-4 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Origin</th>
                    <th className="text-left px-4 py-4 pr-6 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {picks.map(p => {
                    const color = _TEAM_COLORS[p.teamAbbr] ?? "#8A8A93";
                    return (
                      <tr key={`${p.year}-${p.pick}`} className="border-b border-white/[0.03] last:border-b-0 group">
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center justify-center h-8 w-8 rounded-xl text-xs font-black tabular-nums",
                            p.pick <= 3 ? "bg-[#D4B560]/10 text-[#D4B560] border border-[#D4B560]/30" :
                            p.pick <= 14 ? "bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/20" :
                            "bg-white/[0.04] text-[#8A8A93]"
                          )}>
                            {p.pick}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/teams/${p.teamAbbr.toLowerCase()}`} className="flex items-center gap-2 transition-colors">
                            <TeamLogo teamId={_TEAM_IDS[p.teamAbbr]} abbreviation={p.teamAbbr} primaryColor={color} size="sm" />
                          </Link>
                        </td>
                        <td className="px-4 py-4 font-semibold text-[#F5F5F7] tracking-tight">{p.playerName}</td>
                        <td className="px-4 py-4 text-xs text-[#8A8A93] tracking-wide">{p.origin}</td>
                        <td className="px-4 py-4 pr-6">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full border",
                            p.originType === "International"
                              ? "text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/20"
                              : "text-[#8A8A93] bg-white/[0.04] border-white/[0.06]"
                          )}>
                            {p.originType}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#D4B560]" /> Top 3
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" /> Lottery (1–14)
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
