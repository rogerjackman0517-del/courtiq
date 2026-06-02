"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Player = {
  id: number;
  fullName: string;
  pts: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  position?: string;
};

type ZoneId = "restricted" | "paint" | "midrange" | "corner3" | "arc3";

type Shot = {
  x: number;        // -240..240, centered on rim x=250
  y: number;        // 10..450, distance from baseline (0 = baseline)
  made: boolean;
  zone: ZoneId;
};

const COURT_W = 500;
const COURT_H = 470;
const RIM_X = 250;
const RIM_Y = 52;

// League-average FG% per zone (rough but close to current-era values)
const LEAGUE_AVG: Record<ZoneId, number> = {
  restricted: 0.66,
  paint: 0.43,
  midrange: 0.40,
  corner3: 0.39,
  arc3: 0.36,
};

const ZONE_META: Record<ZoneId, {
  label: string;
  short: string;
  path: string;
  labelPos: { x: number; y: number };
}> = {
  restricted: {
    label: "At the rim",
    short: "RIM",
    path: "M 210 52 A 40 40 0 0 1 290 52 Z",
    labelPos: { x: 250, y: 78 },
  },
  paint: {
    label: "In the paint",
    short: "PAINT",
    path:
      "M 170 0 L 330 0 L 330 190 L 170 190 Z " +
      "M 210 52 A 40 40 0 0 1 290 52 Z",
    labelPos: { x: 250, y: 145 },
  },
  midrange: {
    label: "Mid-range",
    short: "MID",
    path:
      "M 30 140 L 30 0 L 470 0 L 470 140 " +
      "A 237.5 237.5 0 0 1 30 140 Z " +
      "M 170 0 L 330 0 L 330 190 L 170 190 Z",
    labelPos: { x: 110, y: 95 },
  },
  corner3: {
    // Two narrow strips; render mirrored labels in each corner area.
    label: "Corner 3",
    short: "C3",
    path:
      "M 0 0 L 30 0 L 30 140 L 0 140 Z " +
      "M 470 0 L 500 0 L 500 140 L 470 140 Z",
    labelPos: { x: 55, y: 70 },
  },
  arc3: {
    label: "Above the break 3",
    short: "ATB3",
    path:
      "M 30 140 A 237.5 237.5 0 0 0 470 140 L 470 470 L 30 470 Z",
    labelPos: { x: 250, y: 350 },
  },
};

