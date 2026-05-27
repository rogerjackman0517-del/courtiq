"use client";

import { useEffect, useState } from "react";

export type InjuryStatus = string; // "Out" | "Doubtful" | "Day-To-Day" | "Questionable" | etc.

// Module-level cache so all components share one fetch
let cached: Record<string, InjuryStatus> | null = null;
let pending: Promise<Record<string, InjuryStatus>> | null = null;

function doFetch(): Promise<Record<string, InjuryStatus>> {
  if (!pending) {
    pending = fetch("/api/injuries")
      .then((r) => (r.ok ? r.json() : { teams: [] }))
      .then((data) => {
        const m: Record<string, InjuryStatus> = {};
        const groups: Array<{ injuries?: Array<{ name?: string; status?: string }> }> =
          data?.teams ?? [];
        groups.forEach((g) => {
          g.injuries?.forEach((i) => {
            if (i.name && i.status) m[i.name.toLowerCase()] = i.status;
          });
        });
        cached = m;
        return m;
      })
      .catch(() => {
        cached = {};
        return {};
      });
  }
  return pending;
}

/** Returns a map of lowercased player name → injury status. */
export function useInjuryMap(): Record<string, InjuryStatus> {
  const [map, setMap] = useState<Record<string, InjuryStatus>>(cached ?? {});

  useEffect(() => {
    if (cached) { setMap(cached); return; }
    doFetch().then(setMap);
  }, []);

  return map;
}
