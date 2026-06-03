"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { Sparkline } from "@/components/players/Sparkline";
import { PlayerHoverCard } from "@/components/players/PlayerHoverCard";
import { usePinnedPlayers } from "@/lib/usePinnedPlayers";
import { Star, Users } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerRowSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Rows3, Rows4, X, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchHotkey } from "@/components/ui/Toast";
import { useInjuryMap } from "@/lib/useInjuryMap";
import { TEAM_COLORS } from "@/lib/teamColors";

type SortKey = "name" | "pts" | "reb" | "ast" | "fgPct" | "fg3Pct" | "ftPct" | "min";
type SortDir = "asc" | "desc";

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
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  min: number;
  gp: number;
};

const STAT_HINTS: Record<string, string> = {
  MIN: "Minutes per game",
  PPG: "Points per game",
  RPG: "Rebounds per game",
  APG: "Assists per game",
  "FG%": "Field goal percentage",
  "3P%": "Three-point percentage",
  "FT%": "Free throw percentage",
};

function SortHeader({
  label, sortKey, current, dir, onSort, align = "right"
}: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void; align?: "left" | "right";
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      title={STAT_HINTS[label]}
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors cursor-help",
        align === "right" && "ml-auto",
        active ? "text-[#D4B560] [text-shadow:0_0_12px_rgba(212,181,96,0.4)]" : "text-[#6E6E76] hover:text-[#F5F5F7]"
      )}
    >
      {label}
      {active ? (
        dir === "desc" ? <ArrowDown size={10} strokeWidth={2.5} /> : <ArrowUp size={10} strokeWidth={2.5} />
      ) : <ArrowUpDown size={10} strokeWidth={2} className="opacity-40" />}
    </button>
  );
}

