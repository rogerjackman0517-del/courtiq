"use client";

import { useEffect, useState, useMemo } from "react";
import { PlayerRowSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { TEAM_COLORS } from "@/lib/teamColors";
import { StatLabel } from "@/components/ui/StatLabel";
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

type ExtendedRow = PlayerRow & {
  pts36: number; reb36: number; ast36: number; stl36: number; blk36: number;
  eff: number; stk: number;
};

// ColDef.key uses string so we can address both PlayerRow and computed fields
type ColDef = { key: string; label: string; decimals: number; pct?: boolean; tooltip?: string };

type TabMode = "per-game" | "per36" | "advanced";

const PER_GAME_COLS: ColDef[] = [
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

const PER36_COLS: ColDef[] = [
  { key: "pts36", label: "PTS", decimals: 1, tooltip: "Points per 36 min" },
  { key: "reb36", label: "REB", decimals: 1, tooltip: "Rebounds per 36 min" },
  { key: "ast36", label: "AST", decimals: 1, tooltip: "Assists per 36 min" },
  { key: "stl36", label: "STL", decimals: 1, tooltip: "Steals per 36 min" },
  { key: "blk36", label: "BLK", decimals: 1, tooltip: "Blocks per 36 min" },
  { key: "min",   label: "MIN", decimals: 1, tooltip: "Actual minutes per game" },
];

const ADVANCED_COLS: ColDef[] = [
  { key: "eff",    label: "EFF",  decimals: 1, tooltip: "PTS+REB+AST+STL+BLK (crude efficiency)" },
  { key: "stk",    label: "STK",  decimals: 1, tooltip: "Stocks: STL + BLK" },
  { key: "fgPct",  label: "FG%",  decimals: 3, pct: true },
  { key: "fg3Pct", label: "3P%",  decimals: 3, pct: true },
  { key: "ftPct",  label: "FT%",  decimals: 3, pct: true },
  { key: "min",    label: "MIN",  decimals: 1 },
];

// Back-compat alias so the rest of the file can still reference COLS
// (sort pills, formatVal, heatmap). Switched at runtime.
const COLS = PER_GAME_COLS;

export default function StatsPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("pts");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const [tabMode, setTabMode] = useState<TabMode>("per-game");

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

  // Derive active cols from tab mode
  const activeCols: ColDef[] = tabMode === "per36" ? PER36_COLS : tabMode === "advanced" ? ADVANCED_COLS : PER_GAME_COLS;

  // Base filtered + sorted rows (on raw PlayerRow first)
  const baseRows = useMemo(() => {
    const filtered = query
      ? players.filter(p =>
          p.fullName.toLowerCase().includes(query.toLowerCase()) ||
          p.teamAbbr.toLowerCase().includes(query.toLowerCase()))
      : players;
    return filtered;
  }, [players, query]);

  // Extended rows with computed fields
  const extendedRows = useMemo<ExtendedRow[]>(() =>
    baseRows.map(p => ({
      ...p,
      pts36: p.min > 0 ? (p.pts * 36) / p.min : 0,
      reb36: p.min > 0 ? (p.reb * 36) / p.min : 0,
      ast36: p.min > 0 ? (p.ast * 36) / p.min : 0,
      stl36: p.min > 0 ? (p.stl * 36) / p.min : 0,
      blk36: p.min > 0 ? (p.blk * 36) / p.min : 0,
      eff: p.pts + p.reb + p.ast + p.stl + p.blk,
      stk: p.stl + p.blk,
    })),
  [baseRows]);

  const rows = useMemo(() => {
    return [...extendedRows].sort((a, b) => {
      const av = ((a as Record<string, unknown>)[sortKey] as number) ?? 0;
      const bv = ((b as Record<string, unknown>)[sortKey] as number) ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [extendedRows, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function handleTabChange(mode: TabMode) {
    setTabMode(mode);
    // Reset sort to the first column of the new tab
    const newCols = mode === "per36" ? PER36_COLS : mode === "advanced" ? ADVANCED_COLS : PER_GAME_COLS;
    setSortKey(newCols[0].key);
    setSortDir("desc");
  }

  function formatVal(val: number, col: ColDef): string {
    if (col.pct) return (val * 100).toFixed(1) + "%";
    return val.toFixed(col.decimals);
  }

  /**
   * Per-column percentile map: for each stat column, rank every visible
   * player so we can tint each cell as a heatmap (top 10% gold, bottom 10%
   * blue, etc.). All COLS happen to be "higher is better".
   */
  const columnPercentiles = useMemo(() => {
    const result: Record<string, Map<number, number>> = {};
    if (rows.length === 0) return result;
    activeCols.forEach((col) => {
      const sorted = [...rows].sort(
        (a, b) => (((b as Record<string, unknown>)[col.key] as number) ?? 0) - (((a as Record<string, unknown>)[col.key] as number) ?? 0)
      );
      const map = new Map<number, number>();
      const max = Math.max(1, sorted.length - 1);
      sorted.forEach((p, i) => {
        map.set(p.id, 1 - i / max);
      });
      result[col.key] = map;
    });
    return result;
  }, [rows, activeCols]);

  function heatmapBg(pctile: number): string {
    if (pctile >= 0.90) return "rgba(212, 181, 96, 0.22)";    // top 10% — gold
    if (pctile >= 0.75) return "rgba(212, 181, 96, 0.10)";    // top 25% — warm
    if (pctile <= 0.10) return "rgba(91, 141, 239, 0.20)";    // bottom 10% — blue
    if (pctile <= 0.25) return "rgba(91, 141, 239, 0.08)";    // bottom 25% — cool
    return "transparent";
  }

  const activeCol = activeCols.find(c => c.key === sortKey);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* HERO */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-12" data-reveal>
<div className="max-w-6xl mx-auto relative">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Leaderboard
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            Who&apos;s leading<br />
            <span className="text-[#D4B560]">the league?</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            {loading ? "Loading player stats…" : `${rows.length} players ranked by ${activeCol?.label ?? "PPG"}.`}
          </p>
          {!loading && players.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4B560]/10 border border-[#D4B560]/20 text-[#D4B560] text-xs font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4B560]" />{players.length} Players
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8A8A93] text-xs font-bold">
                9 Stat Categories
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8A8A93] text-xs font-bold">
                Percentile heatmap
              </span>
            </div>
          )}
        </div>
      </section>

      {/* LEADER SPOTLIGHT — top player in 5 key categories */}
      {!loading && players.length > 0 && (() => {
        type Cat = { key: "pts" | "reb" | "ast" | "stl" | "blk"; label: string; stat: string; color: string };
        const categories: Cat[] = [
          { key: "pts", label: "Scoring",  stat: "PPG", color: "#D4B560" },
          { key: "reb", label: "Rebounds", stat: "RPG", color: "#5B8DEF" },
          { key: "ast", label: "Assists",  stat: "APG", color: "#34D399" },
          { key: "stl", label: "Steals",   stat: "SPG", color: "#A855F7" },
          { key: "blk", label: "Blocks",   stat: "BPG", color: "#F87171" },
        ];
        return (
          <section className="px-4 lg:px-12 pt-8 pb-6" data-reveal data-reveal-delay="1">
            <div className="max-w-6xl mx-auto">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4">League Leaders</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {categories.map(cat => {
                  const leader = [...players].sort((a, b) => b[cat.key] - a[cat.key])[0];
                  if (!leader) return null;
                  return (
                    <Link
                      key={cat.key}
                      href={`/players/${leader.slug}`}
                      className="floating-card group rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-4 hover:scale-[1.02] transition-transform duration-300 flex flex-col items-center gap-3 text-center"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: cat.color }}>
                          #1 {cat.stat}
                        </span>
                        <span className="text-[9px] font-medium text-[#6E6E76] uppercase tracking-wider">{cat.label}</span>
                      </div>
                      <PlayerAvatar playerId={leader.id} fullName={leader.fullName} size="lg" />
                      <div>
                        <p className="font-[family-name:var(--font-barlow)] font-black text-3xl tabular-nums tracking-tight" style={{ color: cat.color }}>
                          {leader[cat.key].toFixed(1)}
                        </p>
                        <p className="text-xs font-semibold text-[#F5F5F7] mt-0.5 truncate group-hover:text-[#D4B560] transition-colors">
                          {leader.fullName.split(" ").slice(-1)[0]}
                        </p>
                        <p className="text-[10px] text-[#6E6E76]">{leader.teamAbbr}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* DIVIDER */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px divider-shimmer" />
      </div>

      <section className="px-4 lg:px-12 py-8 lg:py-16" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">

          {/* Tab mode switcher */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-3">View</p>
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[#131318] border border-white/[0.06]">
              {(["per-game", "per36", "advanced"] as TabMode[]).map((mode) => {
                const label = mode === "per-game" ? "Per Game" : mode === "per36" ? "Per 36 Min" : "Advanced";
                const desc = mode === "per-game" ? "Season averages" : mode === "per36" ? "Scaled to 36 min" : "EFF · Stocks · Shooting";
                return (
                  <button
                    key={mode}
                    onClick={() => handleTabChange(mode)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 flex flex-col items-center",
                      tabMode === mode
                        ? "bg-[#F5F5F7] text-[#0A0A0E]"
                        : "text-[#8A8A93] hover:text-[#F5F5F7]"
                    )}
                    title={desc}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {tabMode === "per36" && (
              <p className="mt-3 text-xs text-[#6E6E76] max-w-md">
                Stats scaled to 36 minutes of play — useful for comparing players with different roles or injury-shortened seasons.
              </p>
            )}
            {tabMode === "advanced" && (
              <p className="mt-3 text-xs text-[#6E6E76] max-w-md">
                <strong className="text-[#8A8A93]">EFF</strong> = PTS+REB+AST+STL+BLK per game &nbsp;·&nbsp; <strong className="text-[#8A8A93]">STK</strong> = Stocks (STL+BLK)
              </p>
            )}
          </div>

          {/* Sort pills */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E6E76] mb-3">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {activeCols.map(col => (
                <button
                  key={col.key}
                  onClick={() => { setSortKey(col.key); setSortDir("desc"); }}
                  title={col.tooltip}
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

          {/* Heatmap legend */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] tracking-wider uppercase text-[#6E6E76]">
            <span>Heatmap:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "rgba(91, 141, 239, 0.20)" }} />
              Bottom 10%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "rgba(91, 141, 239, 0.08)" }} />
              Bottom 25%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "rgba(212, 181, 96, 0.10)" }} />
              Top 25%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded" style={{ background: "rgba(212, 181, 96, 0.22)" }} />
              Top 10%
            </span>
          </div>

          {error && (
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 mb-6 text-sm text-[#F87171]">
              Failed to load: {error}
            </div>
          )}

          {/* Table */}
          <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="sticky-thead w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-4 w-12 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">#</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Player</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Team</th>
                    <th className="text-right px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">
                      <StatLabel abbr="GP" />
                    </th>
                    {activeCols.map(col => (
                      <th key={col.key} className={cn("text-right px-3 py-4", activeCols[activeCols.length - 1].key === col.key && "pr-6")}>
                        <button
                          onClick={() => handleSort(col.key)}
                          title={col.tooltip}
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                            sortKey === col.key ? "text-[#D4B560]" : "text-[#6E6E76] hover:text-[#F5F5F7]"
                          )}
                        >
                          <StatLabel abbr={col.label} noHint />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 10 }).map((_, i) => <PlayerRowSkeleton key={"stat-skel-" + i} />)}
                  {!loading && rows.length === 0 && !error && (
                    <tr>
                      <td colSpan={4 + activeCols.length} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg viewBox="0 0 24 24" className="h-10 w-10 opacity-30" fill="none" stroke="#D4B560" strokeWidth="1.5" strokeLinecap="round">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M16.5 16.5 L21 21" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                          <p className="text-sm text-[#8A8A93] font-medium">No players found</p>
                          <p className="text-xs text-[#6E6E76]">Try adjusting filters or stat thresholds</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {rows.map((p, i) => (
                    <tr
                      key={p.id}
                      className="stat-row border-b border-white/[0.03] last:border-b-0 group"
                      style={{ ["--stat-row-color" as string]: TEAM_COLORS[p.teamAbbr] ?? "#D4B560" }}
                    >
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
                      {activeCols.map(col => {
                        const isActive = sortKey === col.key;
                        const pctile = columnPercentiles[col.key]?.get(p.id) ?? 0.5;
                        const val = ((p as Record<string, unknown>)[col.key] as number) ?? 0;
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              "px-3 py-3.5 text-right font-[family-name:var(--font-barlow)] font-bold tabular-nums transition-colors",
                              activeCols[activeCols.length - 1].key === col.key && "pr-6",
                              isActive ? "text-[#D4B560]" : "text-[#F5F5F7]"
                            )}
                            style={{ background: heatmapBg(pctile) }}
                          >
                            {formatVal(val, col)}
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
