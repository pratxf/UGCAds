/**
 * Lightweight in-memory rate limiter.
 *
 * Tradeoff: each serverless instance has its own counter, so a determined
 * attacker hitting many cold starts can bypass it. But it shuts down the
 * common case (a logged-in user spamming a single endpoint from one tab)
 * with zero infra dependencies.
 *
 * For production hardening, swap the Map below for Upstash Redis or
 * Vercel KV — same call signature.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function rateLimit(
  key: string,
  opts: { windowSec: number; max: number },
): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= opts.max) {
    return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

/** Convenience: returns a Response if blocked, null if allowed. */
export function rateLimitOrResponse(
  key: string,
  opts: { windowSec: number; max: number },
): Response | null {
  const r = rateLimit(key, opts);
  if (r.ok) return null;
  return new Response(
    JSON.stringify({ error: "Too many requests, slow down a bit" }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(r.retryAfterSec),
      },
    },
  );
}
