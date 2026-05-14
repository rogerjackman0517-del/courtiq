"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "courtiq-pinned-players-v2";

export function usePinnedPlayers() {
  const [pinned, setPinned] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setPinned(parsed.filter((s) => typeof s === "string"));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(pinned));
    } catch {
      /* ignore */
    }
  }, [pinned, hydrated]);

  const toggle = useCallback((slug: string) => {
    setPinned((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const isPinned = useCallback((slug: string) => pinned.includes(slug), [pinned]);

  return { pinned, isPinned, toggle, hydrated };
}
