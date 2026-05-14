"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";

type Player = {
  id: number;
  fullName: string;
  slug: string;
  teamAbbr: string;
  pts: number;
  reb: number;
  ast: number;
  fgPct: number;
};

let cachedPlayers: Player[] | null = null;
let inflightPromise: Promise<Player[]> | null = null;

async function loadPlayers(): Promise<Player[]> {
  if (cachedPlayers) return cachedPlayers;
  if (inflightPromise) return inflightPromise;
  inflightPromise = fetch("/api/players/with-stats")
    .then((r) => (r.ok ? r.json() : []))
    .then((d: Player[]) => {
      if (Array.isArray(d)) {
        cachedPlayers = d;
        return d;
      }
      return [];
    })
    .catch(() => []);
  return inflightPromise;
}

type Props = {
  slug: string;
  children: React.ReactNode;
  className?: string;
};

export function PlayerHoverCard({ slug, children, className }: Props) {
  const [open, setOpen] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setOpen(true);
    if (!player) {
      loadPlayers().then((list) => {
        const hit = list.find((p) => p.slug === slug);
        if (hit) setPlayer(hit);
      });
    }
  }

  function scheduleHide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 120);
  }

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <span
      ref={wrapRef}
      className={`relative inline-block ${className ?? ""}`}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocus={show}
      onBlur={scheduleHide}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-64 rounded-2xl border border-white/[0.08] bg-[#13131C] shadow-2xl p-4 text-left premium-fade-in"
          style={{ pointerEvents: "auto" }}
        >
          {player ? (
            <Link href={`/players/${player.slug}`} className="flex items-center gap-3 no-jiggle">
              <PlayerAvatar playerId={player.id} fullName={player.fullName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#F5F5F7] tracking-tight truncate">
                  {player.fullName}
                </p>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6E6E76] mb-2">
                  {player.teamAbbr}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-base tabular-nums text-[#F5F5F7]">{player.pts.toFixed(1)}</p>
                    <p className="text-[9px] text-[#6E6E76] tracking-wider">PTS</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-base tabular-nums text-[#F5F5F7]">{player.reb.toFixed(1)}</p>
                    <p className="text-[9px] text-[#6E6E76] tracking-wider">REB</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-barlow)] font-black text-base tabular-nums text-[#F5F5F7]">{player.ast.toFixed(1)}</p>
                    <p className="text-[9px] text-[#6E6E76] tracking-wider">AST</p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <p className="text-xs text-[#6E6E76]">Loading…</p>
          )}
        </span>
      )}
    </span>
  );
}
