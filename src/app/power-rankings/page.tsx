"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Flame } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Skeleton } from "@/components/ui/Skeleton";

type Team = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  fullName: string;
  slug: string;
  conference: string;
  wins: number;
  losses: number;
  winPct: number;
  streak: string;
  l10: string;
  primaryColor: string;
  power: number;
  l10Pct: number;
  rank: number;
  playoffStatus: "alive" | "out-r1" | "out-r2" | "missed";
  playoffLabel: string;
};

export default function PowerRankingsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teams/power-rankings")
      .then((r) => (r.ok ? r.json() : []))
      .then(setTeams)
      .finally(() => setLoading(false));
  }, []);

  const week = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const top5 = teams.slice(0, 5);
  const rest = teams.slice(5);

  return (
    <div className="pb-24 lg:pb-12">
      <section className="px-4 lg:px-12 pt-10 lg:pt-16 max-w-6xl mx-auto" data-reveal>
        {/* Header */}
        <div className="mb-10 lg:mb-14">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Power Rankings · {week}
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#F5F5F7] mb-4">
            Who&apos;s hot,<br />
            <span className="text-[#D4B560]">who&apos;s not.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl">
            Our power score weights overall record (60%), recent form (40%), and current playoff status.
          </p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Top 5 cards */}
            <div className="mb-3 flex items-center gap-2">
              <Flame size={14} className="text-[#D4B560]" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76]">Top 5</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-12">
              {top5.map((t) => (
                <Link
                  key={t.id}
                  href={`/teams/${t.abbreviation.toLowerCase()}`}
                  className="floating-card no-jiggle group relative rounded-2xl p-5 overflow-hidden hover:scale-[1.02] transition-transform"
                >
                  {/* Rank badge */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-5xl tracking-tight text-[#D4B560] leading-none">
                      #{t.rank}
                    </span>
                    <TeamLogo teamId={t.id} abbreviation={t.abbreviation} size="md" />
                  </div>
                  <p className="text-sm font-semibold text-[#F5F5F7] mb-1 truncate">{t.fullName}</p>
                  <p className="text-xs text-[#8A8A93] mb-3">
                    {t.wins}–{t.losses} · L10 {t.l10}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4B560] to-[#E8C770]"
                        style={{ width: `${Math.max(0, t.power)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-[#D4B560]">
                      {t.power.toFixed(1)}
                    </span>
                  </div>
                  <p className={`text-[10px] font-bold tracking-[0.15em] uppercase ${
                    t.playoffStatus === "alive" ? "text-[#34D399]" : "text-[#6E6E76]"
                  }`}>
                    {t.playoffStatus === "alive" && "● "}{t.playoffLabel}
                  </p>
                </Link>
              ))}
            </div>

            {/* Full list */}
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#8A8A93]" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76]">Full ranking</p>
            </div>
            <div className="floating-card no-jiggle rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-4 lg:px-6 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider w-12">
                        #
                      </th>
                      <th className="text-left px-2 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">
                        Team
                      </th>
                      <th className="text-right px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">
                        W-L
                      </th>
                      <th className="text-right px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">
                        L10
                      </th>
                      <th className="text-right px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">
                        Streak
                      </th>
                      <th className="text-left px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-4 lg:px-6 py-3 text-[#D4B560] font-medium text-xs uppercase tracking-wider">
                        Power
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-3 text-[#8A8A93] tabular-nums font-medium">
                          {t.rank}
                        </td>
                        <td className="px-2 py-3">
                          <Link
                            href={`/teams/${t.abbreviation.toLowerCase()}`}
                            className="flex items-center gap-3 no-jiggle group"
                          >
                            <TeamLogo teamId={t.id} abbreviation={t.abbreviation} size="sm" />
                            <div>
                              <p className="text-[#F5F5F7] font-medium leading-tight group-hover:text-[#D4B560] transition-colors">
                                {t.fullName}
                              </p>
                              <p className="text-[10px] text-[#6E6E76]">{t.conference}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="text-right px-3 py-3 text-[#8A8A93] tabular-nums">
                          {t.wins}–{t.losses}
                        </td>
                        <td className="text-right px-3 py-3 text-[#8A8A93] tabular-nums">{t.l10}</td>
                        <td
                          className={`text-right px-3 py-3 tabular-nums font-medium ${
                            t.streak?.startsWith("W") ? "text-[#34D399]" : "text-[#F87171]"
                          }`}
                        >
                          {t.streak}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-medium ${
                            t.playoffStatus === "alive" ? "text-[#34D399]" :
                            t.playoffStatus === "out-r2" ? "text-[#D4B560]" :
                            t.playoffStatus === "out-r1" ? "text-[#8A8A93]" :
                            "text-[#6E6E76]"
                          }`}>
                            {t.playoffLabel}
                          </span>
                        </td>
                        <td className="text-right px-4 lg:px-6 py-3 tabular-nums font-bold text-[#D4B560]">
                          {t.power.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
