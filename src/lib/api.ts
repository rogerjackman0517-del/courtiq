const BACKEND = process.env.NBA_BACKEND_URL ?? "http://localhost:8000";

export async function fetchBackend<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Backend error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Typed helpers ──────────────────────────────────────────────

export const api = {
  players: {
    all: (season = "2025-26") =>
      fetchBackend<Record<string, unknown>[]>(`/players?season=${season}`),
    info: (id: number) =>
      fetchBackend<{ info: Record<string, unknown>; headline: Record<string, unknown> }>(`/players/${id}/info`),
    stats: (id: number, season = "2025-26") =>
      fetchBackend<{ season: unknown[]; career: unknown[] }>(`/players/${id}/stats?season=${season}`),
    advanced: (id: number, season = "2025-26") =>
      fetchBackend<unknown[]>(`/players/${id}/advanced?season=${season}`),
    gamelog: (id: number, season = "2025-26") =>
      fetchBackend<unknown[]>(`/players/${id}/gamelog?season=${season}`),
    shotchart: (id: number, season = "2025-26") =>
      fetchBackend<{ shots: unknown[]; league_avg: unknown[] }>(`/players/${id}/shotchart?season=${season}`),
    search: (query: string) =>
      fetchBackend<{ id: number; full_name: string }[]>(`/players/search/${encodeURIComponent(query)}`),
  },

  teams: {
    all: () => fetchBackend<unknown[]>("/teams"),
    standings: (season = "2025-26") => fetchBackend<unknown[]>(`/teams/standings?season=${season}`),
    roster: (id: number, season = "2025-26") =>
      fetchBackend<{ roster: unknown[]; coaches: unknown[] }>(`/teams/${id}/roster?season=${season}`),
    stats: (id: number, season = "2025-26") =>
      fetchBackend<unknown[]>(`/teams/${id}/stats?season=${season}`),
    info: (id: number, season = "2025-26") =>
      fetchBackend<{ info: unknown; season_ranks: unknown }>(`/teams/${id}/info?season=${season}`),
  },

  games: {
    today: () => fetchBackend<unknown>("/games/today", { next: { revalidate: 30 } }),
    boxscore: (gameId: string) => fetchBackend<unknown>(`/games/${gameId}/boxscore`, { next: { revalidate: 30 } }),
    schedule: (start: string, end: string) =>
      fetchBackend<unknown>(`/games/schedule?start_date=${start}&end_date=${end}`),
    odds: () => fetchBackend<unknown>("/games/odds", { next: { revalidate: 300 } }),
  },

  stats: {
    leaders: (category = "PTS", season = "2025-26") =>
      fetchBackend<unknown[]>(`/stats/leaders?stat_category=${category}&season=${season}`),
    players: (sortBy = "PTS", season = "2025-26") =>
      fetchBackend<unknown[]>(`/stats/players?sort_by=${sortBy}&season=${season}`),
    advanced: (season = "2025-26") =>
      fetchBackend<unknown[]>(`/stats/players/advanced?season=${season}`),
    teams: (season = "2025-26") =>
      fetchBackend<unknown[]>(`/stats/teams?season=${season}`),
  },
};
