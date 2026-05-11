import { Redis } from "@upstash/redis";

// Singleton — reuses the connection across requests in the same serverless instance
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// ── TTL presets (seconds) ─────────────────────────────────────
export const TTL = {
  live:    30,      // live scores — 30s
  stats:   3_600,   // season stats — 1 hour
  roster:  86_400,  // rosters — 24 hours
  odds:    300,     // betting lines — 5 min
  leaders: 3_600,
} as const;

// ── Generic cached fetch ──────────────────────────────────────
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();

  const cached = await redis.get<T>(key);
  if (cached !== null && cached !== undefined) return cached;

  const fresh = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
}
