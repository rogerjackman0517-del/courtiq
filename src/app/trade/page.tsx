"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowLeftRight, Sparkles, TrendingUp, TrendingDown, Share2 } from "lucide-react";
import { useCopyToClipboard } from "@/components/ui/Toast";
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

type Team = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  fullName: string;
  slug: string;
  conference: string;
  confRank: number;
  wins: number;
  losses: number;
  winPct: number;
  streak: string;
  l10: string;
  primaryColor: string;
};

// PER-style player value. Tuned so a 25/5/5 scorer lands around 35-40
// and an MVP-level 30/10/10 player lands around 65-70.
function playerValue(p: Player): number {
  return (
    p.pts * 1.0 +
    p.reb * 1.2 +
    p.ast * 1.5 +
    p.stl * 3.0 +
    p.blk * 3.0 +
    (p.fgPct - 0.45) * 40 +
    (p.fg3Pct - 0.35) * 25 +
    (p.ftPct - 0.75) * 15
  );
}

// 1 value point ≈ 0.25 wins over a full 82-game season.
const WINS_PER_VALUE_POINT = 0.25;

function projectedWins(team: Team, valueDelta: number): number {
  const projWins = team.wins + valueDelta * WINS_PER_VALUE_POINT;
  return Math.max(0, Math.min(82, projWins));
}

function recomputeStandings(teams: Team[], swaps: Record<string, number>): Team[] {
  // swaps: teamAbbr -> valueDelta. Returns new sorted list with projected records.
  const adjusted = teams.map((t) => {
    const delta = swaps[t.abbreviation] ?? 0;
    const newWins = projectedWins(t, delta);
    const totalGames = t.wins + t.losses;
    const newLosses = Math.max(0, totalGames - newWins);
    const newPct = totalGames ? newWins / totalGames : 0;
    return { ...t, wins: newWins, losses: newLosses, winPct: newPct };
  });
  // Re-rank within each conference.
  const byConf: Record<string, Team[]> = {};
  adjusted.forEach((t) => {
    (byConf[t.conference] ||= []).push(t);
  });
  Object.values(byConf).forEach((list) => {
    list.sort((a, b) => b.winPct - a.winPct);
    list.forEach((t, i) => {
      t.confRank = i + 1;
    });
  });
  return adjusted;
}

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
          <p className="text-xs text-[#6E6E76]">
            {selected.pts.toFixed(1)} / {selected.reb.toFixed(1)} / {selected.ast.toFixed(1)}
          </p>
          <div className="mt-4 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
              Trade value
            </p>
            <p
              className="font-[family-name:var(--font-barlow)] font-black text-2xl tabular-nums"
              style={{ color }}
            >
              {playerValue(selected).toFixed(1)}
            </p>
          </div>
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
                    {p.teamAbbr} · {p.pts.toFixed(1)} PPG · val {playerValue(p).toFixed(1)}
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

