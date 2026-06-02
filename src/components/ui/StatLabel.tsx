"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * StatLabel — renders a stat abbreviation (PPG, eFG%, USG%, etc.) with an
 * optional underline hint, and shows a small tooltip explaining the metric
 * on hover or focus. Tooltip renders into a portal so it's never clipped by
 * an overflow:hidden parent (e.g. .floating-card with overflow-hidden).
 */
const STAT_GLOSSARY: Record<string, string> = {
  // Per-game basics
  PPG: "Points per game",
  RPG: "Rebounds per game",
  APG: "Assists per game",
  SPG: "Steals per game",
  BPG: "Blocks per game",
  TOV: "Turnovers per game",
  MPG: "Minutes per game",
  MIN: "Minutes per game",
  GP: "Games played",
  PTS: "Points",
  REB: "Rebounds",
  AST: "Assists",
  STL: "Steals",
  BLK: "Blocks",
  // Shooting
  "FG%": "Field-goal percentage — made / attempted",
  "3P%": "3-point percentage — made / attempted",
  "FT%": "Free-throw percentage — made / attempted",
  FGM: "Field goals made",
  FGA: "Field goals attempted",
  "3PM": "3-pointers made",
  "3PA": "3-pointers attempted",
  FTM: "Free throws made",
  FTA: "Free throws attempted",
  "eFG%": "Effective field goal % — weights 3PT makes 1.5× since they're worth more",
  "TS%": "True shooting % — points per shooting possession, factors in 2s, 3s, and free throws",
  PPS: "Points per shot — how many points each attempt produces",
  // Advanced
  "USG%": "Usage rate — % of team possessions a player uses while on court",
  "PER": "Player efficiency rating — per-minute productivity, league avg = 15",
  "BPM": "Box plus/minus — points per 100 possessions above league average",
  "VORP": "Value over replacement player — total contribution above replacement-level",
  "WS": "Win shares — estimated wins contributed",
  "ORtg": "Offensive rating — points produced per 100 possessions",
  "DRtg": "Defensive rating — points allowed per 100 possessions",
  "NetRtg": "Net rating — ORtg minus DRtg",
  "AST%": "Assist percentage — % of teammate FGs the player assists while on court",
  "TRB%": "Total rebound percentage — % of available rebounds the player grabbed",
  "TOV%": "Turnover percentage — turnovers per 100 plays used",
  "STL%": "Steal percentage — % of opponent possessions ended by a steal",
  "BLK%": "Block percentage — % of opponent 2PT attempts the player blocked",
  // Standings
  W: "Wins",
  L: "Losses",
  PCT: "Win percentage",
  GB: "Games behind first place",
  L10: "Record over the last 10 games",
  STRK: "Current win/loss streak",
  SOS: "Strength of remaining schedule",
  CONF: "Conference record",
  DIV: "Division record",
  HOME: "Home record",
  AWAY: "Road record",
};

type StatLabelProps = {
  abbr: string;
  /** Override the auto-resolved tooltip text */
  hint?: string;
  className?: string;
  /** Suppress the underline-dot hint */
  noHint?: boolean;
};

export function StatLabel({ abbr, hint, className, noHint = false }: StatLabelProps) {
  const explanation = hint ?? STAT_GLOSSARY[abbr] ?? null;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top });
  }, [open]);

  // No explanation → render plain label, no underline, no tooltip.
  if (!explanation) {
    return <span className={className}>{abbr}</span>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        aria-label={`${abbr}: ${explanation}`}
        className={cn(
          "cursor-help select-none outline-none focus-visible:ring-2 focus-visible:ring-[#D4B560]/40 rounded-sm",
          !noHint && "underline decoration-dotted decoration-[#D4B560]/40 underline-offset-[3px]",
          className
        )}
      >
        {abbr}
      </span>
      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-[calc(100%+8px)] floating-card no-jiggle rounded-lg px-3 py-2 max-w-[240px] shadow-2xl shadow-black/60 toast-enter"
            style={{ left: pos.x, top: pos.y }}
            role="tooltip"
          >
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#D4B560] mb-0.5">{abbr}</p>
            <p className="text-xs text-[#F5F5F7] leading-snug">{explanation}</p>
          </div>,
          document.body
        )}
    </>
  );
}
