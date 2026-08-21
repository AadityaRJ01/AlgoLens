// lib/rateLimit.js
//
// Lightweight, dependency-free, in-memory rate limiter for API routes.
//
// IMPORTANT: this is a per-process, in-memory limiter. It is appropriate
// for the current single-instance student/demo deployment, but it is NOT
// a distributed rate limiter — if this app is ever horizontally scaled
// across multiple server instances/processes (e.g. multiple Docker
// replicas), each instance tracks its own counters independently, so the
// effective limit becomes (limit * instanceCount) rather than a true
// global limit. A multi-instance deployment would need a shared store
// (e.g. Redis) instead — deliberately out of scope here per the "no
// paid/external services" constraint for this deployment.

const buckets = new Map(); // key -> { count, resetAt }

// Opportunistic sweep of expired buckets so the Map doesn't grow forever
// on a long-running process. Runs at most once per SWEEP_INTERVAL_MS,
// piggybacking on normal request traffic rather than a background timer.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweepAt = 0;

function sweepExpired(now) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Named rate-limit presets, per the production cleanup spec.
 */
export const RATE_LIMITS = {
  // Groq-backed routes: concept extraction, failure analysis, micro-proof
  // evaluation, recommendations generation, and doubt-solver hints.
  GROQ_STANDARD: { limit: 10, windowMs: 10 * 60 * 1000 },
  // Doubt Solver's full-solution reveal is heavier and more sensitive.
  DOUBT_SOLVER_SOLUTION: { limit: 5, windowMs: 10 * 60 * 1000 },
  LEETCODE_SYNC: { limit: 5, windowMs: 10 * 60 * 1000 },
  CATALOG_SYNC: { limit: 2, windowMs: 10 * 60 * 1000 },
};

/**
 * Fixed-window rate check + increment for one key.
 *
 * @param {string} key - unique bucket identifier, e.g. `${routeName}:${userId}`
 * @param {{limit:number, windowMs:number}} preset
 * @returns {{allowed:boolean, remaining:number, retryAfterSeconds:number}}
 */
export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  sweepExpired(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  const allowed = bucket.count <= limit;
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return { allowed, remaining, retryAfterSeconds };
}

/**
 * Route-level convenience helper: checks the caller's per-user bucket for
 * `routeName` and returns a ready-to-return plain object describing a 429
 * response when the limit is exceeded, or `null` when the request may
 * proceed. Never throws, never leaks internal details — the response body
 * is always the same generic message regardless of route/cause.
 *
 * @param {string} routeName - stable identifier for the endpoint, e.g. "concepts_extract"
 * @param {string} userId - authenticated Clerk userId (primary rate-limit key)
 * @param {{limit:number, windowMs:number}} preset - one of RATE_LIMITS
 * @returns {{body:object, status:number, retryAfterSeconds:number}|null}
 */
export function checkRouteRateLimit(routeName, userId, preset) {
  const key = `${routeName}:${userId}`;
  const { allowed, retryAfterSeconds } = checkRateLimit(key, preset);
  if (allowed) return null;

  return {
    body: { error: "Too many requests. Please try again later." },
    status: 429,
    retryAfterSeconds,
  };
}
