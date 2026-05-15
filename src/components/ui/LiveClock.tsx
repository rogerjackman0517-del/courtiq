"use client";

import { useEffect, useState, useRef } from "react";

type Props = {
  /** Initial status text like "Q2 7:32" or "Halftime" or "3:24 - 4th". */
  statusText: string;
  className?: string;
};

/** Parses ESPN/NBA-style status texts and returns minutes/seconds + a label, or null if not a tickable clock. */
function parseClock(s: string): { mins: number; secs: number; prefix: string } | null {
  // Examples we want to handle:
  //   "Q2 7:32"
  //   "7:32 - 4th"
  //   "End of Q3"
  //   "Halftime"
  //   "Final"
  const m1 = s.match(/(Q\d|OT\d?)\s+(\d+):(\d{2})/i);
  if (m1) return { prefix: m1[1].toUpperCase() + " ", mins: parseInt(m1[2], 10), secs: parseInt(m1[3], 10) };

  const m2 = s.match(/(\d+):(\d{2})\s*-\s*(\w+)/);
  if (m2) return { prefix: m2[3] + " ", mins: parseInt(m2[1], 10), secs: parseInt(m2[2], 10) };

  return null;
}

function fmt(mins: number, secs: number, prefix: string): string {
  const m = Math.max(0, mins);
  const s = Math.max(0, Math.min(59, secs));
  return `${prefix}${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveClock({ statusText, className }: Props) {
  const parsed = parseClock(statusText);
  const [display, setDisplay] = useState(statusText);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    const p = parseClock(statusText);
    setDisplay(statusText);
    lastTickRef.current = Date.now();
    if (!p) return;

    let mins = p.mins;
    let secs = p.secs;

    const id = setInterval(() => {
      // tick down 1s
      if (secs > 0) {
        secs -= 1;
      } else if (mins > 0) {
        mins -= 1;
        secs = 59;
      } else {
        // clock at 0:00 — don't keep ticking past
        clearInterval(id);
      }
      setDisplay(fmt(mins, secs, p.prefix));
    }, 1000);

    return () => clearInterval(id);
  }, [statusText]);

  if (!parsed) return <span className={className}>{statusText}</span>;
  return <span className={className} aria-live="off">{display}</span>;
}
