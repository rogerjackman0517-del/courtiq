"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Home, Calendar, Users, Shield, Trophy, BarChart2, ArrowLeftRight, Repeat, Flame, RadioTower, Newspaper, Sparkles } from "lucide-react";
import { TeamLogo } from "@/components/teams/TeamLogo";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";

type Player = { id: number; fullName: string; slug: string; teamAbbr: string; teamId?: number; pts: number };
type Team = { id: number; abbreviation: string; fullName: string; city: string; name: string; slug: string; primaryColor: string };

type PageRoute = {
  kind: "page";
  href: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const PAGES: PageRoute[] = [
  { kind: "page", href: "/", title: "Home", icon: Home },
  { kind: "page", href: "/scores", title: "Scores", icon: Calendar },
  { kind: "page", href: "/live", title: "Live", icon: RadioTower },
  { kind: "page", href: "/players", title: "Players", icon: Users },
  { kind: "page", href: "/teams", title: "Teams", icon: Shield },
  { kind: "page", href: "/standings", title: "Standings", icon: Trophy },
  { kind: "page", href: "/power-rankings", title: "Power Rankings", icon: Flame },
  { kind: "page", href: "/stats", title: "Stat Leaders", icon: BarChart2 },
  { kind: "page", href: "/compare", title: "Compare", icon: ArrowLeftRight },
  { kind: "page", href: "/trade", title: "Trade Machine", icon: Repeat },
  { kind: "page", href: "/news", title: "News", icon: Newspaper },
];

type Hit =
  | { kind: "page"; key: string; href: string; title: string; icon: React.ComponentType<{ size?: number; className?: string }> }
  | { kind: "player"; key: string; href: string; player: Player }
  | { kind: "team"; key: string; href: string; team: Team };

const RECENT_KEY = "courtiq-recent-jumps";

type RecentJump = { kind: "player" | "team" | "page"; href: string; label: string };

function readRecents(): RecentJump[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, 5) : [];
  } catch {
    return [];
  }
}
function pushRecent(jump: RecentJump) {
  if (typeof window === "undefined") return;
  try {
    const cur = readRecents().filter((r) => r.href !== jump.href);
    const next = [jump, ...cur].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [recents, setRecents] = useState<RecentJump[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIdx(0);
    setRecents(readRecents());
    const t = setTimeout(() => inputRef.current?.focus(), 30);

    if (players.length === 0) {
      fetch("/api/players/with-stats")
        .then((r) => (r.ok ? r.json() : []))
        .then((d: Player[]) => Array.isArray(d) && setPlayers(d))
        .catch(() => {});
    }
    if (teams.length === 0) {
      fetch("/api/teams/with-records")
        .then((r) => (r.ok ? r.json() : []))
        .then((d: Team[]) => Array.isArray(d) && setTeams(d))
        .catch(() => {});
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Hit[] = [];
    if (!q) {
      PAGES.slice(0, 6).forEach((p) =>
        out.push({ kind: "page", key: `page:${p.href}`, href: p.href, title: p.title, icon: p.icon })
      );
      return out;
    }
    PAGES.forEach((p) => {
      if (p.title.toLowerCase().includes(q)) {
        out.push({ kind: "page", key: `page:${p.href}`, href: p.href, title: p.title, icon: p.icon });
      }
    });
    players
      .filter((p) => p.fullName.toLowerCase().includes(q))
      .slice(0, 6)
      .forEach((p) =>
        out.push({ kind: "player", key: `player:${p.id}`, href: `/players/${p.slug}`, player: p })
      );
    teams
      .filter((t) => t.fullName.toLowerCase().includes(q) || t.abbreviation.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((t) =>
        out.push({ kind: "team", key: `team:${t.id}`, href: `/teams/${t.slug}`, team: t })
      );
    return out.slice(0, 14);
  }, [query, players, teams]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  function go(hit: Hit) {
    setOpen(false);
    const label =
      hit.kind === "page" ? hit.title :
      hit.kind === "player" ? hit.player.fullName :
      `${hit.team.city} ${hit.team.name}`;
    pushRecent({ kind: hit.kind, href: hit.href, label });
    router.push(hit.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, hits.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = hits[activeIdx];
      if (hit) go(hit);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm premium-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0F0F16] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search size={16} className="text-[#6E6E76]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search players, teams, or jump to a page…"
            className="flex-1 bg-transparent outline-none text-sm text-[#F5F5F7] placeholder:text-[#6E6E76]"
          />
          <kbd className="text-[10px] tracking-wider text-[#6E6E76] border border-white/[0.08] rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-2">
          {!query && recents.length > 0 && (
            <li className="px-4 pt-1 pb-2">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6E6E76] mb-1">
                Recent
              </p>
              <div className="flex flex-col">
                {recents.map((r) => (
                  <button
                    key={r.href}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      pushRecent(r);
                      router.push(r.href);
                    }}
                    className="text-left text-sm text-[#F5F5F7] py-1.5 hover:text-[#D4B560] no-jiggle"
                  >
                    <span className="text-[#6E6E76] mr-2 text-[10px] uppercase tracking-wider">{r.kind}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </li>
          )}
          {hits.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[#6E6E76]">
              Nothing matches &ldquo;{query}&rdquo;
            </li>
          )}
          {hits.map((hit, i) => {
            const active = i === activeIdx;
            const cls = `flex items-center gap-3 px-4 py-2.5 cursor-pointer ${active ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"}`;
            return (
              <li
                key={hit.key}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => go(hit)}
                className={cls}
              >
                {hit.kind === "page" && (
                  <>
                    <hit.icon size={15} className="text-[#8A8A93]" />
                    <span className="flex-1 text-sm text-[#F5F5F7]">{hit.title}</span>
                    <span className="text-[10px] text-[#6E6E76] tracking-wider">PAGE</span>
                  </>
                )}
                {hit.kind === "player" && (
                  <>
                    <PlayerAvatar playerId={hit.player.id} fullName={hit.player.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F5F5F7] truncate">{hit.player.fullName}</p>
                      <p className="text-[10px] text-[#6E6E76]">{hit.player.teamAbbr} · {hit.player.pts.toFixed(1)} PPG</p>
                    </div>
                    <ArrowRight size={13} className="text-[#6E6E76]" />
                  </>
                )}
                {hit.kind === "team" && (
                  <>
                    <TeamLogo teamId={hit.team.id} abbreviation={hit.team.abbreviation} primaryColor={hit.team.primaryColor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F5F5F7] truncate">{hit.team.city} {hit.team.name}</p>
                      <p className="text-[10px] text-[#6E6E76]">{hit.team.abbreviation} · Team</p>
                    </div>
                    <ArrowRight size={13} className="text-[#6E6E76]" />
                  </>
                )}
              </li>
            );
          })}
        </ul>
        <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] tracking-wider text-[#6E6E76]">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={10} className="text-[#D4B560]" />
            Powered by CourtIQ
          </span>
          <span>
            <kbd className="border border-white/[0.08] rounded px-1 py-0.5">↑</kbd>{" "}
            <kbd className="border border-white/[0.08] rounded px-1 py-0.5">↓</kbd> navigate ·{" "}
            <kbd className="border border-white/[0.08] rounded px-1 py-0.5">↵</kbd> open
          </span>
        </div>
      </div>
    </div>
  );
}
