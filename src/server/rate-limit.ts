import Redis from "ioredis";

let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
  redis.connect().catch(() => {
    console.warn("[rate-limit] Redis unavailable, falling back to in-memory limiter");
    redis = null;
  });
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export type RateLimitResult = { success: boolean; remaining: number; resetAt: number };

/**
 * Fixed-window rate limiter. Uses Redis when `REDIS_URL` is configured
 * (safe across multiple server instances); otherwise falls back to an
 * in-process Map, which is fine for a single-instance deployment or local
 * development but resets on redeploy and doesn't share state across
 * instances — swap in the Redis backend for horizontal scaling.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (redis && redis.status === "ready") {
    const redisKey = `ratelimit:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.pexpire(redisKey, windowMs);
    const ttl = await redis.pttl(redisKey);
    return { success: count <= limit, remaining: Math.max(limit - count, 0), resetAt: now + Math.max(ttl, 0) };
  }

  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  return { success: entry.count <= limit, remaining: Math.max(limit - entry.count, 0), resetAt: entry.resetAt };
}

export function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
