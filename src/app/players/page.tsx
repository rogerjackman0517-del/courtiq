"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerRowSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
        align === "right" && "ml-auto",
        active ? "text-[#D4B560]" : "text-[#6E6E76] hover:text-[#F5F5F7]"
      )}
    >
      {label}
      {active ? (
        dir === "desc" ? <ArrowDown size={10} strokeWidth={2.5} /> : <ArrowUp size={10} strokeWidth={2.5} />
      ) : <ArrowUpDown size={10} strokeWidth={2} className="opacity-40" />}
    </button>
  );
}

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("pts");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      return !q || p.fullName.toLowerCase().includes(q) || p.teamAbbr.toLowerCase().includes(q);
    });
    return [...filtered].sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc" ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName);
      }
      const av = (a as unknown as Record<string, number>)[sortKey] ?? 0;
      const bv = (b as unknown as Record<string, number>)[sortKey] ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [players, query, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  return (
    <div className="pb-24 lg:pb-12">
      {/* Hero header */}
      <section className="px-6 lg:px-12 pt-16 lg:pt-20 pb-10" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-3">
            Database
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            Every player.<br />
            <span className="text-[#D4B560]">Every stat.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            {loading ? "Loading the league…" : `${rows.length} players in the 2025-26 season.`}
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-12" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto">

          {/* Search */}
          <div className="flex items-center gap-3 bg-[#1C1C24] border border-white/[0.05] rounded-2xl px-5 py-3 mb-6 max-w-md transition-all hover:border-white/[0.1] focus-within:border-[#D4B560]/40">
            <Search size={16} className="text-[#6E6E76] shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by name or team..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#6E6E76] outline-none tracking-tight"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[10px] text-[#6E6E76] hover:text-[#F5F5F7] uppercase tracking-wider font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-4 mb-6 text-sm text-[#F87171]">
              Failed to load: {error}
            </div>
          )}

          {/* Table card */}
          <div className="floating-card rounded-3xl bg-gradient-to-br from-[#1C1C24] to-[#131318] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-4 w-12 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6E6E76]">#</th>
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
                  {loading && Array.from({ length: 10 }).map((_, i) => <PlayerRowSkeleton key={`skel-${i}`} />)}
                  {!loading && rows.length === 0 && !error && (
                    <tr><td colSpan={11} className="px-5 py-16 text-center text-[#6E6E76] text-sm">No players match &ldquo;{query}&rdquo;.</td></tr>
                  )}
                  {rows.map((p, i) => (
                    <tr key={p.id} className="border-b border-white/[0.03] last:border-b-0 group">
                      <td className="px-5 py-3.5 text-[#6E6E76] text-xs tabular-nums">{i + 1}</td>
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
                      <td className="px-5 py-3.5 text-right text-[#8A8A93] text-xs tabular-nums">{p.gp}</td>
                      <td className="px-5 py-3.5 text-right text-[#8A8A93] text-xs tabular-nums">{p.min.toFixed(1)}</td>
                      <td className={cn("px-5 py-3.5 text-right font-[family-name:var(--font-barlow)] font-bold text-base tabular-nums", sortKey === "pts" ? "text-[#D4B560]" : "text-[#F5F5F7]")}>{p.pts.toFixed(1)}</td>
                      <td className={cn("px-5 py-3.5 text-right font-[family-name:var(--font-barlow)] font-bold text-base tabular-nums", sortKey === "reb" ? "text-[#D4B560]" : "text-[#F5F5F7]")}>{p.reb.toFixed(1)}</td>
                      <td className={cn("px-5 py-3.5 text-right font-[family-name:var(--font-barlow)] font-bold text-base tabular-nums", sortKey === "ast" ? "text-[#D4B560]" : "text-[#F5F5F7]")}>{p.ast.toFixed(1)}</td>
                      <td className={cn("px-5 py-3.5 text-right tabular-nums text-sm", sortKey === "fgPct" ? "text-[#D4B560] font-bold" : "text-[#F5F5F7]")}>{(p.fgPct * 100).toFixed(1)}%</td>
                      <td className={cn("px-5 py-3.5 text-right tabular-nums text-sm", sortKey === "fg3Pct" ? "text-[#D4B560] font-bold" : "text-[#8A8A93]")}>{(p.fg3Pct * 100).toFixed(1)}%</td>
                      <td className={cn("px-5 py-3.5 pr-6 text-right tabular-nums text-sm", sortKey === "ftPct" ? "text-[#D4B560] font-bold" : "text-[#8A8A93]")}>{(p.ftPct * 100).toFixed(1)}%</td>
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
