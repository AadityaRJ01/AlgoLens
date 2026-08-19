// lib/mastery.js
//
// Phase 6: Concept Mastery Engine. Server-only.
//
// Mastery is calculated deterministically from stored Phase 4/5 data —
// Groq is never consulted to decide a mastery score. The formula is a
// simple, explainable weighted blend of three signals:
//
//   A. Micro-Proof performance   (60% of the "positive evidence" pool)
//   C. Successful problems       (15% of the "positive evidence" pool)
//   B. Failure history           (a bounded penalty subtracted afterward)
//
// See computeMasteryScore() below for the exact math and rationale.

import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";

// Weights for the two POSITIVE evidence signals (mastery can only be backed
// by evidence someone actually understands something — a micro-proof score
// or a solved problem). Their ratio is 60:15, i.e. 80%:20% of whichever of
// the two are available.
const MICRO_PROOF_WEIGHT = 60;
const SUCCESS_WEIGHT = 15;

// Points awarded per distinct accepted problem tied to the concept, capped.
const SUCCESS_POINTS_PER_PROBLEM = 40;
const SUCCESS_COMPONENT_CAP = 100;

// Failure history never adds mastery — it only subtracts, and with
// diminishing returns per additional failure (sqrt growth) so a single
// failure barely dents the score, matching the requirement that "one
// failure should not destroy the score." The maximum possible deduction
// (25 points) mirrors failure history's 25% weight in the suggested model.
const FAILURE_PENALTY_COEFFICIENT = 8;
const MAX_FAILURE_PENALTY = 25;

const STATUS_THRESHOLDS = [
  { min: 75, status: "STRONG" },
  { min: 50, status: "DEVELOPING" },
  { min: 0, status: "WEAK" },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Converts a mastery score (0-100) into its status bucket.
 * @param {number} masteryScore
 * @returns {"STRONG"|"DEVELOPING"|"WEAK"}
 */
export function getMasteryStatus(masteryScore) {
  return STATUS_THRESHOLDS.find((t) => masteryScore >= t.min).status;
}

/**
 * Pure, deterministic mastery formula. No AI involved.
 *
 * - averageMicroProofScore: 0-10 average across the user's evaluated
 *   Micro-Proof attempts for this concept, or null if there are none.
 * - failureCount: number of Phase 4 failure analyses diagnosed for this concept.
 * - successfulProblemCount: number of distinct accepted problems the user has
 *   an extracted Concept for, matching this concept.
 *
 * @returns {{masteryScore:number, status:string}}
 */
export function computeMasteryScore({ averageMicroProofScore, failureCount, successfulProblemCount }) {
  const microProofAvailable = typeof averageMicroProofScore === "number" && !Number.isNaN(averageMicroProofScore);
  const microProofComponent = microProofAvailable
    ? clamp((averageMicroProofScore / 10) * 100, 0, 100)
    : null;

  const successAvailable = successfulProblemCount > 0;
  const successComponent = successAvailable
    ? Math.min(SUCCESS_COMPONENT_CAP, successfulProblemCount * SUCCESS_POINTS_PER_PROBLEM)
    : null;

  // Weighted average of whichever positive-evidence signals we actually have.
  // No evidence at all (brand new concept known only from a failure) => 0.
  let weightedSum = 0;
  let weightTotal = 0;
  if (microProofAvailable) {
    weightedSum += microProofComponent * MICRO_PROOF_WEIGHT;
    weightTotal += MICRO_PROOF_WEIGHT;
  }
  if (successAvailable) {
    weightedSum += successComponent * SUCCESS_WEIGHT;
    weightTotal += SUCCESS_WEIGHT;
  }
  const positiveScore = weightTotal > 0 ? weightedSum / weightTotal : 0;

  const failurePenalty =
    failureCount > 0 ? Math.min(MAX_FAILURE_PENALTY, FAILURE_PENALTY_COEFFICIENT * Math.sqrt(failureCount)) : 0;

  const masteryScore = Math.round(clamp(positiveScore - failurePenalty, 0, 100));
  const status = getMasteryStatus(masteryScore);

  return { masteryScore, status };
}

/**
 * Recalculates and persists the ConceptMastery row for one user + concept,
 * from the current Phase 4/5 data in Postgres. Safe to call repeatedly —
 * it's idempotent and upserts on the (clerkUserId, concept) unique key.
 *
 * Call this after any event that changes mastery-relevant data:
 * a new Micro-Proof evaluation, a new failure analysis, or a newly
 * extracted Concept for an accepted problem.
 *
 * @param {string} clerkUserId
 * @param {string} rawConcept - an un-normalized concept name/string from Phase 4 or 5
 * @returns {Promise<object|null>} the persisted ConceptMastery row, or null if rawConcept was empty
 */
export async function recalculateConceptMastery(clerkUserId, rawConcept) {
  const concept = normalizeConceptName(rawConcept);
  if (!clerkUserId || !concept) return null;

  // Phase 5 signals: every Concept row belongs to an accepted submission, so
  // distinct problemIds among matching Concepts double as "successful problems."
  const concepts = await prisma.concept.findMany({
    where: { clerkUserId },
    select: { id: true, name: true, problemId: true },
  });
  const matchingConcepts = concepts.filter((c) => normalizeConceptName(c.name) === concept);
  const matchingConceptIds = matchingConcepts.map((c) => c.id);
  const successfulProblemCount = new Set(matchingConcepts.map((c) => c.problemId)).size;

  const attempts = matchingConceptIds.length
    ? await prisma.microProofAttempt.findMany({
        where: { clerkUserId, microProof: { conceptId: { in: matchingConceptIds } } },
        select: { score: true },
      })
    : [];
  const totalMicroProofAttempts = attempts.length;
  const averageMicroProofScore = totalMicroProofAttempts
    ? attempts.reduce((sum, a) => sum + a.score, 0) / totalMicroProofAttempts
    : null;

  // Phase 4 signal: failure analyses are matched purely by normalized concept
  // string (they aren't linked to a Concept row).
  const failureAnalyses = await prisma.failureAnalysis.findMany({
    where: { clerkUserId },
    select: { concept: true },
  });
  const failureCount = failureAnalyses.filter((f) => normalizeConceptName(f.concept) === concept).length;

  const { masteryScore, status } = computeMasteryScore({
    averageMicroProofScore,
    failureCount,
    successfulProblemCount,
  });

  return prisma.conceptMastery.upsert({
    where: { clerkUserId_concept: { clerkUserId, concept } },
    create: {
      clerkUserId,
      concept,
      masteryScore,
      status,
      totalMicroProofAttempts,
      averageMicroProofScore,
      failureCount,
      successfulProblemCount,
      lastEvaluatedAt: new Date(),
    },
    update: {
      masteryScore,
      status,
      totalMicroProofAttempts,
      averageMicroProofScore,
      failureCount,
      successfulProblemCount,
      lastEvaluatedAt: new Date(),
    },
  });
}
