"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { useFavoriteTeam } from "@/lib/useFavoriteTeam";
import { useBracketPicks, seriesKey } from "@/lib/useBracketPicks";
import { Check, RotateCcw } from "lucide-react";

type Team = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  slug: string;
  primaryColor: string;
};

type SeriesResult = "won" | "lost" | "tied" | "tbd";

type Series = {
  /** Abbr of either team. The winner is marked with `result: "won"`. */
  high: string; // higher seed
  low: string;  // lower seed
  score: string; // "4-0", "2-2", "TBD"
  winner: string | null; // null = ongoing or tbd
  note?: string;
};

// 2026 playoffs — kept in sync with backend/routes/teams.py PLAYOFF_STATUS_2026
// (Update both maps together when series change.)
const EAST_R1: Series[] = [
  { high: "BOS", low: "PHI", score: "3-4", winner: "PHI", note: "Sixers came back from 3-1 down" },
  { high: "NYK", low: "ATL", score: "4-2", winner: "NYK" },
  { high: "CLE", low: "TOR", score: "4-3", winner: "CLE" },
  { high: "DET", low: "ORL", score: "4-3", winner: "DET", note: "Pistons stormed back from 3-1" },
];
const EAST_R2: Series[] = [
  { high: "NYK", low: "PHI", score: "4-0", winner: "NYK", note: "Sweep" },
  { high: "CLE", low: "DET", score: "2-2", winner: null, note: "Series tied" },
];

const WEST_R1: Series[] = [
  { high: "OKC", low: "PHX", score: "4-0", winner: "OKC", note: "Sweep" },
  { high: "LAL", low: "HOU", score: "4-2", winner: "LAL" },
  { high: "MIN", low: "DEN", score: "4-3", winner: "MIN" },
  { high: "SAS", low: "POR", score: "4-1", winner: "SAS" },
];
const WEST_R2: Series[] = [
  { high: "OKC", low: "LAL", score: "4-1", winner: "OKC" },
  { high: "MIN", low: "SAS", score: "2-2", winner: null, note: "Series tied" },
];

const PENDING_LABEL = "TBD";

function teamFor(map: Record<string, Team>, abbr: string | null): Team | null {
  if (!abbr) return null;
  // ESPN 2-letter -> NBA 3-letter
  const norm =
    abbr === "SA" ? "SAS" :
    abbr === "NY" ? "NYK" :
    abbr === "NO" ? "NOP" :
    abbr === "GS" ? "GSW" :
    abbr;
  return map[norm] ?? null;
}

