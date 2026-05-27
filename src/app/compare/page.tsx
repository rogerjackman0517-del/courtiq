"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowLeftRight, Sparkles } from "lucide-react";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Skeleton } from "@/components/ui/Skeleton";

type Player = {
  id: number;
  fullName: string;
  slug: string;
  teamId: number;
  teamAbbr: string;
  position: string;
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

// Stats to compare. higherIsBetter=true means higher value is "winning".
const STAT_ROWS: { key: keyof Player; label: string; fmt: (n: number) => string; higherIsBetter: boolean }[] = [
  { key: "pts", label: "Points", fmt: (n) => n.toFixed(1), higherIsBetter: true },
  { key: "reb", label: "Rebounds", fmt: (n) => n.toFixed(1), higherIsBetter: true },
  { key: "ast", label: "Assists", fmt: (n) => n.toFixed(1), higherIsBetter: true },
  { key: "stl", label: "Steals", fmt: (n) => n.toFixed(1), higherIsBetter: true },
  { key: "blk", label: "Blocks", fmt: (n) => n.toFixed(1), higherIsBetter: true },
  { key: "fgPct", label: "FG%", fmt: (n) => `${(n * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: "fg3Pct", label: "3P%", fmt: (n) => `${(n * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: "ftPct", label: "FT%", fmt: (n) => `${(n * 100).toFixed(1)}%`, higherIsBetter: true },
  { key: "min", label: "Minutes", fmt: (n) => n.toFixed(1), higherIsBetter: true },
  { key: "gp", label: "Games", fmt: (n) => String(n), higherIsBetter: true },
];

function generateVerdict(a: Player, b: Player): string[] {
  const aLast = a.fullName.split(" ").pop() || a.fullName;
  const bLast = b.fullName.split(" ").pop() || b.fullName;
  let aPts = 0, bPts = 0;
  STAT_ROWS.forEach((row) => {
    const av = a[row.key] as number;
    const bv = b[row.key] as number;
    if (av > bv) aPts++;
    else if (bv > av) bPts++;
  });
  const scoringEdge = a.pts - b.pts;
  const efficiencyEdge = a.fgPct - b.fgPct;
  const playmakingEdge = a.ast - b.ast;
  const reboundEdge = a.reb - b.reb;
  const defenseEdge = (a.stl + a.blk) - (b.stl + b.blk);
  const threeEdge = a.fg3Pct - b.fg3Pct;
  const sentences: string[] = [];
  if (aPts > bPts + 2) {
    sentences.push(`${aLast} edges out ${bLast} across the board, winning in ${aPts} of ${STAT_ROWS.length} categories.`);
  } else if (bPts > aPts + 2) {
    sentences.push(`${bLast} has the upper hand on ${aLast}, leading in ${bPts} of ${STAT_ROWS.length} categories.`);
  } else {
    sentences.push(`${aLast} and ${bLast} are evenly matched — ${aPts} categories to ${bPts}.`);
  }
  if (Math.abs(scoringEdge) >= 3) {
    const scorer = scoringEdge > 0 ? aLast : bLast;
    const margin = Math.abs(scoringEdge).toFixed(1);
    let line = `${scorer} brings the scoring punch with a ${margin}-point edge per game`;
    if (Math.abs(efficiencyEdge) >= 0.03) {
      const efficient = efficiencyEdge > 0 ? aLast : bLast;
      if (efficient === scorer) line += `, and does it more efficiently from the field`;
      else line += `, but ${efficient} is more efficient from the floor`;
    }
    sentences.push(line + ".");
  } else if (Math.abs(efficiencyEdge) >= 0.04) {
    const efficient = efficiencyEdge > 0 ? aLast : bLast;
    sentences.push(`${efficient} shoots significantly better from the field (${((efficiencyEdge > 0 ? a.fgPct : b.fgPct) * 100).toFixed(1)}% vs ${((efficiencyEdge > 0 ? b.fgPct : a.fgPct) * 100).toFixed(1)}%).`);
  }
  const diffs = [
    { val: Math.abs(playmakingEdge), winner: playmakingEdge > 0 ? aLast : bLast, value: Math.abs(playmakingEdge).toFixed(1), unit: "more assists", kind: "ast" },
    { val: Math.abs(reboundEdge), winner: reboundEdge > 0 ? aLast : bLast, value: Math.abs(reboundEdge).toFixed(1), unit: "more boards", kind: "reb" },
    { val: Math.abs(defenseEdge), winner: defenseEdge > 0 ? aLast : bLast, value: Math.abs(defenseEdge).toFixed(1), unit: "more stocks (stl+blk)", kind: "def" },
    { val: Math.abs(threeEdge) * 100, winner: threeEdge > 0 ? aLast : bLast, value: (Math.abs(threeEdge) * 100).toFixed(1) + "%", unit: "better from three", kind: "three" },
  ].sort((x, y) => y.val - x.val);
  const top = diffs[0];
  if (top.val >= (top.kind === "three" ? 4 : 1)) {
    sentences.push(`${top.winner} adds ${top.value} ${top.unit} per night.`);
  }
  return sentences;
}

// Radar chart axes (normalized 0-1)
const RADAR_AXES: { key: keyof Player; label: string; max: number }[] = [
  { key: "pts", label: "PTS", max: 35 },
  { key: "reb", label: "REB", max: 13 },
  { key: "ast", label: "AST", max: 11 },
  { key: "stl", label: "STL", max: 2.5 },
  { key: "blk", label: "BLK", max: 2.5 },
  { key: "fgPct", label: "FG%", max: 0.6 },
  { key: "fg3Pct", label: "3P%", max: 0.45 },
];

function PlayerPicker({
  label,
  selected,
  players,
  onSelect,
  onClear,
  color,
}: {
  label: string;
  selected: Player | null;
  players: Player[];
  onSelect: (p: Player) => void;
  onClear: () => void;
  color: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return players.slice(0, 8);
    const q = query.toLowerCase();
    return players.filter((p) => p.fullName.toLowerCase().includes(q)).slice(0, 8);
  }, [players, query]);

  if (selected) {
    return (
      <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClear();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8A93] hover:text-[#F5F5F7] no-jiggle"
          aria-label="Clear"
        >
          <X size={14} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div
              className="absolute inset-0 blur-3xl opacity-30 rounded-full"
              style={{ background: color }}
            />
            <PlayerAvatar
              playerId={selected.id}
              fullName={selected.fullName}
              size="xl"
              className="relative !h-32 !w-32 ring-4 ring-white/[0.06]"
            />
          </div>
          <Link
            href={`/teams/${selected.teamAbbr.toLowerCase()}`}
            className="flex items-center gap-2 mb-2 no-jiggle"
          >
            <TeamLogo teamId={selected.teamId} abbreviation={selected.teamAbbr} size="xs" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
              {selected.teamAbbr}
            </span>
          </Link>
          <Link
            href={`/players/${selected.slug}`}
            className="font-[family-name:var(--font-barlow)] font-bold text-2xl lg:text-3xl tracking-tight text-[#F5F5F7] mb-1 no-jiggle hover:text-[#D4B560] transition-colors"
          >
            {selected.fullName}
          </Link>
          <p className="text-xs text-[#6E6E76]">{selected.gp} games · {selected.min.toFixed(1)} MPG</p>
        </div>
      </div>
    );
  }

  return (
    <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4 text-center">
        {label}
      </p>
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/[0.04] border border-white/[0.06] focus-within:border-[#D4B560]/40 transition-colors">
          <Search size={14} className="text-[#6E6E76]" />
          <input
            type="text"
            placeholder="Search players..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="bg-transparent outline-none text-sm text-[#F5F5F7] placeholder:text-[#6E6E76] flex-1"
          />
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-2 rounded-2xl border border-white/[0.06] bg-[#131318] shadow-2xl max-h-72 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors no-jiggle text-left"
              >
                <PlayerAvatar playerId={p.id} fullName={p.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F5F5F7] truncate">{p.fullName}</p>
                  <p className="text-[10px] text-[#6E6E76]">
                    {p.teamAbbr} · {p.pts.toFixed(1)} PPG
                  </p>
                </div>
                <TeamLogo teamId={p.teamId} abbreviation={p.teamAbbr} size="xs" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RadarChart({ a, b }: { a: Player; b: Player }) {
  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (Math.PI * 2) / RADAR_AXES.length;

  const pointFor = (player: Player, axisIndex: number) => {
    const axis = RADAR_AXES[axisIndex];
    const value = (player[axis.key] as number) / axis.max;
    const clamped = Math.min(1, Math.max(0, value));
    const angle = angleStep * axisIndex - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius * clamped,
      y: center + Math.sin(angle) * radius * clamped,
    };
  };

  const buildPath = (player: Player) => {
    return RADAR_AXES.map((_, i) => {
      const { x, y } = pointFor(player, i);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ") + "Z";
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={RADAR_AXES.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${center + Math.cos(angle) * radius * ratio},${center + Math.sin(angle) * radius * ratio}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {RADAR_AXES.map((axis, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const labelX = center + Math.cos(angle) * (radius + 18);
        const labelY = center + Math.sin(angle) * (radius + 18);
        return (
          <g key={axis.key}>
            <line
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
            <text
              x={labelX}
              y={labelY}
              fontSize="10"
              fontWeight="700"
              fill="#8A8A93"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ letterSpacing: "0.1em" }}
            >
              {axis.label}
            </text>
          </g>
        );
      })}
      {/* Player A — gold */}
      <path
        d={buildPath(a)}
        fill="rgba(212,181,96,0.20)"
        stroke="#D4B560"
        strokeWidth="2"
        strokeLinejoin="round"
        className="radar-morph"
      />
      {/* Player B — blue */}
      <path
        d={buildPath(b)}
        fill="rgba(91,141,239,0.18)"
        stroke="#5B8DEF"
        strokeWidth="2"
        strokeLinejoin="round"
        className="radar-morph"
        style={{ animationDelay: "150ms" }}
      />
    </svg>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerA, setPlayerA] = useState<Player | null>(null);
  const [playerB, setPlayerB] = useState<Player | null>(null);

  useEffect(() => {
    fetch("/api/players/with-stats")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Player[]) => {
        setPlayers(data);
        // Only seed from URL once on initial load
        const url = new URL(window.location.href);
        const aSlug = url.searchParams.get("a");
        const bSlug = url.searchParams.get("b");
        if (aSlug) setPlayerA(data.find((p) => p.slug === aSlug) || null);
        if (bSlug) setPlayerB(data.find((p) => p.slug === bSlug) || null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when picks change
  useEffect(() => {
    const params = new URLSearchParams();
    if (playerA) params.set("a", playerA.slug);
    if (playerB) params.set("b", playerB.slug);
    const qs = params.toString();
    router.replace(qs ? `/compare?${qs}` : "/compare", { scroll: false });
  }, [playerA, playerB, router]);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-16 max-w-6xl mx-auto" data-reveal>
        {/* Header */}
        <div className="mb-10 lg:mb-14">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Player Comparison
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#F5F5F7] mb-3">
            Head to <span className="text-[#D4B560]">head.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl">
            Pick any two players to see their stats side-by-side and a radar of their strengths.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-10">
            <Skeleton className="h-64 rounded-3xl" />
            <div className="hidden md:flex items-center justify-center">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        ) : (
          <>
            {/* Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 items-stretch mb-10 lg:mb-14">
              <PlayerPicker
                label="Player A"
                selected={playerA}
                players={players}
                onSelect={setPlayerA}
                onClear={() => setPlayerA(null)}
                color="#D4B560"
              />
              <div className="hidden md:flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const a = playerA;
                    setPlayerA(playerB);
                    setPlayerB(a);
                  }}
                  disabled={!playerA && !playerB}
                  className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8A8A93] hover:text-[#D4B560] hover:border-[#D4B560]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Swap players"
                  title="Swap players"
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>
              <PlayerPicker
                label="Player B"
                selected={playerB}
                players={players}
                onSelect={setPlayerB}
                onClear={() => setPlayerB(null)}
                color="#5B8DEF"
              />
            </div>

            {/* Comparison content */}
            {playerA && playerB ? (
              <>
                {/* Headline summary */}
                {(() => {
                  let aWins = 0, bWins = 0;
                  STAT_ROWS.forEach((row) => {
                    const av = playerA[row.key] as number;
                    const bv = playerB[row.key] as number;
                    if (row.higherIsBetter ? av > bv : av < bv) aWins++;
                    else if (row.higherIsBetter ? bv > av : bv < av) bWins++;
                  });
                  const aAdv = STAT_ROWS.filter((r) => {
                    const av = playerA[r.key] as number;
                    const bv = playerB[r.key] as number;
                    return r.higherIsBetter ? av > bv : av < bv;
                  }).slice(0, 3).map((r) => r.label);
                  const bAdv = STAT_ROWS.filter((r) => {
                    const av = playerA[r.key] as number;
                    const bv = playerB[r.key] as number;
                    return r.higherIsBetter ? bv > av : bv < av;
                  }).slice(0, 3).map((r) => r.label);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="floating-card no-jiggle rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560]">
                            {playerA.fullName.split(" ").pop()} edge
                          </span>
                          <span className="text-2xl font-[family-name:var(--font-barlow)] font-black text-[#D4B560] tabular-nums">
                            {aWins}
                          </span>
                        </div>
                        <p className="text-sm text-[#8A8A93]">
                          {aAdv.length > 0 ? `Wins in ${aAdv.join(", ")}` : "No category leads"}
                        </p>
                      </div>
                      <div className="floating-card no-jiggle rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5B8DEF]">
                            {playerB.fullName.split(" ").pop()} edge
                          </span>
                          <span className="text-2xl font-[family-name:var(--font-barlow)] font-black text-[#5B8DEF] tabular-nums">
                            {bWins}
                          </span>
                        </div>
                        <p className="text-sm text-[#8A8A93]">
                          {bAdv.length > 0 ? `Wins in ${bAdv.join(", ")}` : "No category leads"}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Smart verdict */}
                {(() => {
                  const lines = generateVerdict(playerA, playerB);
                  return (
                    <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 mb-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#D4B560]/[0.04] to-transparent pointer-events-none" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={14} className="text-[#D4B560]" />
                          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560]">
                            The verdict
                          </p>
                        </div>
                        <div className="space-y-2">
                          {lines.map((line, i) => (
                            <p
                              key={i}
                              className={`text-base lg:text-lg leading-relaxed ${i === 0 ? "text-[#F5F5F7] font-medium" : "text-[#8A8A93]"}`}
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Radar */}
                <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-10 mb-8">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-2 text-center">
                    Player Profile
                  </p>
                  <RadarChart a={playerA} b={playerB} />
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#D4B560]" />
                      <span className="text-xs text-[#8A8A93]">{playerA.fullName.split(" ").pop()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#5B8DEF]" />
                      <span className="text-xs text-[#8A8A93]">{playerB.fullName.split(" ").pop()}</span>
                    </div>
                  </div>
                </div>

                {/* Stat rows with visual bars */}
                <div className="floating-card no-jiggle rounded-3xl overflow-hidden">
                  {STAT_ROWS.map((row) => {
                    const aVal = playerA[row.key] as number;
                    const bVal = playerB[row.key] as number;
                    const aWins = row.higherIsBetter ? aVal > bVal : aVal < bVal;
                    const bWins = row.higherIsBetter ? bVal > aVal : bVal < aVal;
                    // Bar widths: split 50/50, then shift toward winner
                    const total = aVal + bVal;
                    const aPct = total === 0 ? 50 : Math.round((aVal / total) * 100);
                    const bPct = 100 - aPct;
                    return (
                      <div
                        key={row.key}
                        className="px-4 lg:px-8 py-4 border-b border-white/[0.04] last:border-0"
                      >
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-6 mb-2.5">
                          <p className={`text-right text-xl lg:text-2xl font-[family-name:var(--font-barlow)] font-bold tabular-nums ${aWins ? "text-[#D4B560]" : "text-[#8A8A93]"}`}>
                            {row.fmt(aVal)}
                          </p>
                          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] min-w-[70px] text-center">
                            {row.label}
                          </p>
                          <p className={`text-left text-xl lg:text-2xl font-[family-name:var(--font-barlow)] font-bold tabular-nums ${bWins ? "text-[#5B8DEF]" : "text-[#8A8A93]"}`}>
                            {row.fmt(bVal)}
                          </p>
                        </div>
                        {/* Visual bar */}
                        <div className="flex h-1 rounded-full overflow-hidden gap-px">
                          <div
                            className="rounded-l-full transition-all duration-700"
                            style={{
                              width: `${aPct}%`,
                              background: aWins ? "#D4B560" : "rgba(212,181,96,0.2)",
                            }}
                          />
                          <div
                            className="rounded-r-full transition-all duration-700"
                            style={{
                              width: `${bPct}%`,
                              background: bWins ? "#5B8DEF" : "rgba(91,141,239,0.2)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : playerA && !playerB ? (
              (() => {
                // Find the stat-twin / nemesis: closest player by weighted stat distance.
                const candidates = players.filter((p) => p.id !== playerA.id);
                const dist = (p: Player) =>
                  Math.abs(p.pts - playerA.pts) +
                  Math.abs(p.reb - playerA.reb) * 1.2 +
                  Math.abs(p.ast - playerA.ast) * 1.2 +
                  Math.abs(p.fgPct - playerA.fgPct) * 30 +
                  Math.abs(p.fg3Pct - playerA.fg3Pct) * 20;
                const nemesis = candidates.sort((a, b) => dist(a) - dist(b))[0];
                return (
                  <div className="floating-card no-jiggle rounded-3xl p-10 lg:p-14 text-center">
                    <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
                      One more
                    </p>
                    <p className="text-xl lg:text-2xl font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7] mb-2">
                      Pick a Player B
                    </p>
                    {nemesis && (
                      <>
                        <p className="text-sm text-[#8A8A93] max-w-md mx-auto mb-5">
                          The closest stat-twin to {playerA.fullName.split(" ").pop()} is below — tap to load.
                        </p>
                        <button
                          type="button"
                          onClick={() => setPlayerB(nemesis)}
                          className="ripple inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-5 py-2.5 rounded-full hover:bg-white"
                        >
                          Use {nemesis.fullName} as nemesis
                        </button>
                      </>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="floating-card no-jiggle rounded-3xl p-10 lg:p-16 text-center">
                <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
                  Get started
                </p>
                <p className="text-xl lg:text-2xl font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7] mb-3">
                  Pick two players
                </p>
                <p className="text-sm text-[#8A8A93] max-w-md mx-auto">
                  Search any active NBA player above. We&apos;ll show their stats side-by-side and a radar of their strengths.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
