"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { Skeleton } from "@/components/ui/Skeleton";

type Team = {
  teamId: number;
  tricode: string;
  city: string;
  name: string;
  displayName: string;
  score: number;
  homeAway: string;
  winner: boolean;
  linescores: string[];
};

type Player = {
  id: number;
  name: string;
  shortName: string;
  position: string;
  jersey: string;
  starter: boolean;
  didNotPlay: boolean;
  stats: string[];
};

type PlayersBlock = {
  tricode: string;
  labels: string[];
  athletes: Player[];
};

type Boxscore = {
  gameId: string;
  status: { state: string; text: string; completed: boolean };
  date: string;
  seriesText: string;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: PlayersBlock | null;
  awayPlayers: PlayersBlock | null;
};

export default function BoxscorePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const [data, setData] = useState<Boxscore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<"away" | "home">("away");

  useEffect(() => {
    fetch(`/api/games/${gameId}/boxscore`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then(setData)
      .catch(() => setError("Couldn't load this game."));
  }, [gameId]);

  if (error) {
    return (
      <div className="px-4 lg:px-12 py-16 max-w-6xl mx-auto">
        <Link href="/scores" className="inline-flex items-center gap-1 text-sm text-[#8A8A93] hover:text-[#F5F5F7] mb-8">
          <ArrowLeft size={14} /> Back to scores
        </Link>
        <p className="text-[#8A8A93]">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 lg:px-12 py-10 lg:py-16 max-w-6xl mx-auto">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const dateStr = data.date
    ? new Date(data.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const activeBlock = activeTeam === "away" ? data.awayPlayers : data.homePlayers;
  const activeTeamInfo = activeTeam === "away" ? data.awayTeam : data.homeTeam;

  return (
    <div className="pb-24 lg:pb-12">
      <section className="px-4 lg:px-12 pt-10 lg:pt-16 max-w-6xl mx-auto" data-reveal>
        {/* Back link */}
        <Link
          href="/scores"
          className="inline-flex items-center gap-1 text-sm text-[#8A8A93] hover:text-[#F5F5F7] mb-6"
        >
          <ArrowLeft size={14} /> Back to scores
        </Link>

        {/* Status eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`text-xs font-bold tracking-[0.2em] uppercase ${
              data.status.state === "post"
                ? "text-[#8A8A93]"
                : data.status.state === "in"
                ? "text-[#34D399]"
                : "text-[#D4B560]"
            }`}
          >
            {data.status.text}
          </span>
          {data.seriesText && (
            <>
              <span className="text-[#3F3F46]">·</span>
              <span className="text-xs text-[#8A8A93]">{data.seriesText}</span>
            </>
          )}
          <span className="text-[#3F3F46]">·</span>
          <span className="text-xs text-[#8A8A93]">{dateStr}</span>
        </div>

        {/* Matchup card */}
        <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-10 mb-10">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 lg:gap-12 items-center">
            {/* Away team */}
            <Link
              href={`/teams/${data.awayTeam.tricode.toLowerCase()}`}
              className="flex flex-col items-center text-center gap-3 group no-jiggle"
            >
              <TeamLogo
                teamId={data.awayTeam.teamId}
                abbr={data.awayTeam.tricode}
                size="xl"
                className="group-hover:scale-105 transition-transform"
              />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                  {data.awayTeam.tricode}
                </p>
                <p className="font-[family-name:var(--font-barlow)] font-bold text-xl lg:text-2xl tracking-tight text-[#F5F5F7] mt-1">
                  {data.awayTeam.name}
                </p>
              </div>
            </Link>

            {/* Score */}
            <div className="text-center">
              <div className="flex items-baseline gap-3 lg:gap-6">
                <span
                  className={`font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-tight ${
                    data.awayTeam.winner ? "text-[#F5F5F7]" : "text-[#6E6E76]"
                  }`}
                >
                  {data.awayTeam.score}
                </span>
                <span className="text-[#3F3F46] text-2xl lg:text-3xl">·</span>
                <span
                  className={`font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-tight ${
                    data.homeTeam.winner ? "text-[#F5F5F7]" : "text-[#6E6E76]"
                  }`}
                >
                  {data.homeTeam.score}
                </span>
              </div>
            </div>

            {/* Home team */}
            <Link
              href={`/teams/${data.homeTeam.tricode.toLowerCase()}`}
              className="flex flex-col items-center text-center gap-3 group no-jiggle"
            >
              <TeamLogo
                teamId={data.homeTeam.teamId}
                abbr={data.homeTeam.tricode}
                size="xl"
                className="group-hover:scale-105 transition-transform"
              />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
                  {data.homeTeam.tricode}
                </p>
                <p className="font-[family-name:var(--font-barlow)] font-bold text-xl lg:text-2xl tracking-tight text-[#F5F5F7] mt-1">
                  {data.homeTeam.name}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Empty state for upcoming games */}
        {data.status.state === "pre" && (
          <div className="floating-card no-jiggle rounded-2xl p-10 text-center">
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
              Tip-off
            </p>
            <p className="text-2xl font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7] mb-3">
              {data.status.text}
            </p>
            <p className="text-sm text-[#8A8A93] max-w-md mx-auto">
              Box score, player stats, and quarter-by-quarter scoring will be available once the game begins.
            </p>
          </div>
        )}

        {/* Quarter scoring */}
        {data.status.state !== "pre" && (data.awayTeam.linescores.length > 0 || data.homeTeam.linescores.length > 0) && (
          <div className="mb-12">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4">
              Quarter scoring
            </h2>
            <div className="floating-card no-jiggle rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 lg:px-6 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider">
                      Team
                    </th>
                    {data.awayTeam.linescores.map((_, i) => (
                      <th
                        key={i}
                        className="text-right px-3 lg:px-4 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider"
                      >
                        Q{i + 1}
                      </th>
                    ))}
                    <th className="text-right px-4 lg:px-6 py-3 text-[#F5F5F7] font-medium text-xs uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[data.awayTeam, data.homeTeam].map((team) => (
                    <tr key={team.tricode} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 lg:px-6 py-3 flex items-center gap-2">
                        <TeamLogo teamId={team.teamId} abbr={team.tricode} size="xs" />
                        <span className="text-[#F5F5F7] font-medium">{team.tricode}</span>
                      </td>
                      {team.linescores.map((q, i) => (
                        <td key={i} className="text-right px-3 lg:px-4 py-3 text-[#8A8A93] tabular-nums">
                          {q}
                        </td>
                      ))}
                      <td
                        className={`text-right px-4 lg:px-6 py-3 font-bold tabular-nums ${
                          team.winner ? "text-[#F5F5F7]" : "text-[#8A8A93]"
                        }`}
                      >
                        {team.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Boxscore */}
        {data.status.state !== "pre" && (data.awayPlayers || data.homePlayers) && (
          <div>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4">
              Boxscore
            </h2>

            {/* Team toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-white/[0.03] rounded-full mb-4">
              <button
                onClick={() => setActiveTeam("away")}
                className={`no-jiggle flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTeam === "away" ? "bg-white text-[#0A0A0E]" : "text-[#8A8A93] hover:text-[#F5F5F7]"
                }`}
              >
                <TeamLogo teamId={data.awayTeam.teamId} abbr={data.awayTeam.tricode} size="xs" />
                {data.awayTeam.tricode}
              </button>
              <button
                onClick={() => setActiveTeam("home")}
                className={`no-jiggle flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTeam === "home" ? "bg-white text-[#0A0A0E]" : "text-[#8A8A93] hover:text-[#F5F5F7]"
                }`}
              >
                <TeamLogo teamId={data.homeTeam.teamId} abbr={data.homeTeam.tricode} size="xs" />
                {data.homeTeam.tricode}
              </button>
            </div>

            {/* Stats table */}
            {activeBlock && (
              <div className="floating-card no-jiggle rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left px-4 lg:px-6 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider sticky left-0 bg-[#131318]">
                          Player
                        </th>
                        {activeBlock.labels.map((lbl) => (
                          <th
                            key={lbl}
                            className="text-right px-2 lg:px-3 py-3 text-[#6E6E76] font-medium text-xs uppercase tracking-wider"
                          >
                            {lbl}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeBlock.athletes
                        .filter((p) => !p.didNotPlay)
                        .map((p) => (
                          <tr key={p.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 lg:px-6 py-3 sticky left-0 bg-[#131318]">
                              <div className="flex items-center gap-2 min-w-[180px]">
                                <PlayerAvatar playerId={p.id} fullName={p.name} size="sm" />
                                <div>
                                  <p className="text-[#F5F5F7] font-medium leading-tight">
                                    {p.shortName || p.name}
                                  </p>
                                  <p className="text-[10px] text-[#6E6E76]">
                                    {p.starter ? "Starter · " : ""}
                                    {p.position}
                                  </p>
                                </div>
                              </div>
                            </td>
                            {p.stats.map((s, i) => (
                              <td
                                key={i}
                                className={`text-right px-2 lg:px-3 py-3 tabular-nums ${
                                  i === 1 ? "text-[#F5F5F7] font-semibold" : "text-[#8A8A93]"
                                }`}
                              >
                                {s}
                              </td>
                            ))}
                          </tr>
                        ))}
                      {activeBlock.athletes.filter((p) => p.didNotPlay).length > 0 && (
                        <tr className="border-t border-white/[0.04]">
                          <td colSpan={activeBlock.labels.length + 1} className="px-4 lg:px-6 py-2 text-[10px] uppercase tracking-wider text-[#6E6E76]">
                            DNP: {activeBlock.athletes.filter((p) => p.didNotPlay).map((p) => p.shortName || p.name).join(", ")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