function SeriesCard({
  series,
  teamMap,
  align = "left",
  favorite,
  predictionsOn,
  round,
  userPick,
  onPick,
}: {
  series: Series;
  teamMap: Record<string, Team>;
  align?: "left" | "right";
  favorite?: string;
  predictionsOn?: boolean;
  round?: "r1" | "r2" | "cf" | "finals";
  userPick?: string;
  onPick?: (team: string) => void;
}) {
  const hasFavorite = favorite && (series.high === favorite || series.low === favorite);
  const canPick = predictionsOn && !series.winner && series.high !== "TBD" && series.low !== "TBD";
  const pickCorrect = userPick && series.winner && userPick === series.winner;
  const pickWrong = userPick && series.winner && userPick !== series.winner;
  const high = teamFor(teamMap, series.high);
  const low = teamFor(teamMap, series.low);
  const [score1, score2] = series.score.split("-");
  const isLive = series.winner === null && series.score !== PENDING_LABEL;
  const flex = align === "right" ? "flex-row-reverse text-right" : "flex-row";

  function Row({ team, score, won, teamAbbr }: { team: Team | null; score: string; won: boolean; teamAbbr: string }) {
    const isUserPick = userPick === teamAbbr;
    const interactive = canPick && !!team;
    return (
      <div
        className={`flex items-center gap-3 ${flex} ${won || isUserPick ? "" : "opacity-60"} ${
          interactive ? "cursor-pointer rounded-lg -mx-1 px-1 py-0.5 hover:bg-white/[0.03]" : ""
        } ${isUserPick ? "ring-1 ring-[#D4B560]/40 rounded-lg -mx-1 px-1 py-0.5" : ""}`}
        onClick={
          interactive
            ? (e) => {
                e.preventDefault();
                onPick?.(teamAbbr);
              }
            : undefined
        }
      >
        {team && (
          <TeamLogo
            teamId={team.id}
            abbreviation={team.abbreviation}
            primaryColor={team.primaryColor}
            size="sm"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-[family-name:var(--font-barlow)] font-bold text-sm text-[#F5F5F7] tracking-tight truncate">
            {team ? team.name : series.high}
          </p>
          <p className="text-[10px] tracking-wider text-[#6E6E76]">
            {team?.abbreviation ?? "—"}
          </p>
        </div>
        <span
          className={`font-[family-name:var(--font-barlow)] font-black text-xl tabular-nums ${
            won ? "text-[#F5F5F7]" : "text-[#6E6E76]"
          }`}
        >
          {score}
        </span>
      </div>
    );
  }
  void round; // round is currently informational; satisfy lint

  return (
    <div
      className="floating-card no-jiggle rounded-2xl p-4 bg-gradient-to-br from-[#1C1C24] to-[#131318] w-full relative"
      style={hasFavorite ? { boxShadow: "0 0 0 1px rgba(212,181,96,0.4), 0 18px 40px -16px rgba(212,181,96,0.45)" } : undefined}
    >
      {hasFavorite && (
        <span className="absolute -top-2 -right-2 rounded-full bg-[#D4B560] text-[#0A0A0E] text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5">
          ★ Your team
        </span>
      )}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-[10px] font-bold tracking-[0.2em] uppercase ${
            isLive ? "text-[#34D399]" : series.winner ? "text-[#D4B560]" : "text-[#6E6E76]"
          }`}
        >
          {isLive ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75 animate-pulse" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
              </span>
              Active
            </span>
          ) : series.winner ? (
            "Final"
          ) : (
            "Upcoming"
          )}
        </span>
        {series.note && (
          <span className="text-[10px] text-[#6E6E76] tracking-wider truncate">{series.note}</span>
        )}
      </div>
      <div className="space-y-2">
        <Row team={high} score={score1} won={series.winner === series.high} teamAbbr={series.high} />
        <Row team={low} score={score2} won={series.winner === series.low} teamAbbr={series.low} />
      </div>
      {(pickCorrect || pickWrong) && (
        <p className={`mt-3 text-[10px] font-bold tracking-[0.15em] uppercase ${pickCorrect ? "text-[#34D399]" : "text-[#F87171]"}`}>
          {pickCorrect ? "Your pick · correct" : `Your pick · ${userPick}`}
        </p>
      )}
    </div>
  );
}

function ConferenceColumn({
  title,
  accent,
  r1,
  r2,
  teamMap,
  side,
  favorite,
  predictionsOn,
  picks,
  onPick,
}: {
  title: string;
  accent: string;
  r1: Series[];
  r2: Series[];
  teamMap: Record<string, Team>;
  side: "left" | "right";
  favorite?: string;
  predictionsOn?: boolean;
  picks: Record<string, string>;
  onPick: (key: string, team: string) => void;
}) {
  // Determine conference finals: winners of r2 if both decided, else TBD.
  const cfPair: Series = {
    high: r2[0]?.winner ?? PENDING_LABEL,
    low: r2[1]?.winner ?? PENDING_LABEL,
    score: PENDING_LABEL,
    winner: null,
    note: "Conference Finals",
  };

  return (
    <div className="flex-1 min-w-0">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center"
        style={{ color: accent }}
      >
        {title}
      </p>
      <div className="grid grid-cols-3 gap-3 lg:gap-4 items-center">
        {/* Round 1 */}
        <div className={`space-y-3 ${side === "right" ? "order-3" : ""}`}>
          {r1.map((s, i) => {
            const k = seriesKey("r1", s.high, s.low);
            return (
              <SeriesCard
                key={i}
                series={s}
                teamMap={teamMap}
                align={side}
                favorite={favorite}
                predictionsOn={predictionsOn}
                round="r1"
                userPick={picks[k]}
                onPick={(team) => onPick(k, team)}
              />
            );
          })}
        </div>
        {/* Round 2 */}
        <div className={`space-y-6 ${side === "right" ? "order-2" : ""}`}>
          {r2.map((s, i) => {
            const k = seriesKey("r2", s.high, s.low);
            return (
              <SeriesCard
                key={i}
                series={s}
                teamMap={teamMap}
                align={side}
                favorite={favorite}
                predictionsOn={predictionsOn}
                round="r2"
                userPick={picks[k]}
                onPick={(team) => onPick(k, team)}
              />
            );
          })}
        </div>
        {/* Conference Finals */}
        <div className={`${side === "right" ? "order-1" : ""}`}>
          {(() => {
            const k = seriesKey("cf", cfPair.high, cfPair.low);
            return (
              <SeriesCard
                series={cfPair}
                teamMap={teamMap}
                align={side}
                favorite={favorite}
                predictionsOn={predictionsOn}
                round="cf"
                userPick={picks[k]}
                onPick={(team) => onPick(k, team)}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}

type BracketData = {
  east: { r1: Series[]; r2: Series[] };
  west: { r1: Series[]; r2: Series[] };
};

export default function PlayoffsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { team: favorite } = useFavoriteTeam();
  const { picks, pick, clear: clearPicks } = useBracketPicks();
  const [predictionsOn, setPredictionsOn] = useState(false);
  const [bracket, setBracket] = useState<BracketData>({
    east: { r1: EAST_R1, r2: EAST_R2 },
    west: { r1: WEST_R1, r2: WEST_R2 },
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/teams/with-records").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/playoff-bracket").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([teamData, bracketData]) => {
        if (cancelled) return;
        if (Array.isArray(teamData)) setTeams(teamData);
        // Backend is authoritative; only use it when it responds cleanly.
        if (bracketData && bracketData.east && bracketData.west) {
          setBracket({
            east: { r1: bracketData.east.r1 ?? EAST_R1, r2: bracketData.east.r2 ?? EAST_R2 },
            west: { r1: bracketData.west.r1 ?? WEST_R1, r2: bracketData.west.r2 ?? WEST_R2 },
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const teamMap: Record<string, Team> = {};
  teams.forEach((t) => {
    teamMap[t.abbreviation] = t;
  });

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-20 pb-8" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Playoffs · 2026
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-5xl lg:text-7xl tracking-[-0.04em] text-[#F5F5F7] mb-4 leading-[0.95]">
            <AnimatedHeading text="Sixteen teams." />
            <br />
            <span className="text-[#D4B560]">
              <AnimatedHeading text="One trophy." startDelay={250} />
            </span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl leading-relaxed">
            Live bracket through the 2026 NBA Playoffs. Tap any team to open their page.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#34D399]" /> Active series
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#D4B560]" /> Final
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8A8A93]">
              <span className="h-2 w-2 rounded-full bg-[#6E6E76]" /> Upcoming
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-12 py-10 lg:py-16" data-reveal data-reveal-delay="1">
        <div className="max-w-7xl mx-auto">

          {/* Predictions banner */}
          {(() => {
            const allSeries: Series[] = [
              ...bracket.east.r1, ...bracket.east.r2,
              ...bracket.west.r1, ...bracket.west.r2,
            ];
            const total = Object.keys(picks).length;
            const decided = allSeries.filter((s) => s.winner);
            const round = (s: Series): "r1" | "r2" => {
              if (bracket.east.r1.includes(s) || bracket.west.r1.includes(s)) return "r1";
              return "r2";
            };
            const correct = decided.filter((s) => picks[seriesKey(round(s), s.high, s.low)] === s.winner).length;
            return (
              <div className="floating-card no-jiggle rounded-3xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560]">
                    Pick the bracket
                  </p>
                  <p className="text-sm text-[#8A8A93] mt-1">
                    {predictionsOn
                      ? "Click either team in an undecided series to set your pick."
                      : total > 0
                      ? `${correct}/${decided.length} of your picks correct so far · ${total} total picks made`
                      : "Toggle picks mode and choose a winner in any undecided series."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {total > 0 && (
                    <button
                      type="button"
                      onClick={clearPicks}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs text-[#8A8A93] hover:text-[#F5F5F7] no-jiggle"
                    >
                      <RotateCcw size={11} />
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPredictionsOn((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold no-jiggle transition-colors ${
                      predictionsOn
                        ? "bg-[#D4B560] text-[#0A0A0E]"
                        : "border border-white/[0.08] bg-white/[0.02] text-[#F5F5F7] hover:bg-white/[0.05]"
                    }`}
                  >
                    {predictionsOn ? (
                      <>
                        <Check size={12} />
                        Picks on
                      </>
                    ) : (
                      "Make picks"
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

          {loading ? (
            <div className="grid grid-cols-2 gap-8">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-start">
              <ConferenceColumn
                title="Eastern Conference"
                accent="#5B8DEF"
                r1={bracket.east.r1}
                r2={bracket.east.r2}
                teamMap={teamMap}
                side="left"
                favorite={favorite}
                predictionsOn={predictionsOn}
                picks={picks}
                onPick={pick}
              />

              {/* The Finals */}
              <div className="flex flex-col items-center justify-center min-w-[180px] lg:min-w-[220px]">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-3">
                  NBA Finals
                </p>
                <div className="floating-card no-jiggle rounded-3xl p-6 text-center bg-gradient-to-br from-[#D4B560]/15 via-[#1C1C24] to-[#131318] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(212,181,96,0.4) 0%, transparent 70%)",
                    }}
                  />
                  <div className="relative">
                    <svg viewBox="0 0 32 32" className="h-12 w-12 mx-auto mb-3">
                      <path
                        d="M9 4h14v6a7 7 0 0 1-14 0V4Zm-3 1h3v5H6V5Zm17 0h3v5h-3V5ZM12 18h8v3h2v3H10v-3h2v-3Z"
                        fill="#D4B560"
                      />
                    </svg>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-1">
                      Champion
                    </p>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-xl text-[#F5F5F7] tracking-tight">
                      TBD
                    </p>
                    <p className="text-[11px] text-[#6E6E76] mt-1">Conf finals not set</p>
                  </div>
                </div>
              </div>

              <ConferenceColumn
                title="Western Conference"
                accent="#D4B560"
                r1={bracket.west.r1}
                r2={bracket.west.r2}
                teamMap={teamMap}
                side="right"
                favorite={favorite}
                predictionsOn={predictionsOn}
                picks={picks}
                onPick={pick}
              />
            </div>
          )}

          <p className="text-xs text-[#6E6E76] mt-10 max-w-3xl tracking-wide leading-relaxed text-center mx-auto">
            Series scores are tracked manually as games are completed. Click any team to view their full profile, including roster and standings position.
          </p>

          <div className="text-center mt-6">
            <Link href="/standings" className="text-sm font-semibold text-[#8A8A93] hover:text-[#F5F5F7] transition-colors">
              See full standings →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
