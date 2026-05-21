"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "courtiq-bracket-picks-2026";

/** Saved picks: { "<round>:<high>vs<low>": "TEAM_ABBR" } */
type Picks = Record<string, string>;

function encodePicks(p: Picks): string {
  return Object.entries(p)
    .map(([k, v]) => `${k}=${v}`)
    .join(",");
}

function decodePicks(s: string): Picks {
  const out: Picks = {};
  s.split(",").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (k && v) out[k] = v;
  });
  return out;
}

export function useBracketPicks() {
  const [picks, setPicks] = useState<Picks>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // URL hash overrides localStorage so #picks=... links always work.
    if (typeof window !== "undefined" && window.location.hash.startsWith("#picks=")) {
      const enc = window.location.hash.slice("#picks=".length);
      const fromUrl = decodePicks(decodeURIComponent(enc));
      if (Object.keys(fromUrl).length > 0) {
        setPicks(fromUrl);
        setHydrated(true);
        return;
      }
    }
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

  const shareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const enc = encodeURIComponent(encodePicks(picks));
    return `${window.location.origin}/playoffs#picks=${enc}`;
  }, [picks]);

  return { picks, pick, clear, hydrated, shareUrl };
}

export function seriesKey(round: "r1" | "r2" | "cf" | "finals", high: string, low: string): string {
  return `${round}:${high}v${low}`;
}