function TeamImpactCard({
  team,
  newWins,
  newLosses,
  newRank,
  oldRank,
  valueDelta,
  incoming,
  outgoing,
  accent,
}: {
  team: Team;
  newWins: number;
  newLosses: number;
  newRank: number;
  oldRank: number;
  valueDelta: number;
  incoming: Player;
  outgoing: Player;
  accent: string;
}) {
  const winDelta = newWins - team.wins;
  const rankDelta = oldRank - newRank; // positive = moved up
  const winsLabel = newWins.toFixed(1);

  return (
    <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: accent }}
      />
      <div className="flex items-center gap-3 mb-5">
        <TeamLogo teamId={team.id} abbreviation={team.abbreviation} size="sm" />
        <div>
          <p className="font-[family-name:var(--font-barlow)] font-bold text-xl text-[#F5F5F7] leading-tight">
            {team.fullName}
          </p>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76]">
            {team.conference === "East" ? "Eastern" : "Western"} Conf
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-1">
            Before
          </p>
          <p className="font-[family-name:var(--font-barlow)] font-bold text-2xl text-[#8A8A93] tabular-nums">
            {team.wins}-{team.losses}
          </p>
          <p className="text-xs text-[#6E6E76]">#{oldRank} seed</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-1">
            After
          </p>
          <p
            className="font-[family-name:var(--font-barlow)] font-bold text-2xl tabular-nums"
            style={{ color: accent }}
          >
            {winsLabel}-{newLosses.toFixed(1)}
          </p>
          <p className="text-xs text-[#6E6E76]">#{newRank} seed</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.04] mb-4">
        <div className="flex items-center gap-2">
          {winDelta >= 0 ? (
            <TrendingUp size={14} style={{ color: accent }} />
          ) : (
            <TrendingDown size={14} className="text-[#F87171]" />
          )}
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#8A8A93]">
            Projection
          </span>
        </div>
        <div className="text-right">
          <p
            className="font-[family-name:var(--font-barlow)] font-black text-lg tabular-nums"
            style={{ color: winDelta >= 0 ? accent : "#F87171" }}
          >
            {winDelta >= 0 ? "+" : ""}
            {winDelta.toFixed(1)} wins
          </p>
          {rankDelta !== 0 && (
            <p className="text-[10px] text-[#6E6E76]">
              {rankDelta > 0 ? `up ${rankDelta} seed${rankDelta > 1 ? "s" : ""}` : `down ${Math.abs(rankDelta)} seed${Math.abs(rankDelta) > 1 ? "s" : ""}`}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
          <span className="text-[#8A8A93]">Acquires</span>
          <span className="text-[#F5F5F7] font-medium">{incoming.fullName}</span>
          <span className="text-[#6E6E76]">(val {playerValue(incoming).toFixed(1)})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F87171]" />
          <span className="text-[#8A8A93]">Sends</span>
          <span className="text-[#F5F5F7] font-medium">{outgoing.fullName}</span>
          <span className="text-[#6E6E76]">(val {playerValue(outgoing).toFixed(1)})</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[#6E6E76]">Net value</span>
          <span
            className="font-bold tabular-nums"
            style={{ color: valueDelta >= 0 ? accent : "#F87171" }}
          >
            {valueDelta >= 0 ? "+" : ""}
            {valueDelta.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function tradeVerdict(
  teamA: Team,
  teamB: Team,
  playerA: Player,
  playerB: Player,
  valueDeltaA: number
): string {
  const aName = teamA.name || teamA.abbreviation;
  const bName = teamB.name || teamB.abbreviation;
  const aPlayer = playerA.fullName.split(" ").pop();
  const bPlayer = playerB.fullName.split(" ").pop();
  const abs = Math.abs(valueDeltaA);

  if (abs < 2) {
    return `Even swap. The ${aName} and ${bName} both come away with comparable production — this trade is essentially a wash.`;
  }
  if (abs < 6) {
    const winner = valueDeltaA > 0 ? aName : bName;
    const gained = valueDeltaA > 0 ? bPlayer : aPlayer;
    return `Slight edge to the ${winner}. Adding ${gained} nudges them forward, but it's a fair trade — both sides can live with it.`;
  }
  if (abs < 12) {
    const winner = valueDeltaA > 0 ? aName : bName;
    const loser = valueDeltaA > 0 ? bName : aName;
    const gained = valueDeltaA > 0 ? bPlayer : aPlayer;
    return `The ${winner} win this trade. ${gained} is a clear upgrade in their direction — the ${loser} front office would need a strong reason to make this deal.`;
  }
  const winner = valueDeltaA > 0 ? aName : bName;
  const loser = valueDeltaA > 0 ? bName : aName;
  const gained = valueDeltaA > 0 ? bPlayer : aPlayer;
  return `Heist. The ${winner} fleece the ${loser} — ${gained} is on another level here and reshapes the conference.`;
}

export default function TradePage() {
  const router = useRouter();
  const copy = useCopyToClipboard();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerA, setPlayerA] = useState<Player | null>(null);
  const [playerB, setPlayerB] = useState<Player | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/players/with-stats").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/teams/with-records").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([playerData, teamData]: [Player[], Team[]]) => {
        setPlayers(playerData);
        setTeams(teamData);
        const url = new URL(window.location.href);
        const aSlug = url.searchParams.get("a");
        const bSlug = url.searchParams.get("b");
        if (aSlug) setPlayerA(playerData.find((p) => p.slug === aSlug) || null);
        if (bSlug) setPlayerB(playerData.find((p) => p.slug === bSlug) || null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (playerA) params.set("a", playerA.slug);
    if (playerB) params.set("b", playerB.slug);
    const qs = params.toString();
    router.replace(qs ? `/trade?${qs}` : "/trade", { scroll: false });
  }, [playerA, playerB, router]);

  const teamsByAbbr = useMemo(() => {
    const map: Record<string, Team> = {};
    teams.forEach((t) => {
      map[t.abbreviation] = t;
    });
    return map;
  }, [teams]);

  const sameTeam =
    playerA && playerB && playerA.teamAbbr === playerB.teamAbbr;

  const teamA = playerA ? teamsByAbbr[playerA.teamAbbr] : null;
  const teamB = playerB ? teamsByAbbr[playerB.teamAbbr] : null;
  const canTrade = playerA && playerB && teamA && teamB && !sameTeam;

  const projection = useMemo(() => {
    if (!canTrade || !playerA || !playerB || !teamA || !teamB) return null;
    const valueA = playerValue(playerA);
    const valueB = playerValue(playerB);
    const valueDeltaA = valueB - valueA;
    const valueDeltaB = -valueDeltaA;

    const newStandings = recomputeStandings(teams, {
      [teamA.abbreviation]: valueDeltaA,
      [teamB.abbreviation]: valueDeltaB,
    });

    const newTeamA = newStandings.find((t) => t.abbreviation === teamA.abbreviation)!;
    const newTeamB = newStandings.find((t) => t.abbreviation === teamB.abbreviation)!;

    return {
      valueDeltaA,
      valueDeltaB,
      newTeamA,
      newTeamB,
    };
  }, [canTrade, playerA, playerB, teamA, teamB, teams]);

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-16 max-w-6xl mx-auto" data-reveal>
        <div className="mb-10 lg:mb-14">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Trade Machine
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-[#F5F5F7] mb-3">
            Pull the <span className="text-[#D4B560]">trigger.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8A8A93] max-w-xl">
            Swap any two players and see how the standings shift. We project win totals from each player&apos;s production.
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
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 items-stretch mb-10 lg:mb-14">
              <PlayerPicker
                label="Team A sends"
                selected={playerA}
                players={players}
                onSelect={setPlayerA}
                onClear={() => setPlayerA(null)}
                color="#D4B560"
              />
              <div className="hidden md:flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const a = playerA;
                    setPlayerA(playerB);
                    setPlayerB(a);
                  }}
                  disabled={!playerA && !playerB}
                  className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8A8A93] hover:text-[#D4B560] hover:border-[#D4B560]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Swap sides"
                  title="Swap sides"
                >
                  <ArrowLeftRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (players.length < 4) return;
                    const stars = [...players].sort((a, b) => b.pts - a.pts).slice(0, 30);
                    const a = stars[Math.floor(Math.random() * stars.length)];
                    let b = stars[Math.floor(Math.random() * stars.length)];
                    let safety = 0;
                    while ((b.teamAbbr === a.teamAbbr || b.id === a.id) && safety < 10) {
                      b = stars[Math.floor(Math.random() * stars.length)];
                      safety++;
                    }
                    setPlayerA(a);
                    setPlayerB(b);
                  }}
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#D4B560] hover:text-[#F5F5F7] no-jiggle"
                  title="Random trade"
                >
                  Surprise me
                </button>
              </div>
              <PlayerPicker
                label="Team B sends"
                selected={playerB}
                players={players}
                onSelect={setPlayerB}
                onClear={() => setPlayerB(null)}
                color="#5B8DEF"
              />
            </div>

            {sameTeam && (
              <div className="floating-card no-jiggle rounded-3xl p-6 mb-8 border border-[#F87171]/20">
                <p className="text-sm text-[#F87171] font-medium">
                  Both players are on the {playerA?.teamAbbr}. Pick players from different teams.
                </p>
              </div>
            )}

            {canTrade && projection && teamA && teamB && playerA && playerB ? (
              <>
                <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8 mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4B560]/[0.04] to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#D4B560]" />
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560]">
                          The verdict
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(window.location.href, "Trade link copied")}
                        className="ripple inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/[0.05] transition-colors"
                        aria-label="Copy trade link"
                      >
                        <Share2 size={12} /> Share
                      </button>
                    </div>
                    <p className="text-base lg:text-lg leading-relaxed text-[#F5F5F7] font-medium">
                      {tradeVerdict(teamA, teamB, playerA, playerB, projection.valueDeltaA)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8">
                  <TeamImpactCard
                    team={teamA}
                    newWins={projection.newTeamA.wins}
                    newLosses={projection.newTeamA.losses}
                    newRank={projection.newTeamA.confRank}
                    oldRank={teamA.confRank}
                    valueDelta={projection.valueDeltaA}
                    incoming={playerB}
                    outgoing={playerA}
                    accent="#D4B560"
                  />
                  <TeamImpactCard
                    team={teamB}
                    newWins={projection.newTeamB.wins}
                    newLosses={projection.newTeamB.losses}
                    newRank={projection.newTeamB.confRank}
                    oldRank={teamB.confRank}
                    valueDelta={projection.valueDeltaB}
                    incoming={playerA}
                    outgoing={playerB}
                    accent="#5B8DEF"
                  />
                </div>

                <div className="floating-card no-jiggle rounded-3xl p-6 lg:p-8">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-4">
                    How we calculate this
                  </p>
                  <p className="text-sm text-[#8A8A93] leading-relaxed">
                    Each player gets a trade value score weighted by per-game production
                    (points, rebounds, assists, steals, blocks) with shooting efficiency bonuses.
                    The difference in values between the two players is translated into projected wins
                    at roughly 0.25 wins per value point over an 82-game season. Conference seeds
                    are recomputed from the new win totals.
                  </p>
                </div>
              </>
            ) : !sameTeam ? (
              <div className="floating-card no-jiggle rounded-3xl p-10 lg:p-16 text-center">
                <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
                  Build a trade
                </p>
                <p className="text-xl lg:text-2xl font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7] mb-3">
                  Pick a player from each side
                </p>
                <p className="text-sm text-[#8A8A93] max-w-md mx-auto">
                  Choose two players from different teams. We&apos;ll project the new standings and tell you who wins the deal.
                </p>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
