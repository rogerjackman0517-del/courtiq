"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useIsPro } from "@/lib/useIsPro";
import { ProPaywall } from "@/components/billing/ProPaywall";
import { Skeleton } from "@/components/ui/Skeleton";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Search, X, Users } from "lucide-react";

type Player = {
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
};

const SLOTS = 5;

function playerValue(p: Player): number {
  return (
    p.pts * 1.0 +
    p.reb * 1.2 +
    p.ast * 1.5 +
    p.stl * 3.0 +
    p.blk * 3.0 +
    (p.fgPct - 0.45) * 40 +
    (p.fg3Pct - 0.35) * 25
  );
}

export default function LineupExplorerPage() {
  const { isPro, loaded } = useIsPro();
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<(Player | null)[]>(Array(SLOTS).fill(null));
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/players/with-stats")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Player[]) => Array.isArray(d) && setPlayers(d))
      .catch(() => {});
  }, []);

  const totals = useMemo(() => {
    const picked = picks.filter((p): p is Player => p !== null);
    const sum = picked.reduce(
      (acc, p) => ({
        pts: acc.pts + p.pts,
        reb: acc.reb + p.reb,
        ast: acc.ast + p.ast,
        stl: acc.stl + p.stl,
        blk: acc.blk + p.blk,
        value: acc.value + playerValue(p),
      }),
      { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, value: 0 }
    );
    return { ...sum, count: picked.length };
  }, [picks]);

  const filtered = useMemo(() => {
    if (!query) return players.slice(0, 6);
    const q = query.toLowerCase();
    return players
      .filter((p) => p.fullName.toLowerCase().includes(q) || p.teamAbbr.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, players]);

  function fillFirstEmpty(p: Player) {
    setPicks((cur) => {
      if (cur.some((x) => x && x.id === p.id)) return cur;
      const next = [...cur];
      const idx = next.findIndex((x) => x === null);
      if (idx >= 0) next[idx] = p;
      return next;
    });
    setQuery("");
  }

  function clearSlot(i: number) {
    setPicks((cur) => {
      const next = [...cur];
      next[i] = null;
      return next;
    });
  }

  if (!loaded) {
    return (
      <div className="px-4 lg:px-12 pt-16 pb-24 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <ProPaywall
        title="Lineup Explorer"
        description="Build any 5-man lineup from across the NBA and see its projected impact."
        features={[
          "Pick from all 150 active players",
          "Combined team value, scoring, rebounding, playmaking",
          "Defensive impact (steals + blocks)",
          "Shooting efficiency overlay",
        ]}
      />
    );
  }

  // League-average reference: typical 5-man lineup totals roughly 90 PPG / 35 RPG / 25 APG.
  const avgValue = 175;
  const verdict =
    totals.count < 5
      ? `${totals.count} / 5 picked — keep going.`
      : totals.value > avgValue + 40
      ? "Elite. This lineup would terrify the league."
      : totals.value > avgValue + 15
      ? "Strong. Comfortably above league average."
      : totals.value > avgValue - 15
      ? "Average. Solid floor but not a contender."
      : "Below average. The bench would need to carry.";

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-20 pb-8" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Pro · Analytics · Lineup Explorer
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-6xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            Build a <span className="text-[#D4B560]">dream five.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            Pick any 5 players, see combined production and a projection of how the lineup would play.
          </p>
        </div>
      </section>

      <section className="px-4 lg:px-12 pb-16" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* LEFT — slots + search */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
              {picks.map((p, i) => (
                <div
                  key={i}
                  className={`floating-card rounded-2xl p-4 text-center min-h-[140px] flex flex-col items-center justify-center gap-2 ${p ? "" : "border-dashed border border-white/[0.08]"}`}
                >
                  {p ? (
                    <>
                      <PlayerAvatar playerId={p.id} fullName={p.fullName} size="md" />
                      <p className="text-xs font-bold text-[#F5F5F7] tracking-tight leading-tight">{p.fullName}</p>
                      <p className="text-[10px] text-[#6E6E76]">{p.teamAbbr} · {p.pts.toFixed(1)} PPG</p>
                      <button
                        type="button"
                        onClick={() => clearSlot(i)}
                        className="text-[#6E6E76] hover:text-[#F87171]"
                        aria-label="Remove"
                      >
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Users size={20} className="text-[#3A3A42]" />
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6E6E76]">Slot {i + 1}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="floating-card rounded-2xl bg-gradient-to-br from-[#1C1C24] to-[#131318] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search size={14} className="text-[#6E6E76]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search players to add..."
                  className="flex-1 bg-transparent outline-none text-sm text-[#F5F5F7] placeholder:text-[#6E6E76]"
                />
              </div>
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((p) => {
                  const already = picks.some((x) => x && x.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => !already && fillFirstEmpty(p)}
                      disabled={already || picks.every((x) => x !== null)}
                      className={`w-full flex items-center gap-3 py-2 text-left disabled:opacity-40 ${already ? "" : "hover:bg-white/[0.03] cursor-pointer rounded-md px-2"}`}
                    >
                      <PlayerAvatar playerId={p.id} fullName={p.fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F5F5F7] truncate">{p.fullName}</p>
                        <div className="flex items-center gap-1.5">
                          <TeamLogo teamId={p.teamId} abbreviation={p.teamAbbr} size="xs" />
                          <span className="text-[10px] text-[#6E6E76]">{p.teamAbbr}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#8A8A93] tabular-nums">
                        {p.pts.toFixed(1)}/{p.reb.toFixed(1)}/{p.ast.toFixed(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — totals + verdict */}
          <div className="space-y-4">
            <div className="floating-card rounded-2xl bg-gradient-to-br from-[#D4B560]/10 via-[#1C1C24] to-[#131318] p-5">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-3">
                Combined production
              </p>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                {[
                  { label: "PTS", v: totals.pts },
                  { label: "REB", v: totals.reb },
                  { label: "AST", v: totals.ast },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums text-[#F5F5F7]">
                      {s.v.toFixed(1)}
                    </p>
                    <p className="text-[9px] text-[#6E6E76] tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-white/[0.04]">
                <div>
                  <p className="font-[family-name:var(--font-barlow)] font-bold text-sm tabular-nums text-[#F5F5F7]">
                    {totals.stl.toFixed(1)} <span className="text-[#6E6E76]">STL</span>
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-barlow)] font-bold text-sm tabular-nums text-[#F5F5F7]">
                    {totals.blk.toFixed(1)} <span className="text-[#6E6E76]">BLK</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="floating-card rounded-2xl p-5">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-3">
                Lineup value
              </p>
              <p className="font-[family-name:var(--font-barlow)] font-black text-5xl tabular-nums text-[#F5F5F7] mb-2">
                {totals.value.toFixed(0)}
              </p>
              <p className="text-xs text-[#6E6E76] mb-3">
                League-average five-man: ~{avgValue}
              </p>
              <p className="text-sm text-[#F5F5F7] leading-relaxed">{verdict}</p>
            </div>

            <Link
              href="/analytics"
              className="block text-center text-xs text-[#8A8A93] hover:text-[#F5F5F7]"
            >
              ← All Pro tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
