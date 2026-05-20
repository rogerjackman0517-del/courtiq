"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/Skeleton";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerCard } from "@/components/players/PlayerCard";
import { useFavoriteTeam } from "@/lib/useFavoriteTeam";
import { usePinnedPlayers } from "@/lib/usePinnedPlayers";
import { useBracketPicks, seriesKey } from "@/lib/useBracketPicks";
import { ArrowUpRight, Calendar, Star } from "lucide-react";

type Player = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  teamId?: number;
  pts: number;
  reb: number;
  ast: number;
  fgPct: number;
};

type Team = {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  slug: string;
  fullName: string;
  conference: string;
  confRank: number;
  wins: number;
  losses: number;
  winPct: number;
  streak: string;
  l10: string;
  primaryColor: string;
};

type Game = {
  gameId: string;
  gameStatus: number;
  gameStatusText: string;
  awayTeam: { teamTricode: string; teamCity: string; teamName: string; score: number };
  homeTeam: { teamTricode: string; teamCity: string; teamName: string; score: number };
};

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { team: favoriteAbbr, setTeam } = useFavoriteTeam();
  const { pinned } = usePinnedPlayers();
  const { picks } = useBracketPicks();

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/players/with-stats").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/teams/with-records").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/games/today").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([p, t, g]) => {
        if (Array.isArray(p)) setPlayers(p);
        if (Array.isArray(t)) setTeams(t);
        if (g?.scoreboard?.games) setGames(g.scoreboard.games);
      })
      .finally(() => setLoadingData(false));
  }, []);

  if (!isLoaded || loadingData) {
    return (
      <div className="px-4 lg:px-12 pt-10 lg:pt-16 pb-24 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="px-4 lg:px-12 pt-10 lg:pt-20 pb-24 max-w-3xl mx-auto text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">Dashboard</p>
        <h1 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-6xl tracking-[-0.04em] text-[#F5F5F7] mb-4">
          Sign in to see <span className="text-[#D4B560]">your CourtIQ.</span>
        </h1>
        <p className="text-base text-[#8A8A93] max-w-xl mx-auto mb-8">
          Your favorite team, pinned players, and bracket picks all in one place.
        </p>
        <Link
          href="/login"
          className="ripple inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-6 py-3 rounded-full hover:bg-white"
        >
          Sign in
          <ArrowUpRight size={14} />
        </Link>
      </div>
    );
  }

  const favorite = teams.find((t) => t.abbreviation === favoriteAbbr);
  const pinnedPlayers = pinned
    .map((slug) => players.find((p) => p.slug === slug))
    .filter((p): p is Player => !!p);

  const favoriteGames = games.filter(
    (g) =>
      g.awayTeam.teamTricode === favoriteAbbr || g.homeTeam.teamTricode === favoriteAbbr
  );

  const totalPicks = Object.keys(picks).length;

  return (
    <div className="pb-24 lg:pb-12 premium-fade-in">
      <section className="brand-glow px-4 lg:px-12 pt-10 lg:pt-16 pb-8" data-reveal>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4B560] mb-3">
            Welcome back
          </p>
          <h1 className="font-[family-name:var(--font-barlow)] font-black text-4xl lg:text-6xl tracking-[-0.04em] text-[#F5F5F7] mb-3 leading-[0.95]">
            {user?.firstName ?? "Your"}&apos;s <span className="text-[#D4B560]">dashboard.</span>
          </h1>
        </div>
      </section>

      <section className="px-4 lg:px-12 pb-16" data-reveal data-reveal-delay="1">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Favorite team */}
          <div className="floating-card rounded-3xl p-6 bg-gradient-to-br from-[#1C1C24] to-[#131318] relative overflow-hidden">
            {favorite && (
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 30%, ${favorite.primaryColor}55 0%, transparent 60%)` }}
              />
            )}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560]">
                  Your team
                </p>
                <select
                  value={favoriteAbbr}
                  onChange={(e) => setTeam(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1 text-xs text-[#F5F5F7] outline-none"
                >
                  {teams
                    .slice()
                    .sort((a, b) => a.abbreviation.localeCompare(b.abbreviation))
                    .map((t) => (
                      <option key={t.id} value={t.abbreviation} className="bg-[#0A0A0E]">
                        {t.city} {t.name}
                      </option>
                    ))}
                </select>
              </div>
              {favorite ? (
                <Link href={`/teams/${favorite.slug}`} className="flex items-center gap-4 group">
                  <TeamLogo
                    teamId={favorite.id}
                    abbreviation={favorite.abbreviation}
                    primaryColor={favorite.primaryColor}
                    size="xl"
                  />
                  <div>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-3xl tracking-tight text-[#F5F5F7] group-hover:text-[#D4B560] transition-colors">
                      {favorite.city} {favorite.name}
                    </p>
                    <p className="text-sm text-[#8A8A93]">
                      {favorite.wins}-{favorite.losses} · #{favorite.confRank} {favorite.conference} · {favorite.streak}
                    </p>
                    {favorite.l10 && (
                      <p className="text-xs text-[#6E6E76] mt-1">L10: {favorite.l10}</p>
                    )}
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-[#8A8A93]">Team data loading…</p>
              )}
              {favoriteGames.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/[0.04]">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2 inline-flex items-center gap-1.5">
                    <Calendar size={11} />
                    Today
                  </p>
                  {favoriteGames.map((g) => (
                    <Link
                      key={g.gameId}
                      href={`/scores/${g.gameId}`}
                      className="block text-sm text-[#F5F5F7] hover:text-[#D4B560]"
                    >
                      {g.awayTeam.teamTricode} {g.awayTeam.score} · {g.homeTeam.teamTricode} {g.homeTeam.score}
                      <span className="ml-2 text-xs text-[#6E6E76]">{g.gameStatusText}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bracket picks summary */}
          <div className="floating-card rounded-3xl p-6 bg-gradient-to-br from-[#1C1C24] to-[#131318]">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-4">
              Your bracket
            </p>
            {totalPicks > 0 ? (
              <>
                <p className="font-[family-name:var(--font-barlow)] font-black text-4xl text-[#F5F5F7] mb-1 tabular-nums">
                  {totalPicks} picks
                </p>
                <p className="text-sm text-[#8A8A93] mb-4">made across the 2026 playoffs.</p>
                <Link
                  href="/playoffs"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4B560] hover:text-[#F5F5F7]"
                >
                  Review &amp; update
                  <ArrowUpRight size={13} />
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-[#8A8A93] mb-4">
                  You haven&apos;t made any playoff picks yet. Try your hand at the bracket.
                </p>
                <Link
                  href="/playoffs"
                  className="ripple inline-flex items-center gap-2 bg-[#F5F5F7] text-[#0A0A0E] text-sm font-semibold tracking-tight px-5 py-2.5 rounded-full hover:bg-white"
                >
                  Make picks
                  <ArrowUpRight size={13} />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Pinned players */}
        {pinnedPlayers.length > 0 && (
          <div className="max-w-6xl mx-auto mt-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4B560] inline-flex items-center gap-1.5">
                <Star size={11} className="fill-[#D4B560] text-[#D4B560]" />
                Pinned players
              </p>
              <Link href="/players" className="text-xs text-[#8A8A93] hover:text-[#F5F5F7]">
                Manage →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedPlayers.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Suppress unused-var lint */}
      {(() => { void seriesKey; return null; })()}
    </div>
  );
}
