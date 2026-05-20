"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "courtiq-favorite-team";
const DEFAULT = "NYK"; // Roger is a Knicks fan

export function useFavoriteTeam() {
  const [team, setTeamState] = useState<string>(DEFAULT);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) setTeamState(v);
    } catch { /* ignore */ }
  }, []);

  const setTeam = useCallback((abbr: string) => {
    setTeamState(abbr);
    try { localStorage.setItem(KEY, abbr); } catch { /* ignore */ }
  }, []);

  return { team, setTeam };
}
