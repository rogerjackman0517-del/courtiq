"use client";

import { useMemo } from "react";

type Player = {
  id: number;
  fullName: string;
  pts: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  position?: string;
};

type Shot = {
  x: number;
  y: number;
  made: boolean;
  type: "rim" | "midrange" | "three" | "corner3";
};

const COURT_W = 500;
const COURT_H = 470;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function generateShots(player: Player): Shot[] {
  let state = player.id;
  const rand = () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
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
  let mix = { rim: 0.35, midrange: 0.20, three: 0.35, corner3: 0.10 };
  if (pos.startsWith("C")) mix = { rim: 0.65, midrange: 0.20, three: 0.10, corner3: 0.05 };
  else if (pos.startsWith("PF")) mix = { rim: 0.45, midrange: 0.25, three: 0.20, corner3: 0.10 };
  else if (pos.startsWith("PG")) mix = { rim: 0.25, midrange: 0.20, three: 0.45, corner3: 0.10 };
  else if (pos.startsWith("SG")) mix = { rim: 0.20, midrange: 0.20, three: 0.50, corner3: 0.10 };

  const totalShots = clamp(Math.round(35 + player.pts * 1.3), 40, 90);

  const adj = (base: number) => clamp(base + (player.fgPct - 0.47) * 0.6, 0.25, 0.85);
  const makeRates = {
    rim: adj(0.65),
    midrange: adj(0.42),
    three: clamp(player.fg3Pct || 0.35, 0.25, 0.50),
    corner3: clamp((player.fg3Pct || 0.35) + 0.03, 0.27, 0.55),
  };

  const shots: Shot[] = [];
  for (let i = 0; i < totalShots; i++) {
    const r = rand();
    let type: Shot["type"];
    if (r < mix.rim) type = "rim";
    else if (r < mix.rim + mix.midrange) type = "midrange";
    else if (r < mix.rim + mix.midrange + mix.three) type = "three";
    else type = "corner3";

    let x: number, y: number;
    if (type === "rim") {
      x = gauss(0, 25);
      y = clamp(gauss(50, 25), 20, 110);
    } else if (type === "midrange") {
      const angle = (rand() * Math.PI) - Math.PI / 2;
      const dist = 80 + rand() * 140;
      x = Math.sin(angle) * dist;
      y = 50 + Math.cos(angle) * dist;
    } else if (type === "three") {
      const angle = (rand() * Math.PI * 0.7) - Math.PI * 0.35;
      const dist = 240 + rand() * 30;
      x = Math.sin(angle) * dist;
      y = 50 + Math.cos(angle) * dist;
    } else {
      const side = rand() < 0.5 ? -1 : 1;
      x = side * (210 + rand() * 35);
      y = 20 + rand() * 70;
    }

    const made = rand() < makeRates[type];
    shots.push({ x: clamp(x, -240, 240), y: clamp(y, 10, 450), made, type });
  }
  return shots;
}

export function ShotChart({ player }: { player: Player }) {
  const shots = useMemo(() => generateShots(player), [player]);
  const makes = shots.filter((s) => s.made).length;
  const total = shots.length;
  const fg = ((makes / total) * 100).toFixed(1);

  return (
    <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 relative overflow-hidden">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
            Shot Profile
          </p>
          <h3 className="font-[family-name:var(--font-barlow)] font-black text-2xl tracking-tight text-[#F5F5F7]">
            Where they score from
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-[#6E6E76]">Modeled FG</p>
          <p className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums text-[#F5F5F7]">
            {makes}/{total} <span className="text-[#8A8A93] text-sm font-medium">({fg}%)</span>
          </p>
        </div>
      </div>

      <div className="relative aspect-[500/470] w-full max-w-2xl mx-auto">
        <svg viewBox={`0 0 ${COURT_W} ${COURT_H}`} className="w-full h-full">
          {/* Court floor */}
          <rect width={COURT_W} height={COURT_H} fill="#0F0F14" />

          {/* Paint (the key) — 16ft wide × 19ft deep, baseline = top */}
          <rect x={170} y={0} width={160} height={190} fill="rgba(212, 181, 96, 0.04)" stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />

          {/* Free throw line (top of key) */}
          <line x1={170} y1={190} x2={330} y2={190} stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />

          {/* Free throw circle (6ft radius) */}
          <circle cx={250} cy={190} r={60} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} strokeDasharray="0" />

          {/* Restricted area arc (4ft radius from rim) */}
          <path d="M 210 52 A 40 40 0 0 1 290 52" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />

          {/* Backboard */}
          <line x1={220} y1={40} x2={280} y2={40} stroke="rgba(255,255,255,0.55)" strokeWidth={3} />

          {/* Rim (9 inches = ~7.5 units diameter) */}
          <circle cx={250} cy={52} r={7.5} fill="none" stroke="rgba(212, 181, 96, 0.8)" strokeWidth={2} />

          {/*
            3-point line:
            Corner 3 sidelines at x=30 and x=470, from baseline (y=0) up to y=140 (14ft from baseline).
            Arc with radius 237.5 (23.75ft) centered at rim (250, 52).
            Arc endpoints: where the radius-237.5 circle hits y=140 → solve for x.
              (x-250)^2 + (140-52)^2 = 237.5^2
              (x-250)^2 = 56406.25 - 7744 = 48662.25
              x-250 = ±220.6 → x ≈ 29.4 and 470.6
            So lines should meet arc at ~(30, 140) and ~(470, 140). 
          */}
          {/* Corner 3 lines */}
          <line x1={30} y1={0} x2={30} y2={140} stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />
          <line x1={470} y1={0} x2={470} y2={140} stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />
          {/* Top arc */}
          <path d="M 30 140 A 237.5 237.5 0 0 1 470 140" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />

          {/* Half-court line (at the bottom of our half-court view) */}
          <line x1={0} y1={COURT_H - 1} x2={COURT_W} y2={COURT_H - 1} stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />
          {/* Center circle (only half visible since we're showing half-court) */}
          <circle cx={250} cy={COURT_H} r={60} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />

          {/* Outer boundary */}
          <rect width={COURT_W} height={COURT_H} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />

          {shots.map((s, i) => (
            <circle
              key={i}
              cx={s.x + 250}
              cy={s.y}
              r={5}
              fill={s.made ? "rgba(52, 211, 153, 0.7)" : "rgba(248, 113, 113, 0.5)"}
              stroke={s.made ? "rgba(52, 211, 153, 1)" : "rgba(248, 113, 113, 0.8)"}
              strokeWidth={1.5}
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-6 mt-5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#34D399]/70 ring-2 ring-[#34D399]" />
          <span className="text-xs text-[#8A8A93]">Make</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#F87171]/50 ring-2 ring-[#F87171]/80" />
          <span className="text-xs text-[#8A8A93]">Miss</span>
        </div>
      </div>

      <p className="text-[10px] text-[#6E6E76] text-center mt-4">
        Modeled shot distribution based on season percentages and position. Not actual play-by-play.
      </p>
    </div>
  );
}
