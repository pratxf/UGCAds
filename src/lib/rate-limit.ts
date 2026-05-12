/**
 * Rate limiter — uses Upstash Redis when env vars are present (production),
 * falls back to in-memory for local dev.
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars.
 * Free tier: https://upstash.com (10K commands/day)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------- Upstash (production) ----------

function makeUpstashLimiter(max: number, windowSec: number) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
    analytics: false,
  });
}

// ---------- In-memory fallback (local dev / no Redis) ----------

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function inMemoryRateLimit(
  key: string,
  opts: { windowSec: number; max: number },
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (existing.count >= opts.max) {
    return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

// ---------- Public API ----------

export async function rateLimitOrResponse(
  key: string,
  opts: { windowSec: number; max: number },
): Promise<Response | null> {
  const hasUpstash =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstash) {
    try {
      const limiter = makeUpstashLimiter(opts.max, opts.windowSec);
      const { success, reset } = await limiter.limit(key);
      if (success) return null;
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ error: "Too many requests, slow down a bit" }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": String(retryAfterSec),
          },
        },
      );
    } catch {
      // If Redis is unreachable, fall through to in-memory
    }
  }

  const result = inMemoryRateLimit(key, opts);
  if (result.ok) return null;
  return new Response(
    JSON.stringify({ error: "Too many requests, slow down a bit" }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(result.retryAfterSec),
      },
    },
  );
}
