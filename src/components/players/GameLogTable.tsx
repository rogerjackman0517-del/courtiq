"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";

type Game = {
  eventId: string;
  date: string;
  opponent: { abbr: string; displayName: string; logo: string };
  atVs: "vs" | "@";
  result: "W" | "L";
  score: string;
  min: string;
  pts: string;
  reb: string;
  ast: string;
  fg: string;
  fg3: string;
};

function TrendChart({ games }: { games: Game[] }) {
  const pts = [...games].reverse().map(g => parseFloat(g.pts) || 0);
  const reb = [...games].reverse().map(g => parseFloat(g.reb) || 0);
  const ast = [...games].reverse().map(g => parseFloat(g.ast) || 0);
  const n = pts.length;
  if (n < 3) return null;

  const W = 560, H = 72, pl = 4, pr = 44, pt2 = 8, pb = 8;
  const iW = W - pl - pr;
  const iH = H - pt2 - pb;
  const mx = Math.max(...pts, ...reb, ...ast) * 1.12 || 1;
  const xAt = (i: number) => pl + (i / (n - 1)) * iW;
  const yAt = (v: number) => pt2 + (1 - v / mx) * iH;
  const line = (vs: number[]) =>
    vs.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");

  const lx = xAt(n - 1);
  const endLabels = [
    { v: pts[n - 1], c: "#D4B560", y: yAt(pts[n - 1]) },
    { v: reb[n - 1], c: "#34D399", y: yAt(reb[n - 1]) },
    { v: ast[n - 1], c: "#5B8DEF", y: yAt(ast[n - 1]) },
  ].sort((a, b) => a.y - b.y);
  for (let i = 1; i < endLabels.length; i++) {
    if (endLabels[i].y < endLabels[i - 1].y + 10) endLabels[i].y = endLabels[i - 1].y + 10;
  }

  return (
    <div className="mb-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#6E6E76]">
          Trend · last {n} games
        </p>
        <div className="flex gap-4">
          {([ ["#D4B560","PTS"], ["#34D399","REB"], ["#5B8DEF","AST"] ] as [string,string][]).map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className="block h-[2px] w-3 rounded-full" style={{ background: c }} />
              <span className="text-[9px] text-[#6E6E76]">{l}</span>
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[0.33, 0.67].map((f, i) => (
          <line key={i} x1={pl} y1={pt2 + f * iH} x2={W - pr} y2={pt2 + f * iH}
            stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
        <path d={line(pts)} fill="none" stroke="#D4B560" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line(reb)} fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path d={line(ast)} fill="none" stroke="#5B8DEF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <circle cx={lx} cy={yAt(pts[n - 1])} r="2.5" fill="#D4B560" />
        <circle cx={lx} cy={yAt(reb[n - 1])} r="2" fill="#34D399" opacity="0.8" />
        <circle cx={lx} cy={yAt(ast[n - 1])} r="2" fill="#5B8DEF" opacity="0.8" />
        {endLabels.map((l, i) => (
          <text key={i} x={lx + 5} y={l.y + 3.5} fill={l.c} fontSize="9" fontWeight="600" fontFamily="system-ui,sans-serif">
            {l.v.toFixed(0)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function GameLogTable({ slug }: { slug: string }) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gamelog/${slug}`)
      .then((r) => (r.ok ? r.json() : { games: [] }))
      .then((d) => setGames(Array.isArray(d.games) ? d.games : []))
      .finally(() => setLoading(false));
  }, [slug]);

  const last10 = games.slice(0, 10);

  return (
    <section className="px-4 lg:px-12 py-10 lg:py-16" data-reveal>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 lg:mb-10">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8A8A93] mb-2">
            Game log
          </p>
          <h2 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-[-0.03em] text-[#F5F5F7]">
            Last 10 games.
          </h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : last10.length === 0 ? (
          <div className="floating-card no-jiggle rounded-2xl p-10 text-center">
            <p className="text-sm text-[#8A8A93]">No recent game data available.</p>
          </div>
        ) : (
          <>
          <TrendChart games={last10} />
          <div className="floating-card no-jiggle rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 lg:px-6 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">Opp</th>
                    <th className="text-left px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">Result</th>
                    <th className="text-right px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">MIN</th>
                    <th className="text-right px-3 py-3 text-[#D4B560] font-medium text-xs uppercase tracking-wider">PTS</th>
                    <th className="text-right px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">REB</th>
                    <th className="text-right px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">AST</th>
                    <th className="text-right px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">FG</th>
                    <th className="text-right px-4 lg:px-6 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">3PT</th>
                  </tr>
                </thead>
                <tbody>
                  {last10.map((g) => {
                    const d = new Date(g.date);
                    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    // Heatmap by points scored (gradient from cool blue → gold for hot)
                    const ptsNum = parseFloat(g.pts) || 0;
                    let bg = "rgba(255,255,255,0.02)";
                    let fg = "#F5F5F7";
                    if (ptsNum >= 40)      { bg = "rgba(212,181,96,0.32)"; fg = "#FFFBEA"; }
                    else if (ptsNum >= 30) { bg = "rgba(212,181,96,0.22)"; fg = "#F5F5F7"; }
                    else if (ptsNum >= 20) { bg = "rgba(212,181,96,0.10)"; fg = "#F5F5F7"; }
                    else if (ptsNum >= 10) { bg = "rgba(91,141,239,0.10)"; fg = "#F5F5F7"; }
                    else if (ptsNum > 0)   { bg = "rgba(91,141,239,0.18)"; fg = "#C7D6F7"; }
                    return (
                      <tr key={g.eventId} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 lg:px-6 py-3">
                          <Link href={`/scores/${g.eventId}`} className="text-[#F5F5F7] hover:text-[#D4B560] transition-colors text-sm font-medium no-jiggle">
                            {dateStr}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-sm text-[#8A8A93]">
                          <span className="text-[#6E6E76] mr-1">{g.atVs}</span>
                          <span className="text-[#F5F5F7] font-medium">{g.opponent.abbr}</span>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span className={`font-bold ${g.result === "W" ? "text-[#34D399]" : "text-[#F87171]"}`}>
                            {g.result}
                          </span>
                          <span className="text-[#6E6E76] ml-2">{g.score}</span>
                        </td>
                        <td className="text-right px-3 py-3 text-[#8A8A93] tabular-nums">{g.min}</td>
                        <td className="text-right px-3 py-3 tabular-nums">
                          <span
                            className="gamelog-pts font-bold"
                            style={{ background: bg, color: fg }}
                          >
                            {g.pts}
                          </span>
                        </td>
                        <td className="text-right px-3 py-3 text-[#8A8A93] tabular-nums">{g.reb}</td>
                        <td className="text-right px-3 py-3 text-[#8A8A93] tabular-nums">{g.ast}</td>
                        <td className="text-right px-3 py-3 text-[#8A8A93] tabular-nums">{g.fg}</td>
                        <td className="text-right px-4 lg:px-6 py-3 text-[#8A8A93] tabular-nums">{g.fg3}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  );
}
