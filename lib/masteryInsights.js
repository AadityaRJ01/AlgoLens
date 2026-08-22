// lib/masteryInsights.js
//
// Read-only presentation-layer aggregation for the Mastery page. Every
// number here is derived from existing Phase 4/5/6/7/8 tables (FailureAnalysis,
// Concept, MicroProof/MicroProofAttempt, ConceptMastery, RevisionSchedule,
// Recommendation) — no new learning/mastery logic, no AI calls. Mastery
// scores themselves are read as-is from ConceptMastery, computed by
// lib/mastery.js (never recomputed here). Mirrors the read-only aggregation
// pattern already used by lib/dashboard.js.

import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { ACCEPTED_VERDICT } from "@/lib/constants";
import { priorityLabelFor } from "@/lib/recommendations";
import { buildConceptTrends } from "@/lib/dashboard";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MIN_WEEKS_FOR_CHART = 2;

/**
 * Overview data for the top of the Mastery page: every concept (weakest
 * first) with its real trend, plus summary counts.
 *
 * @param {string} clerkUserId
 */
export async function getMasteryOverview(clerkUserId) {
  const [masteries, microProofAttempts] = await Promise.all([
    prisma.conceptMastery.findMany({ where: { clerkUserId } }),
    prisma.microProofAttempt.findMany({
      where: { clerkUserId },
      select: {
        score: true,
        createdAt: true,
        microProof: { select: { concept: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const trends = buildConceptTrends(microProofAttempts);

  const masteryList = [...masteries]
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .map((m) => ({
      concept: m.concept,
      masteryScore: m.masteryScore,
      status: m.status,
      trend: trends.get(m.concept) || null,
      totalMicroProofAttempts: m.totalMicroProofAttempts,
      failureCount: m.failureCount,
      successfulProblemCount: m.successfulProblemCount,
      lastEvaluatedAt: m.lastEvaluatedAt.toISOString(),
    }));

  const overallMasteryPercent = masteries.length
    ? Math.round(masteries.reduce((sum, m) => sum + m.masteryScore, 0) / masteries.length)
    : null;

  // "Recent performance" — the average of every concept's own real trend
  // delta (see buildConceptTrends), not a fabricated monthly number. Omitted
  // entirely when no concept has enough Micro-Proof history for a trend yet.
  const trendValues = [...trends.values()];
  const overallTrend = trendValues.length
    ? (() => {
        const signedAvg =
          trendValues.reduce((sum, t) => sum + (t.direction === "up" ? t.deltaPoints : -t.deltaPoints), 0) /
          trendValues.length;
        return { direction: signedAvg >= 0 ? "up" : "down", deltaPoints: Math.abs(Math.round(signedAvg)) };
      })()
    : null;

  return {
    masteryList,
    summary: {
      overallMasteryPercent,
      overallTrend,
      conceptsStudied: masteries.length,
      conceptsMastered: masteries.filter((m) => m.status === "STRONG").length,
      conceptsNeedingAttention: masteries.filter((m) => m.status === "WEAK").length,
    },
  };
}

function weekKey(date) {
  return Math.floor(date.getTime() / WEEK_MS);
}

/**
 * Real weekly-bucketed Micro-Proof score trend for one concept (0-10 scores
 * scaled x10). Returns null when there's under two weeks of history —
 * shown as an honest "not enough history yet" state rather than a
 * fabricated multi-week curve.
 */
function buildProgressChart(attempts) {
  if (attempts.length === 0) return null;

  const buckets = new Map();
  for (const a of attempts) {
    const key = weekKey(a.createdAt);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(a.score);
  }

  const sortedKeys = [...buckets.keys()].sort((a, b) => a - b);
  if (sortedKeys.length < MIN_WEEKS_FOR_CHART) return null;

  return sortedKeys.map((key, i) => {
    const scores = buckets.get(key);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return { week: `Week ${i + 1}`, score: Math.round(avg * 10) };
  });
}

/**
 * Detail data for one selected concept: mastery row, real common-mistake
 * text pulled from FailureAnalysis, real recent signals (failed/solved/
 * revised/weak-concept events), a real weekly progress trend where enough
 * history exists, and the next real recommendation targeting this concept.
 *
 * @param {string} clerkUserId
 * @param {string} concept - already-normalized concept name
 */
export async function getConceptDetail(clerkUserId, concept) {
  const mastery = await prisma.conceptMastery.findUnique({
    where: { clerkUserId_concept: { clerkUserId, concept } },
  });
  if (!mastery) return null;

  const [failureAnalyses, conceptRows, microProofAttempts, revisionSchedule, recommendationRows] = await Promise.all([
    prisma.failureAnalysis.findMany({
      where: { clerkUserId },
      include: { submission: { include: { problem: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.concept.findMany({
      where: { clerkUserId },
      include: { problem: true, submission: true },
    }),
    prisma.microProofAttempt.findMany({
      where: { clerkUserId },
      include: { microProof: { include: { concept: { include: { problem: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.revisionSchedule.findUnique({ where: { clerkUserId_concept: { clerkUserId, concept } } }),
    prisma.recommendation.findMany({
      where: { clerkUserId, completedAt: null },
      include: { problem: true },
      orderBy: { priorityScore: "desc" },
      take: 10,
    }),
  ]);

  const matchingFailures = failureAnalyses.filter((f) => (normalizeConceptName(f.concept) || f.concept) === concept);
  const matchingSolved = conceptRows.filter((c) => (normalizeConceptName(c.name) || c.name) === concept);
  const matchingAttempts = microProofAttempts.filter(
    (a) => (normalizeConceptName(a.microProof?.concept?.name) || a.microProof?.concept?.name) === concept
  );

  // ---- Common Mistakes (real, from Phase 4 rootCause text) ----
  const distinctSubmissionIds = new Set(matchingFailures.map((f) => f.submissionId));
  const seenMistakes = new Set();
  const commonMistakes = [];
  for (const f of matchingFailures) {
    const text = f.rootCause.trim();
    if (seenMistakes.has(text)) continue;
    seenMistakes.add(text);
    commonMistakes.push({ id: f.id, text });
    if (commonMistakes.length >= 4) break;
  }

  // ---- Recent Signals (real events, same shape as lib/dashboard.js's
  // buildRecentActivity so components/dashboard/LearningSignalsList.js can
  // render them without modification) ----
  const events = [];
  for (const f of matchingFailures) {
    events.push({
      type: "FAILURE",
      label: `Failed → ${f.submission.problem.title}`,
      detail: f.failureCategory,
      date: f.createdAt,
    });
  }
  for (const c of matchingSolved) {
    events.push({
      type: "SOLVED",
      label: `Solved → ${c.problem.title}`,
      detail: c.problem.difficulty,
      date: c.submission?.timestamp || c.createdAt,
    });
  }
  for (const a of matchingAttempts) {
    const isRevision = a.intervalDaysAfterReview !== null && a.intervalDaysAfterReview !== undefined;
    const problemTitle = a.microProof.concept.problem?.title || concept;
    events.push({
      type: isRevision ? "REVISION" : "MICROPROOF",
      label: `${isRevision ? "Revised" : "Improved"} → ${problemTitle}`,
      detail: `Score ${a.score}/10`,
      date: a.createdAt,
    });
  }
  if (mastery.status === "WEAK") {
    events.push({
      type: "MASTERY",
      label: "Weak concept detected",
      detail: `${mastery.masteryScore}%`,
      date: mastery.lastEvaluatedAt,
      status: "WEAK",
    });
  }
  const recentSignals = events.sort((a, b) => b.date - a.date).slice(0, 6);

  // ---- Progress chart (real, see buildProgressChart) ----
  const progressChart = buildProgressChart(matchingAttempts);

  // ---- Recommendation (real Recommendation row; prefers this concept) ----
  const recommendationRow =
    recommendationRows.find((r) => r.targetConcept === concept) || recommendationRows[0] || null;
  const recommendation = recommendationRow
    ? {
        title: recommendationRow.problem.title,
        difficulty: recommendationRow.problem.difficulty,
        url: recommendationRow.problem.url,
        targetConcept: recommendationRow.targetConcept,
        reason: recommendationRow.reason,
        priorityLabel: priorityLabelFor(recommendationRow.priorityScore),
      }
    : null;

  return {
    mastery: {
      concept: mastery.concept,
      masteryScore: mastery.masteryScore,
      status: mastery.status,
      totalMicroProofAttempts: mastery.totalMicroProofAttempts,
      averageMicroProofScore: mastery.averageMicroProofScore,
      failureCount: mastery.failureCount,
      successfulProblemCount: mastery.successfulProblemCount,
      lastEvaluatedAt: mastery.lastEvaluatedAt.toISOString(),
    },
    commonMistakes,
    mistakesSubmissionCount: distinctSubmissionIds.size,
    recentSignals: recentSignals.map((e) => ({ ...e, date: new Date(e.date).toISOString() })),
    progressChart,
    hasRevisionSchedule: Boolean(revisionSchedule),
    recommendation,
  };
}
