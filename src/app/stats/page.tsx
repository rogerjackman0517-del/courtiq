"use client";

import { useEffect, useState, useMemo } from "react";
import { PlayerRowSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Search, X } from "lucide-react";

type PlayerRow = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  teamId?: number;
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

type ColDef = { key: keyof PlayerRow; label: string; decimals: number; pct?: boolean };

const COLS: ColDef[] = [
  { key: "pts",    label: "PPG", decimals: 1 },
  { key: "reb",    label: "RPG", decimals: 1 },
  { key: "ast",    label: "APG", decimals: 1 },
  { key: "stl",    label: "SPG", decimals: 1 },
  { key: "blk",    label: "BPG", decimals: 1 },
  { key: "min",    label: "MIN", decimals: 1 },
  { key: "fgPct",  label: "FG%", decimals: 3, pct: true },
  { key: "fg3Pct", label: "3P%", decimals: 3, pct: true },
  { key: "ftPct",  label: "FT%", decimals: 3, pct: true },
];

export default function StatsPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof PlayerRow>("pts");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/players/with-stats")
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) { setPlayers(data); setError(null); }
        else { setError("Unexpected response"); }
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    const filtered = query
      ? players.filter(p =>
          p.fullName.toLowerCase().includes(query.toLowerCase()) ||
          p.teamAbbr.toLowerCase().includes(query.toLowerCase()))
      : players;
    return [...filtered].sort((a, b) => {
      const av = (a[sortKey] as number) ?? 0;
      const bv = (b[sortKey] as number) ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [players, sortKey, sortDir, query]);

  function handleSort(key: keyof PlayerRow) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function formatVal(val: number, col: ColDef): string {
    if (col.pct) return (val * 100).toFixed(1) + "%";
    return val.toFixed(col.decimals);
  }

  const activeCol = COLS.find(c => c.key === sortKey);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            Leaderboard
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            Who&apos;s leading<br />
            <span className="text-[#D4B560]">the league?</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            {loading ? "Loading…" : `Top ${rows.length} players sorted by ${activeCol?.label ?? "PPG"}.`}
          </p>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <section className="px-4 lg:px-12 py-8 lg:py-16" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">

          {/* Sort pills */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-3">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {COLS.map(col => (
                <button
                  key={col.key as string}
                  onClick={() => { setSortKey(col.key); setSortDir("desc"); }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-300",
                    sortKey === col.key
                      ? "bg-[#F5F5F7] text-[#0A0A0E]"
                      : "bg-[#1C1C24] border border-white/[0.05] text-[#8A8A93] hover:text-[#F5F5F7] hover:border-white/[0.1]"
                  )}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-[#1C1C24] border border-white/[0.05] rounded-2xl px-5 py-3 mb-8 max-w-md transition-all hover:border-white/[0.1] focus-within:border-[#D4B560]/40">
            <Search size={16} className="text-[#6E6E76] shrink-0" strokeWidth={2} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search player or team..."
              className="flex-1 bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#6E6E76] outline-none tracking-tight"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[#6E6E76] hover:text-[#F5F5F7]"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 mb-6 text-sm text-[#F87171]">
              Failed to load: {error}
            </div>
          )}

          {/* Table */}
          <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-4 w-12 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">#</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Player</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Team</th>
                    <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">GP</th>
                    {COLS.map(col => (
                      <th key={col.key as string} className={cn("text-right px-3 py-4", COLS[COLS.length - 1].key === col.key && "pr-6")}>
                        <button
                          onClick={() => handleSort(col.key)}
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                            sortKey === col.key ? "text-[#D4B560]" : "text-[#6E6E76] hover:text-[#F5F5F7]"
                          )}
                        >
                          {col.label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 10 }).map((_, i) => <PlayerRowSkeleton key={"stat-skel-" + i} />)}
                  {!loading && rows.length === 0 && !error && (
                    <tr><td colSpan={4 + COLS.length} className="px-5 py-16 text-center text-[#6E6E76] text-sm">No players found.</td></tr>
                  )}
                  {rows.map((p, i) => (
                    <tr key={p.id} className="border-b border-white/[0.03] last:border-b-0 group">
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "font-[family-name:var(--font-barlow)] font-black text-xs tabular-nums",
                          i === 0 ? "text-[#D4B560]" : "text-[#6E6E76]"
                        )}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/players/${p.slug}`} className="flex items-center gap-3 group/name">
                          <PlayerAvatar playerId={p.id} fullName={p.fullName} size="sm" />
                          <span className="font-semibold text-[#F5F5F7] group-hover:text-[#D4B560] tracking-tight transition-colors">{p.fullName}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/teams/${p.teamAbbr.toLowerCase()}`} className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                          <TeamLogo teamId={p.teamId} abbreviation={p.teamAbbr} size="xs" />
                          <span className="text-xs font-bold text-[#8A8A93] tracking-wide">{p.teamAbbr}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 text-right text-xs text-[#8A8A93] tabular-nums">{p.gp}</td>
                      {COLS.map(col => {
                        const isActive = sortKey === col.key;
                        return (
                          <td key={col.key as string} className={cn(
                            "px-3 py-3.5 text-right font-[family-name:var(--font-barlow)] font-bold tabular-nums",
                            COLS[COLS.length - 1].key === col.key && "pr-6",
                            isActive ? "text-[#D4B560]" : "text-[#F5F5F7]"
                          )}>
                            {formatVal(p[col.key] as number, col)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
