"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "courtiq-bracket-picks-2026";

/** Saved picks: { "<round>:<high>vs<low>": "TEAM_ABBR" } */
type Picks = Record<string, string>;

export function useBracketPicks() {
  const [picks, setPicks] = useState<Picks>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setPicks(parsed);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(picks)); } catch { /* ignore */ }
  }, [picks, hydrated]);

  const pick = useCallback((seriesKey: string, team: string) => {
    setPicks((prev) => ({ ...prev, [seriesKey]: team }));
  }, []);

  const clear = useCallback(() => setPicks({}), []);

  return { picks, pick, clear, hydrated };
}

export function seriesKey(round: "r1" | "r2" | "cf" | "finals", high: string, low: string): string {
  return `${round}:${high}v${low}`;
}
