export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/**
 * Shared contract for contact-form rate limiting.
 *
 * `createMemoryRateLimiter` counts hits inside the current process only.
 * A second serverless instance, or a process restart, starts from an empty
 * count. That is not production-grade protection for a multi-instance deploy.
 *
 * Replace the limiter passed to `handleContactRequest` with an implementation
 * of this interface backed by shared storage (for example Redis or Upstash):
 *
 * ```ts
 * const limiter: RateLimiter = {
 *   async consume(key) {
 *     const count = await redis.incr(key);
 *     if (count === 1) await redis.expire(key, windowSeconds);
 *     return { allowed: count <= limit, retryAfterSeconds: windowSeconds };
 *   },
 * };
 * ```
 */
export interface RateLimiter {
  consume(key: string): Promise<RateLimitResult>;
}

export function createMemoryRateLimiter(options: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    async consume(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((timestamp) => now - timestamp < options.windowMs);
      if (recent.length >= options.limit) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((recent[0] + options.windowMs - now) / 1000),
        );
        hits.set(key, recent);
        return { allowed: false, retryAfterSeconds };
      }

      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) {
        const oldest = hits.keys().next().value;
        if (oldest) hits.delete(oldest);
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

/**
 * Uses the first address in `x-forwarded-for`. That is the client address
 * when the hosting platform overwrites the header. If the platform appends
 * instead, a visitor can spoof the key. The address is kept only in the
 * rate-limit store for the current window.
 */
export function clientRateKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",")[0]?.trim() ?? "";
  if (/^[0-9a-fA-F:.]+$/.test(candidate) && candidate.length <= 64) return candidate;
  return "unknown";
}
