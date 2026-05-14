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
                        <td className="text-right px-3 py-3 font-bold text-[#F5F5F7] tabular-nums">{g.pts}</td>
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
        )}
      </div>
    </section>
  );
}
