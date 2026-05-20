import type { MetadataRoute } from "next";

const BASE = "https://courtiq-mocha.vercel.app";

const STATIC_ROUTES = [
  "",
  "/scores",
  "/live",
  "/players",
  "/teams",
  "/standings",
  "/playoffs",
  "/power-rankings",
  "/stats",
  "/compare",
  "/trade",
  "/analytics",
  "/fantasy",
  "/draft",
  "/news",
  "/about",
  "/press",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/live" || path === "/scores" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  // Try to enumerate dynamic player + team routes so they get indexed.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [players, teams] = await Promise.all([
      fetch(`${BASE}/api/players/with-stats`, { next: { revalidate: 3600 } }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${BASE}/api/teams/with-records`, { next: { revalidate: 3600 } }).then((r) => (r.ok ? r.json() : [])),
    ]);
    if (Array.isArray(players)) {
      dynamicEntries = dynamicEntries.concat(
        players.map((p: { slug: string }) => ({
          url: `${BASE}/players/${p.slug}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.6,
        }))
      );
    }
    if (Array.isArray(teams)) {
      dynamicEntries = dynamicEntries.concat(
        teams.map((t: { slug: string }) => ({
          url: `${BASE}/teams/${t.slug}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.65,
        }))
      );
    }
  } catch {
    /* fall back to static-only */
  }

  return [...staticEntries, ...dynamicEntries];
}
