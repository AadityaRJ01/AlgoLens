// lib/revision.js
//
// Phase 7: Adaptive Revision / Spaced Repetition. Server-only.
//
// The next-review interval is a pure, deterministic function of the latest
// Micro-Proof score and the current Concept Mastery — Groq is never
// consulted to pick a review date. See calculateNextIntervalDays() below.

import prisma from "@/lib/prisma";

// Baseline interval from the score of the review that was just completed.
const SCORE_INTERVAL_TABLE = [
  { maxScore: 3, days: 1 },
  { maxScore: 5, days: 2 },
  { maxScore: 7, days: 4 },
  { maxScore: 8, days: 7 },
  { maxScore: 9, days: 10 },
  { maxScore: 10, days: 14 },
];

// A concept's mastery caps how far out it can ever be scheduled, no matter
// how well the latest single review went — this is what makes weak concepts
// come back sooner even after one lucky good answer.
const MASTERY_CAP_TABLE = [
  { maxMastery: 49, cap: 2 },
  { maxMastery: 74, cap: 7 },
  { maxMastery: 100, cap: 14 },
];

const STILL_SHAKY_INTERVAL_DAYS = 1;

/**
 * @param {number} score - 0-10 Micro-Proof score
 * @returns {number} baseline interval in days, per the scoring table
 */
export function baselineIntervalForScore(score) {
  const clamped = Math.min(10, Math.max(0, Math.round(score)));
  return SCORE_INTERVAL_TABLE.find((t) => clamped <= t.maxScore).days;
}

/**
 * @param {number} masteryScore - 0-100 Concept Mastery score
 * @returns {number} the maximum interval (days) this mastery level allows
 */
export function masteryCapForScore(masteryScore) {
  const clamped = Math.min(100, Math.max(0, Math.round(masteryScore)));
  return MASTERY_CAP_TABLE.find((t) => clamped <= t.maxMastery).cap;
}

/**
 * Deterministic next-review interval: the score's baseline interval,
 * capped by what the concept's current mastery allows. Bounded [1, 14].
 *
 * @param {{score:number, masteryScore:number, stillShaky?:boolean}} params
 * @returns {number} interval in days
 */
export function calculateNextIntervalDays({ score, masteryScore, stillShaky = false }) {
  if (stillShaky) return STILL_SHAKY_INTERVAL_DAYS;
  return Math.min(baselineIntervalForScore(score), masteryCapForScore(masteryScore));
}

// UTC-based date math so the schedule is never off-by-one due to the
// server's local timezone or a DST transition.
function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Builds a short, deterministic (template-based, never AI-generated)
 * explanation of why the next review interval is what it is.
 */
export function buildReviewExplanation({ previousScore, newScore, intervalDays, stillShaky }) {
  const dayWord = intervalDays === 1 ? "day" : "days";

  if (stillShaky) {
    return `You marked this concept as still shaky, so it's scheduled again in ${intervalDays} ${dayWord} regardless of your score.`;
  }
  if (previousScore === null || previousScore === undefined) {
    return `This was your first review. A score of ${newScore}/10 schedules the next review in ${intervalDays} ${dayWord}.`;
  }
  if (newScore > previousScore) {
    return `Your previous score was ${previousScore}/10. Your new score of ${newScore}/10 improved your mastery, so the next review interval increased to ${intervalDays} ${dayWord}.`;
  }
  if (newScore < previousScore) {
    return `Your previous score was ${previousScore}/10. Your new score of ${newScore}/10 was lower, so the next review is scheduled sooner, in ${intervalDays} ${dayWord}.`;
  }
  return `Your score of ${newScore}/10 matched your previous attempt, so the next review is scheduled in ${intervalDays} ${dayWord}.`;
}

/**
 * Creates or updates the RevisionSchedule for one user + normalized concept
 * after a Micro-Proof evaluation. Upserts on the unique (clerkUserId,
 * concept) key, so repeated calls never create duplicate schedules — the
 * concept's very first evaluation both creates the schedule AND counts as
 * "Review 1."
 *
 * @param {string} clerkUserId
 * @param {string} concept - already-normalized concept name
 * @param {{score:number, masteryScore:number}} params
 * @returns {Promise<{schedule:object, intervalDays:number, previousScore:number|null}>}
 */
export async function scheduleOrUpdateRevision(clerkUserId, concept, { score, masteryScore }) {
  const intervalDays = calculateNextIntervalDays({ score, masteryScore });
  const now = new Date();
  const nextReviewAt = addDays(now, intervalDays);

  const existing = await prisma.revisionSchedule.findUnique({
    where: { clerkUserId_concept: { clerkUserId, concept } },
  });

  const schedule = await prisma.revisionSchedule.upsert({
    where: { clerkUserId_concept: { clerkUserId, concept } },
    create: {
      clerkUserId,
      concept,
      nextReviewAt,
      lastReviewedAt: now,
      reviewCount: 1,
      currentIntervalDays: intervalDays,
      lastScore: score,
      status: "REVIEWED",
    },
    update: {
      nextReviewAt,
      lastReviewedAt: now,
      reviewCount: { increment: 1 },
      currentIntervalDays: intervalDays,
      lastScore: score,
      status: "REVIEWED",
    },
  });

  return { schedule, intervalDays, previousScore: existing ? existing.lastScore : null };
}

/**
 * "Still Shaky" override: the user doesn't feel solid on this concept even
 * though it was just reviewed, so it's rescheduled sooner (capped at 1 day)
 * without touching the score or attempt history that was just recorded.
 *
 * @param {string} clerkUserId
 * @param {string} concept - already-normalized concept name
 * @returns {Promise<object|null>} the updated schedule, or null if none exists for this user/concept
 */
export async function markRevisionStillShaky(clerkUserId, concept) {
  const existing = await prisma.revisionSchedule.findUnique({
    where: { clerkUserId_concept: { clerkUserId, concept } },
  });
  if (!existing) return null;

  const intervalDays = calculateNextIntervalDays({ stillShaky: true });
  const nextReviewAt = addDays(new Date(), intervalDays);

  return prisma.revisionSchedule.update({
    where: { clerkUserId_concept: { clerkUserId, concept } },
    data: {
      nextReviewAt,
      currentIntervalDays: intervalDays,
      status: "SHAKY",
    },
  });
}
