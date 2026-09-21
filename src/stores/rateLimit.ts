export type RateLimitBucket = "core" | "search";

export interface BucketState {
  limit: number | null;
  remaining: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW_MS: Record<RateLimitBucket, number> = { search: 60_000, core: 3_600_000 };
const FALLBACK_BLOCK_MS = 60_000;
const CLOCK_SKEW_PAD_MS = 1000;

export const useRateLimitStore = defineStore("rateLimit", () => {
  const now = useTimestamp({ scheduler: (cb) => useIntervalFn(cb, 1000) });

  const buckets = ref<Record<RateLimitBucket, BucketState | null>>({ core: null, search: null });
  const secondaryBlockedUntil = ref<number | null>(null);
  const fallbackBlockedUntil = ref<Record<RateLimitBucket, number | null>>({ core: null, search: null });

  function recordHeaders(bucket: RateLimitBucket, headers: Headers, ok: boolean): void {
    const remainingRaw = headers.get("x-ratelimit-remaining");
    const resetRaw = headers.get("x-ratelimit-reset");

    if (remainingRaw === null || resetRaw === null) {
      return;
    }

    const remaining = Number(remainingRaw);
    const reset = Number(resetRaw);

    if (!Number.isFinite(remaining) || !Number.isFinite(reset)) {
      return;
    }

    const limitRaw = headers.get("x-ratelimit-limit");
    const limitNum = limitRaw === null ? Number.NaN : Number(limitRaw);
    const limit = Number.isFinite(limitNum) ? limitNum : null;

    const resetAt = reset * 1000;
    const nowMs = Date.now();

    const plausible = remaining !== 0 || (resetAt >= nowMs && resetAt <= nowMs + RATE_LIMIT_WINDOW_MS[bucket]);

    if (!plausible) {
      if (resetAt < nowMs && ok) {
        return;
      }

      buckets.value[bucket] = { limit, remaining, resetAt };
      fallbackBlockedUntil.value[bucket] = nowMs + FALLBACK_BLOCK_MS;

      return;
    }

    if (remaining > 0 && resetAt < nowMs) {
      return;
    }

    const existing = buckets.value[bucket];
    const remainingToStore = existing !== null && existing.resetAt === resetAt ? Math.min(existing.remaining, remaining) : remaining;

    buckets.value[bucket] = { limit, remaining: remainingToStore, resetAt };
    fallbackBlockedUntil.value[bucket] = null;
  }

  function recordRetryAfter(seconds: number): void {
    const until = Date.now() + seconds * 1000;

    if (secondaryBlockedUntil.value !== null && secondaryBlockedUntil.value > until) {
      return;
    }

    secondaryBlockedUntil.value = until;
  }

  function bucketBlocked(bucket: RateLimitBucket): boolean {
    const state = buckets.value[bucket];
    const fallback = fallbackBlockedUntil.value[bucket];
    const secondary = secondaryBlockedUntil.value;

    const possible = state?.remaining === 0 || fallback !== null || secondary !== null;

    if (!possible) {
      return false;
    }

    const t = now.value;

    if (secondary !== null && t <= secondary + CLOCK_SKEW_PAD_MS) {
      return true;
    }

    if (fallback !== null && t <= fallback + CLOCK_SKEW_PAD_MS) {
      return true;
    }

    if (fallback === null && state?.remaining === 0 && t <= state.resetAt + CLOCK_SKEW_PAD_MS) {
      return true;
    }

    return false;
  }

  function isBlocked(bucket: RateLimitBucket): boolean {
    return bucketBlocked(bucket);
  }

  function ownBlockEnd(bucket: RateLimitBucket): number | null {
    const fallback = fallbackBlockedUntil.value[bucket];

    if (fallback !== null) {
      return fallback;
    }

    const state = buckets.value[bucket];

    if (state !== null && state.remaining === 0) {
      return state.resetAt;
    }

    return null;
  }

  function blockedUntil(bucket: RateLimitBucket): number | null {
    if (!isBlocked(bucket)) {
      return null;
    }

    const own = ownBlockEnd(bucket);
    const secondary = secondaryBlockedUntil.value;

    if (own === null) {
      return secondary;
    }

    if (secondary === null) {
      return own;
    }

    return Math.max(own, secondary);
  }

  function blockKind(bucket: RateLimitBucket): "primary" | "secondary" | null {
    if (!isBlocked(bucket)) {
      return null;
    }

    const own = ownBlockEnd(bucket);
    const secondary = secondaryBlockedUntil.value;

    if (secondary !== null && (own === null || secondary >= own)) {
      return "secondary";
    }

    return "primary";
  }

  function remainingFor(bucket: RateLimitBucket): number | null {
    const state = buckets.value[bucket];

    if (state === null) {
      return null;
    }

    if (now.value > state.resetAt) {
      return null;
    }

    return state.remaining;
  }

  return {
    buckets,
    secondaryBlockedUntil,
    fallbackBlockedUntil,
    recordHeaders,
    recordRetryAfter,
    isBlocked,
    blockedUntil,
    blockKind,
    remainingFor,
  };
});
