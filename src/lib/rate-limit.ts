import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function rateLimitOrThrow(key: string, limit: number, window: `${number} s` | `${number} m` | `${number} h`) {
  if (!redis) {
    // Dev/local fallback: no-op if Upstash isn't configured.
    return { ok: true, remaining: limit, reset: Date.now() };
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: "rift-auth",
  });

  const result = await ratelimit.limit(key);
  return result;
}