const ZONE_ORDER: ZoneId[] = ["restricted", "paint", "midrange", "corner3", "arc3"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function classifyShot(courtX: number, courtY: number): ZoneId {
  const dx = courtX - RIM_X;
  const dy = courtY - RIM_Y;
  const distToRim = Math.sqrt(dx * dx + dy * dy);

  if (distToRim < 40) return "restricted";
  if ((courtX < 30 || courtX > 470) && courtY < 140) return "corner3";
  if (courtX >= 170 && courtX <= 330 && courtY >= 0 && courtY <= 190) return "paint";
  if (distToRim > 237.5) return "arc3";
  return "midrange";
}

function generateShots(player: Player): Shot[] {
  let state = player.id;
  const rand = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = (mean: number, sd: number) => {
    const u1 = rand() || 0.0001;
    const u2 = rand();
    return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  const pos = (player.position || "").toUpperCase();
  let mix = { rim: 0.35, midrange: 0.2, three: 0.35, corner3: 0.1 };
  if (pos.startsWith("C")) mix = { rim: 0.65, midrange: 0.2, three: 0.1, corner3: 0.05 };
  else if (pos.startsWith("PF")) mix = { rim: 0.45, midrange: 0.25, three: 0.2, corner3: 0.1 };
  else if (pos.startsWith("PG")) mix = { rim: 0.25, midrange: 0.2, three: 0.45, corner3: 0.1 };
  else if (pos.startsWith("SG")) mix = { rim: 0.2, midrange: 0.2, three: 0.5, corner3: 0.1 };

  const totalShots = clamp(Math.round(35 + player.pts * 1.3), 40, 90);
  const adj = (base: number) => clamp(base + (player.fgPct - 0.47) * 0.6, 0.25, 0.85);
  const makeRates = {
    rim: adj(0.65),
    midrange: adj(0.42),
    three: clamp(player.fg3Pct || 0.35, 0.25, 0.5),
    corner3: clamp((player.fg3Pct || 0.35) + 0.03, 0.27, 0.55),
  };

  const shots: Shot[] = [];
  for (let i = 0; i < totalShots; i++) {
    const r = rand();
    let bucket: keyof typeof mix;
    if (r < mix.rim) bucket = "rim";
    else if (r < mix.rim + mix.midrange) bucket = "midrange";
    else if (r < mix.rim + mix.midrange + mix.three) bucket = "three";
    else bucket = "corner3";

    let x: number, y: number;
    if (bucket === "rim") {
      x = gauss(0, 25);
      y = clamp(gauss(50, 25), 20, 110);
    } else if (bucket === "midrange") {
      const angle = rand() * Math.PI - Math.PI / 2;
      const dist = 80 + rand() * 140;
      x = Math.sin(angle) * dist;
      y = 50 + Math.cos(angle) * dist;
    } else if (bucket === "three") {
      const angle = rand() * Math.PI * 0.7 - Math.PI * 0.35;
      const dist = 240 + rand() * 30;
      x = Math.sin(angle) * dist;
      y = 50 + Math.cos(angle) * dist;
    } else {
      const side = rand() < 0.5 ? -1 : 1;
      x = side * (210 + rand() * 35);
      y = 20 + rand() * 70;
    }

    const made = rand() < makeRates[bucket];
    const cx = clamp(x, -240, 240);
    const cy = clamp(y, 10, 450);
    const zone = classifyShot(cx + RIM_X, cy);
    shots.push({ x: cx, y: cy, made, zone });
  }
  return shots;
}

type ZoneStat = {
  zone: ZoneId;
  attempts: number;
  makes: number;
  fgPct: number;
  leagueAvg: number;
  delta: number;       // player FG% - league avg, percentage points
  pointsPerShot: number;
};

function getZoneStats(shots: Shot[]): Record<ZoneId, ZoneStat> {
  const acc: Record<ZoneId, { attempts: number; makes: number }> = {
    restricted: { attempts: 0, makes: 0 },
    paint: { attempts: 0, makes: 0 },
    midrange: { attempts: 0, makes: 0 },
    corner3: { attempts: 0, makes: 0 },
    arc3: { attempts: 0, makes: 0 },
  };
  for (const s of shots) {
    acc[s.zone].attempts += 1;
    if (s.made) acc[s.zone].makes += 1;
  }
  const out = {} as Record<ZoneId, ZoneStat>;
  for (const z of ZONE_ORDER) {
    const { attempts, makes } = acc[z];
    const fgPct = attempts > 0 ? makes / attempts : 0;
    const leagueAvg = LEAGUE_AVG[z];
    const pointValue = z === "corner3" || z === "arc3" ? 3 : 2;
    out[z] = {
      zone: z,
      attempts,
      makes,
      fgPct,
      leagueAvg,
      delta: fgPct - leagueAvg,
      pointsPerShot: attempts > 0 ? (makes * pointValue) / attempts : 0,
    };
  }
  return out;
}

/** Return fill color for a zone region based on FG% delta vs league avg.
 *  Tuned for a polished, restrained heatmap — accent reads at a glance
 *  without flooding the court with color. */
function getZoneFill(stat: ZoneStat, isHovered: boolean): string {
  if (stat.attempts === 0) return "rgba(255, 255, 255, 0.02)";
  const delta = stat.delta * 100;
  const boost = isHovered ? 0.08 : 0;
  if (delta >= 5) return `rgba(212, 181, 96, ${0.20 + boost})`;
  if (delta >= 2) return `rgba(212, 181, 96, ${0.10 + boost})`;
  if (delta >= -2) return `rgba(255, 255, 255, ${0.03 + boost})`;
  if (delta >= -5) return `rgba(91, 141, 239, ${0.10 + boost})`;
  return `rgba(91, 141, 239, ${0.20 + boost})`;
}

/** Small accent color used on the stat-tile top bar to signal delta direction. */
function getZoneAccent(stat: ZoneStat): string {
  if (stat.attempts === 0) return "rgba(255, 255, 255, 0.15)";
  const delta = stat.delta * 100;
  if (delta >= 2) return "#D4B560";
  if (delta <= -2) return "#5B8DEF";
  return "rgba(255, 255, 255, 0.35)";
}

function deltaTone(delta: number): { color: string; sign: string } {
  const pp = delta * 100;
  if (pp >= 2) return { color: "#D4B560", sign: "+" };
  if (pp <= -2) return { color: "#5B8DEF", sign: "" };
  return { color: "#8A8A93", sign: pp >= 0 ? "+" : "" };
}

export function ShotChart({ player }: { player: Player }) {
  const [view, setView] = useState<"zones" | "shots">("zones");
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null);

  const shots = useMemo(() => generateShots(player), [player]);
  const zoneStats = useMemo(() => getZoneStats(shots), [shots]);

  const total = shots.length;
  const makes = shots.filter((s) => s.made).length;
  const fgPct = ((makes / total) * 100).toFixed(1);

  // Best zone for the "highlight" callout
  const bestZone = useMemo(() => {
    return ZONE_ORDER
      .filter((z) => zoneStats[z].attempts >= 3)
      .sort((a, b) => zoneStats[b].delta - zoneStats[a].delta)[0];
  }, [zoneStats]);

  return (
    <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
            Shot Profile
          </p>
          <h3 className="font-[family-name:var(--font-barlow)] font-black text-2xl tracking-tight text-[#F5F5F7]">
            Where they score from
          </h3>
          {bestZone && zoneStats[bestZone].delta > 0.02 && (
            <p className="text-xs text-[#8A8A93] mt-1.5">
              Strongest from{" "}
              <span className="text-[#D4B560] font-semibold">
                {ZONE_META[bestZone].label.toLowerCase()}
              </span>{" "}
              — {(zoneStats[bestZone].fgPct * 100).toFixed(1)}%{" "}
              <span className="text-[#6E6E76]">
                (+{(zoneStats[bestZone].delta * 100).toFixed(1)} vs avg)
              </span>
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-[#6E6E76]">Modeled FG</p>
          <p className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums text-[#F5F5F7]">
            {makes}/{total}{" "}
            <span className="text-[#8A8A93] text-sm font-medium">({fgPct}%)</span>
          </p>
        </div>
      </div>

      {/* View toggle */}
      <div className="inline-flex p-1 bg-[#1C1C24] rounded-full border border-white/[0.05] mb-6">
        {(["zones", "shots"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold tracking-wide rounded-full transition-colors min-h-[32px]",
              view === v
                ? "bg-[#F5F5F7] text-[#0A0A0E]"
                : "text-[#8A8A93] hover:text-[#F5F5F7]"
            )}
          >
            {v === "zones" ? "Zones" : "Shots"}
          </button>
        ))}
      </div>

      {/* Court + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 lg:gap-8 items-start">
        <div className="relative aspect-[500/470] w-full">
          <svg
            viewBox={`0 0 ${COURT_W} ${COURT_H}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Court floor */}
            <rect width={COURT_W} height={COURT_H} fill="#0F0F14" />

            {/* ZONE FILLS — subtle heatmap, only visible in zones view */}
            {view === "zones" &&
              ZONE_ORDER.map((z) => {
                const stat = zoneStats[z];
                return (
                  <path
                    key={`zone-${z}`}
                    d={ZONE_META[z].path}
                    fill={getZoneFill(stat, hoveredZone === z)}
                    fillRule="evenodd"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={0.5}
                    onMouseEnter={() => setHoveredZone(z)}
                    onMouseLeave={() => setHoveredZone(null)}
                    style={{
                      transition: "fill var(--duration-base) var(--ease-out)",
                      cursor: stat.attempts > 0 ? "pointer" : "default",
                    }}
                  />
                );
              })}

            {/* Court markings */}
            <rect
              x={170}
              y={0}
              width={160}
              height={190}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.5}
            />
            <line
              x1={170}
              y1={190}
              x2={330}
              y2={190}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.5}
            />
            <circle
              cx={250}
              cy={190}
              r={60}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1.5}
            />
            <path
              d="M 210 52 A 40 40 0 0 1 290 52"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.5}
            />
            <line x1={220} y1={40} x2={280} y2={40} stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
            <circle cx={250} cy={52} r={7.5} fill="none" stroke="rgba(212, 181, 96, 0.8)" strokeWidth={2} />
            <line x1={30} y1={0} x2={30} y2={140} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
            <line x1={470} y1={0} x2={470} y2={140} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
            <path
              d="M 30 140 A 237.5 237.5 0 0 1 470 140"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.5}
            />
            <line
              x1={0}
              y1={COURT_H - 1}
              x2={COURT_W}
              y2={COURT_H - 1}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1.5}
            />
            <circle cx={250} cy={COURT_H} r={60} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />
            <rect
              width={COURT_W}
              height={COURT_H}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={1.5}
            />

            {/* ZONE LABELS — small dark stat tiles, only in zones view */}
            {view === "zones" &&
              ZONE_ORDER.flatMap((z) => {
                const stat = zoneStats[z];
                if (stat.attempts === 0) return [];
                const accent = getZoneAccent(stat);
                const isHovered = hoveredZone === z;
                const pct = `${(stat.fgPct * 100).toFixed(0)}%`;
                const tileW = 44;
                const tileH = 22;

                const renderTile = (cx: number, cy: number, key: string) => (
                  <g key={key} pointerEvents="none" transform={`translate(${cx}, ${cy})`}>
                    <rect
                      x={-tileW / 2}
                      y={-tileH / 2}
                      width={tileW}
                      height={tileH}
                      rx={5}
                      fill="rgba(10, 10, 14, 0.82)"
                      stroke={isHovered ? accent : "rgba(255,255,255,0.12)"}
                      strokeWidth={isHovered ? 1.25 : 0.75}
                      style={{
                        transition:
                          "stroke var(--duration-base) var(--ease-out), stroke-width var(--duration-base) var(--ease-out)",
                      }}
                    />
                    <rect
                      x={-tileW / 2}
                      y={-tileH / 2}
                      width={tileW}
                      height={2}
                      rx={1}
                      fill={accent}
                    />
                    <text
                      textAnchor="middle"
                      y={5}
                      className="select-none"
                      style={{
                        fontFamily: "var(--font-barlow), sans-serif",
                        fontWeight: 900,
                        fontSize: 13,
                        fill: "#F5F5F7",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {pct}
                    </text>
                  </g>
                );

                const pos = ZONE_META[z].labelPos;
                // Corner 3: render twice, mirrored across center (x=250).
                if (z === "corner3") {
                  return [
                    renderTile(pos.x, pos.y, "label-corner3-L"),
                    renderTile(COURT_W - pos.x, pos.y, "label-corner3-R"),
                  ];
                }
                return [renderTile(pos.x, pos.y, `label-${z}`)];
              })}

            {/* SHOTS view: individual dots */}
            {view === "shots" &&
              shots.map((s, i) => (
                <circle
                  key={i}
                  cx={s.x + 250}
                  cy={s.y}
                  r={4}
                  fill={s.made ? "rgba(52, 211, 153, 0.7)" : "rgba(248, 113, 113, 0.18)"}
                  stroke={s.made ? "rgba(52, 211, 153, 1)" : "rgba(248, 113, 113, 0.7)"}
                  strokeWidth={1.25}
                />
              ))}
          </svg>
        </div>

        {/* Zone breakdown panel */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-3">
            Breakdown
          </p>
          {ZONE_ORDER.map((z) => {
            const stat = zoneStats[z];
            const meta = ZONE_META[z];
            const isHovered = hoveredZone === z;
            const tone = deltaTone(stat.delta);
            const noData = stat.attempts === 0;
            return (
              <div
                key={`row-${z}`}
                onMouseEnter={() => setHoveredZone(z)}
                onMouseLeave={() => setHoveredZone(null)}
                className={cn(
                  "rounded-xl px-3 py-2.5 cursor-default transition-colors",
                  isHovered ? "bg-white/[0.05]" : "bg-white/[0.015] hover:bg-white/[0.03]",
                  noData && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-[#F5F5F7] tracking-tight">
                    {meta.label}
                  </p>
                  <span
                    className="text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                    style={{
                      color: tone.color,
                      background: `${tone.color}1A`,
                    }}
                  >
                    {noData ? "—" : `${tone.sign}${(stat.delta * 100).toFixed(1)}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-[family-name:var(--font-barlow)] font-black text-xl tabular-nums text-[#F5F5F7] leading-none">
                    {noData ? "—" : `${(stat.fgPct * 100).toFixed(1)}%`}
                  </p>
                  <p className="text-[10px] text-[#6E6E76] tabular-nums">
                    {noData ? "no attempts" : `${stat.makes}/${stat.attempts} · ${stat.pointsPerShot.toFixed(2)} PPS`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap legend (zones view) / make-miss legend (shots view) */}
      {view === "zones" ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6 text-[10px] tracking-wider uppercase text-[#6E6E76]">
          <span className="text-[#5B8DEF]">Below avg</span>
          <span
            className="h-1.5 w-32 rounded-full"
            style={{
              background:
                "linear-gradient(to right, rgba(91,141,239,0.6) 0%, rgba(91,141,239,0.25) 30%, rgba(255,255,255,0.1) 50%, rgba(212,181,96,0.35) 70%, rgba(212,181,96,0.7) 100%)",
            }}
          />
          <span className="text-[#D4B560]">Above avg</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-6 mt-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#34D399]/70 ring-2 ring-[#34D399]" />
            <span className="text-xs text-[#8A8A93]">Make</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#F87171]/30 ring-2 ring-[#F87171]/70" />
            <span className="text-xs text-[#8A8A93]">Miss</span>
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#6E6E76] text-center mt-4">
        Modeled shot distribution based on season percentages and position. Zone FG% compared against league averages.
      </p>
    </div>
  );
}
