"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Bell, ChevronDown, Zap, X, Flame } from "lucide-react";
import { useDailyStreak } from "@/lib/useDailyStreak";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";

type PlayerHit = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  pts: number;
};

type TeamHit = {
  abbreviation: string;
  city: string;
  name: string;
  slug: string;
  fullName: string;
  wins?: number;
  losses?: number;
};

export function TopNav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [players, setPlayers] = useState<PlayerHit[]>([]);
  const [teams, setTeams] = useState<TeamHit[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { isSignedIn } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const streak = useDailyStreak();

  // Scrolled state — listen on the main scroll container AND window as a fallback
  useEffect(() => {
    const main = document.querySelector("main");
    const onScroll = () => {
      const mainTop = main ? main.scrollTop : 0;
      const winTop = window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled(Math.max(mainTop, winTop) > 8);
    };
    main?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      main?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Load data once on mount
  useEffect(() => {
    fetch("/api/players/with-stats")
      .then(r => r.ok ? r.json() : [])
      .then(d => Array.isArray(d) && setPlayers(d))
      .catch(() => {});
    fetch("/api/teams/with-records")
      .then(r => r.ok ? r.json() : [])
      .then(d => Array.isArray(d) && setTeams(d))
      .catch(() => {});
  }, []);

  // Cmd+K shortcut + click-outside to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const { playerHits, teamHits, allHits } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { playerHits: [] as PlayerHit[], teamHits: [] as TeamHit[], allHits: [] as Array<{ kind: "player"; item: PlayerHit } | { kind: "team"; item: TeamHit }> };

    const playerHits = players
      .filter(p => p.fullName.toLowerCase().includes(q) || p.teamAbbr.toLowerCase().includes(q))
      .slice(0, 6);

    const teamHits = teams
      .filter(t =>
        t.fullName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.abbreviation.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const allHits = [
      ...teamHits.map(t => ({ kind: "team" as const, item: t })),
      ...playerHits.map(p => ({ kind: "player" as const, item: p })),
    ];

    return { playerHits, teamHits, allHits };
  }, [query, players, teams]);

  // Reset active index when results change
  useEffect(() => { setActiveIndex(0); }, [query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!searchOpen || allHits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % allHits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + allHits.length) % allHits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = allHits[activeIndex];
      if (!hit) return;
      const href = hit.kind === "player" ? `/players/${hit.item.slug}` : `/teams/${hit.item.slug}`;
      router.push(href);
      setSearchOpen(false);
      setQuery("");
    }
  }

  function goTo(href: string) {
    router.push(href);
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <header className={cn("sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 h-14 topnav-blur", scrolled && "topnav-scrolled")}>
      <Link href="/" className="group flex items-center gap-1.5 lg:hidden hover:opacity-80 transition-opacity" aria-label="CourtIQ — Home">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0A0A0E] border border-[#D4B560]/40">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#D4B560" strokeWidth="2.5" strokeLinecap="round">
            <path d="M17 4 A9 9 0 1 0 17 20" />
            <circle cx="12" cy="12" r="2" fill="#D4B560" stroke="none" />
          </svg>
        </div>
        <span className="font-[family-name:var(--font-barlow)] font-bold text-lg tracking-[-0.04em] text-[#F0F0F0] group-hover:text-[#D4B560] transition-colors">
          Court<span className="text-[#D4B560]">IQ</span>
        </span>
      </Link>

      {streak >= 2 && (
        <span
          className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold tabular-nums text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-2 py-1 rounded-full"
          title={`${streak}-day visit streak`}
        >
          <Flame size={11} className="text-[#F59E0B]" />
          {streak}
        </span>
      )}
      <Link href="/scores" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded-full hover:bg-[#22C55E]/20 transition-colors">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
        </span>
        LIVE
      </Link>

      {/* Search w/ dropdown */}
      <div ref={containerRef} className="relative flex-1 max-w-md mx-auto lg:mx-0">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors cursor-text",
            searchOpen
              ? "border-[#4B7BE8] bg-[#1A1A24]"
              : "border-white/[0.06] bg-[#111118] hover:border-white/[0.12]"
          )}
          onClick={() => { setSearchOpen(true); inputRef.current?.focus(); }}
        >
          <Search size={14} className="text-[#888899] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search players, teams..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-[#F0F0F0] placeholder:text-[#888899] outline-none min-w-0"
          />
          {query ? (
            <button
              onMouseDown={e => { e.preventDefault(); setQuery(""); inputRef.current?.focus(); }}
              className="text-[#888899] hover:text-[#F0F0F0]"
            >
              <X size={12} />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-[#888899] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          )}
        </div>

        {/* Dropdown */}
        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] rounded-lg border border-white/[0.08] bg-[#111118] shadow-xl shadow-black/50 overflow-hidden max-h-[400px] overflow-y-auto">
            {allHits.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[#888899]">No results for &ldquo;{query}&rdquo;</div>
            ) : (
              <>
                {teamHits.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888899] bg-[#0A0A0F]">Teams</div>
                    {teamHits.map((t, i) => {
                      const overallIdx = i;
                      const isActive = overallIdx === activeIndex;
                      return (
                        <button
                          key={t.slug}
                          onMouseDown={e => { e.preventDefault(); goTo(`/teams/${t.slug}`); }}
                          onMouseEnter={() => setActiveIndex(overallIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                            isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                          )}
                        >
                          <span className="text-[10px] font-black text-[#888899] w-9">{t.abbreviation}</span>
                          <span className="flex-1 text-sm text-[#F0F0F0] truncate">{t.city} {t.name}</span>
                          {t.wins != null && t.losses != null && (
                            <span className="text-[10px] text-[#888899]">{t.wins}-{t.losses}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {playerHits.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888899] bg-[#0A0A0F]">Players</div>
                    {playerHits.map((p, i) => {
                      const overallIdx = teamHits.length + i;
                      const isActive = overallIdx === activeIndex;
                      return (
                        <button
                          key={p.id}
                          onMouseDown={e => { e.preventDefault(); goTo(`/players/${p.slug}`); }}
                          onMouseEnter={() => setActiveIndex(overallIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                            isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                          )}
                        >
                          <span className="text-[10px] font-black text-[#888899] w-9">{p.teamAbbr}</span>
                          <span className="flex-1 text-sm text-[#F0F0F0] truncate">{p.fullName}</span>
                          <span className="text-[10px] text-[#888899]">{p.pts.toFixed(1)} ppg</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#888899] px-2 py-1">
          2025-26
        </span>

        <Link href="/news" aria-label="News" className="relative p-2 text-[#888899] hover:text-[#F0F0F0] hover:bg-white/[0.04] rounded-lg transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#C8A84B]"></span>
        </Link>

        {isSignedIn ? (
          <>
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A8A93] hover:text-[#F5F5F7] px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                variables: { colorPrimary: "#C8A84B" },
                elements: { avatarBox: "h-8 w-8" },
              }}
            />
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#C8A84B] text-black px-3 py-1.5 rounded-lg hover:bg-[#D4B55F] transition-colors"
          >
            <Zap size={12} />
            Get Pro
          </Link>
        )}
      </div>
    </header>
  );
}