// Top-3 rank badge colours
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className="font-[family-name:var(--font-barlow)] font-black text-sm tabular-nums text-[#D4B560]">1</span>
  );
  if (rank === 2) return (
    <span className="font-[family-name:var(--font-barlow)] font-black text-sm tabular-nums text-[#A8A8A8]">2</span>
  );
  if (rank === 3) return (
    <span className="font-[family-name:var(--font-barlow)] font-black text-sm tabular-nums text-[#B07840]">3</span>
  );
  return <span className="text-xs tabular-nums text-[#4A4A52]">{rank}</span>;
}

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("pts");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dense, setDense] = useState(false);
  const [posFilter, setPosFilter] = useState<"All" | "G" | "F" | "C">("All");
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchHotkey(searchInputRef);
  const { isPinned, toggle: togglePin } = usePinnedPlayers();
  const injuryMap = useInjuryMap();
  const router = useRouter();

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
    const filtered = players.filter(p => {
      const q = query.toLowerCase().trim();
      const matchQuery = !q || p.fullName.toLowerCase().includes(q) || p.teamAbbr.toLowerCase().includes(q);
      const pos = p.position ?? "—";
      const matchPos =
        posFilter === "All" ||
        (posFilter === "G" && pos.startsWith("G")) ||
        (posFilter === "F" && pos.startsWith("F")) ||
        (posFilter === "C" && (pos === "C" || pos === "F-C"));
      return matchQuery && matchPos;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc" ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName);
      }
      const av = (a as unknown as Record<string, number>)[sortKey] ?? 0;
      const bv = (b as unknown as Record<string, number>)[sortKey] ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return sorted.sort((a, b) => {
      const aPin = isPinned(a.slug) ? 1 : 0;
      const bPin = isPinned(b.slug) ? 1 : 0;
      return bPin - aPin;
    });
  }, [players, query, sortKey, sortDir, isPinned]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">

      {/* ── HERO ── */}
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-20 pb-10" data-reveal>
        <div className="max-w-6xl mx-auto">
          {/* Icon + eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl bg-[#D4B560]/10">
              <Users size={18} className="text-[#D4B560]" />
            </div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4B560]">
              Player Database
            </p>
          </div>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] text-shine mb-4 leading-[0.95]">
            Every player.<br />
            <span className="text-[#D4B560]" style={{ WebkitTextFillColor: "#D4B560" }}>Every stat.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            {loading ? "Loading the league…" : `${players.length} players in the 2025-26 season.`}
          </p>
          {/* Count pills */}
          {!loading && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4B560]/10 border border-[#D4B560]/20 text-[#D4B560] text-xs font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4B560]" />{players.length} Players
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8A8A93] text-xs font-bold">
                30 Teams
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8A8A93] text-xs font-bold">
                7 Stats
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="px-4 lg:px-12">
        <div className="max-w-6xl mx-auto h-px divider-shimmer" />
      </div>

      {/* ── CONTROLS + TABLE ── */}
      <section className="px-4 lg:px-12 py-8 lg:py-12" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">

          {/* Search + density toggle */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3 bg-[#1C1C24] border border-white/[0.05] rounded-2xl px-5 py-3.5 max-w-md flex-1 min-w-[260px] transition-all hover:border-white/[0.1] focus-within:border-[#D4B560]/40">
              <Search size={15} className="text-[#6E6E76] shrink-0" strokeWidth={2} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or team..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#6E6E76] outline-none tracking-tight"
              />
              {!query && (
                <kbd className="hidden sm:inline-flex items-center text-[10px] text-[#6E6E76] border border-white/[0.08] rounded px-1.5 py-0.5 font-mono">/</kbd>
              )}
              {query && (
                <button onClick={() => setQuery("")} className="text-[#6E6E76] hover:text-[#F5F5F7] transition-colors no-jiggle">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (players.length === 0) return;
                const random = players[Math.floor(Math.random() * players.length)];
                router.push(`/players/${random.slug}`);
              }}
              className="ripple no-jiggle inline-flex items-center gap-1.5 rounded-2xl border border-white/[0.05] bg-[#1C1C24] px-4 py-3 text-xs font-semibold text-[#8A8A93] hover:text-[#D4B560] hover:border-[#D4B560]/30 transition-colors"
              title="Open a random player"
            >
              <Shuffle size={13} />
              Random
            </button>
            <div className="inline-flex items-center rounded-2xl border border-white/[0.05] bg-[#1C1C24] p-1">
              <button
                type="button"
                onClick={() => setDense(false)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  !dense ? "bg-white/[0.08] text-[#F5F5F7]" : "text-[#6E6E76] hover:text-[#F5F5F7]"
                )}
                aria-label="Comfortable density"
                title="Comfortable density"
              >
                <Rows3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDense(true)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  dense ? "bg-white/[0.08] text-[#F5F5F7]" : "text-[#6E6E76] hover:text-[#F5F5F7]"
                )}
                aria-label="Compact density"
                title="Compact density"
              >
                <Rows4 size={15} />
              </button>
            </div>
          </div>

          {/* Position filter pills */}
          {!loading && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mr-1">Position</span>
              {(["All", "G", "F", "C"] as const).map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosFilter(pos)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200",
                    posFilter === pos
                      ? "bg-[#D4B560] text-[#0A0A0E] shadow-[0_0_12px_rgba(212,181,96,0.3)]"
                      : "bg-[#1C1C24] border border-white/[0.06] text-[#8A8A93] hover:text-[#F5F5F7] hover:border-white/[0.12]"
                  )}
                >
                  {pos === "All" ? "All" : pos === "G" ? "Guards" : pos === "F" ? "Forwards" : "Centers"}
                </button>
              ))}
              {posFilter !== "All" && (
                <span className="text-[10px] text-[#6E6E76] ml-1 tabular-nums">
                  {rows.length} result{rows.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 mb-6 text-sm text-[#F87171]">
              Failed to load: {error}
            </div>
          )}

          {/* Active filter chips */}
          {(query || sortKey !== "pts" || sortDir !== "desc") && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">Filters</span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#D4B560]/10 border border-[#D4B560]/25 text-[#D4B560] px-2.5 py-1 text-xs hover:bg-[#D4B560]/15 transition-colors no-jiggle"
                >
                  &ldquo;{query}&rdquo; <X size={11} />
                </button>
              )}
              {(sortKey !== "pts" || sortDir !== "desc") && (
                <button
                  type="button"
                  onClick={() => { setSortKey("pts"); setSortDir("desc"); }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#F5F5F7] px-2.5 py-1 text-xs hover:bg-white/[0.08] transition-colors no-jiggle"
                >
                  Sorted by {sortKey.toUpperCase()} {sortDir === "desc" ? "↓" : "↑"} <X size={11} />
                </button>
              )}
            </div>
          )}

          {/* ── Table card ── */}
          <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
            <div className="overflow-x-auto">
              <table className={cn("w-full text-sm", dense && "table-dense")}>
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-4 w-14 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">#</th>
                    <th className="text-left px-5 py-4">
                      <SortHeader label="Player" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} align="left" />
                    </th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">Team</th>
                    <th className="text-right px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">GP</th>
                    <th className="text-right px-5 py-4">
                      <SortHeader label="MIN" sortKey="min" current={sortKey} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-right px-5 py-4">
                      <SortHeader label="PPG" sortKey="pts" current={sortKey} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-center px-3 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">
                      Trend
                    </th>
                    <th className="text-right px-5 py-4">
                      <SortHeader label="RPG" sortKey="reb" current={sortKey} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-right px-5 py-4">
                      <SortHeader label="APG" sortKey="ast" current={sortKey} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-right px-5 py-4">
                      <SortHeader label="FG%" sortKey="fgPct" current={sortKey} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-right px-5 py-4">
                      <SortHeader label="3P%" sortKey="fg3Pct" current={sortKey} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-right px-5 py-4 pr-6">
                      <SortHeader label="FT%" sortKey="ftPct" current={sortKey} dir={sortDir} onSort={handleSort} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 12 }).map((_, i) => <PlayerRowSkeleton key={`skel-${i}`} />)}
                  {!loading && rows.length === 0 && !error && (
                    <tr><td colSpan={12} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg viewBox="0 0 24 24" className="h-10 w-10 opacity-20" fill="none" stroke="#D4B560" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="11" cy="11" r="7" />
                          <path d="M16.5 16.5 L21 21" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                        <p className="text-sm text-[#8A8A93] font-medium">No players match &ldquo;{query}&rdquo;</p>
                        <p className="text-xs text-[#6E6E76]">Try a different name or position filter</p>
                      </div>
                    </td></tr>
                  )}
                  {rows.map((p, i) => {
                    const rank = i + 1;
                    const isPinned_ = isPinned(p.slug);
                    return (
                      <tr
                        key={p.id}
                        className={cn(
                          "stat-row border-b border-white/[0.03] last:border-b-0 group",
                          i < 20 && "row-reveal"
                        )}
                        style={
                          i < 20
                            ? { animationDelay: `${i * 18}ms`, ["--stat-row-color" as string]: TEAM_COLORS[p.teamAbbr] ?? "#D4B560" }
                            : { ["--stat-row-color" as string]: TEAM_COLORS[p.teamAbbr] ?? "#D4B560" }
                        }
                      >
                        {/* Rank + pin */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 w-10">
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(p.slug); }}
                              className="no-jiggle shrink-0"
                              aria-label={isPinned_ ? `Unpin ${p.fullName}` : `Pin ${p.fullName}`}
                              title={isPinned_ ? "Unpin" : "Pin to top"}
                            >
                              <Star
                                size={12}
                                className={cn(
                                  "transition-colors",
                                  isPinned_ ? "text-[#D4B560] fill-[#D4B560]" : "text-[#3A3A42] hover:text-[#D4B560]"
                                )}
                                fill={isPinned_ ? "currentColor" : "none"}
                              />
                            </button>
                            <RankBadge rank={rank} />
                          </div>
                        </td>

                        {/* Player name + avatar */}
                        <td className="px-5 py-4">
                          <PlayerHoverCard slug={p.slug}>
                            <Link href={`/players/${p.slug}`} className="flex items-center gap-3 group/name">
                              <PlayerAvatar playerId={p.id} fullName={p.fullName} size="sm" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-[#F5F5F7] group-hover/name:text-[#D4B560] tracking-tight transition-colors">
                                    {p.fullName}
                                  </span>
                                  {p.position && p.position !== "—" && (
                                    <span className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-white/[0.05] text-[#6E6E76]">
                                      {p.position}
                                    </span>
                                  )}
                                </div>
                                {(() => {
                                  const status = injuryMap[p.fullName.toLowerCase()];
                                  if (!status || status === "Probable" || status === "Available") return null;
                                  const color = status === "Out" || status === "Doubtful" ? "#F87171" : "#F59E0B";
                                  return (
                                    <span className="block text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color }}>
                                      {status}
                                    </span>
                                  );
                                })()}
                              </div>
                            </Link>
                          </PlayerHoverCard>
                        </td>

                        {/* Team */}
                        <td className="px-5 py-4">
                          <Link href={`/teams/${p.teamAbbr.toLowerCase()}`} className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <TeamLogo teamId={p.teamId} abbreviation={p.teamAbbr} size="xs" />
                            <span className="text-xs font-bold text-[#8A8A93] tracking-wide">{p.teamAbbr}</span>
                          </Link>
                        </td>

                        {/* GP */}
                        <td className="px-5 py-4 text-right text-[#6E6E76] text-xs tabular-nums">{p.gp}</td>

                        {/* MIN */}
                        <td className={cn(
                          "px-5 py-4 text-right text-xs tabular-nums",
                          sortKey === "min" ? "text-[#D4B560] font-semibold" : "text-[#8A8A93]"
                        )}>{p.min.toFixed(1)}</td>

                        {/* PPG */}
                        <td className={cn(
                          "px-5 py-4 text-right font-[family-name:var(--font-barlow)] font-bold text-base tabular-nums",
                          sortKey === "pts" ? "text-[#D4B560]" : "text-[#F5F5F7]"
                        )}>{p.pts.toFixed(1)}</td>

                        {/* Sparkline */}
                        <td className="px-3 py-4">
                          <div className="flex items-center justify-center">
                            <Sparkline seed={p.id} average={p.pts} />
                          </div>
                        </td>

                        {/* RPG */}
                        <td className={cn(
                          "px-5 py-4 text-right font-[family-name:var(--font-barlow)] font-bold text-base tabular-nums",
                          sortKey === "reb" ? "text-[#D4B560]" : "text-[#F5F5F7]"
                        )}>{p.reb.toFixed(1)}</td>

                        {/* APG */}
                        <td className={cn(
                          "px-5 py-4 text-right font-[family-name:var(--font-barlow)] font-bold text-base tabular-nums",
                          sortKey === "ast" ? "text-[#D4B560]" : "text-[#F5F5F7]"
                        )}>{p.ast.toFixed(1)}</td>

                        {/* FG% */}
                        <td className={cn(
                          "px-5 py-4 text-right tabular-nums text-sm",
                          sortKey === "fgPct" ? "text-[#D4B560] font-bold" : "text-[#F5F5F7]"
                        )}>{(p.fgPct * 100).toFixed(1)}%</td>

                        {/* 3P% */}
                        <td className={cn(
                          "px-5 py-4 text-right tabular-nums text-sm",
                          sortKey === "fg3Pct" ? "text-[#D4B560] font-bold" : "text-[#8A8A93]"
                        )}>{(p.fg3Pct * 100).toFixed(1)}%</td>

                        {/* FT% */}
                        <td className={cn(
                          "px-5 py-4 pr-6 text-right tabular-nums text-sm",
                          sortKey === "ftPct" ? "text-[#D4B560] font-bold" : "text-[#8A8A93]"
                        )}>{(p.ftPct * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && rows.length > 0 && (
            <p className="text-xs text-[#4A4A52] mt-4 text-right tabular-nums tracking-wide">
              {rows.length} player{rows.length !== 1 ? "s" : ""} shown
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
