// lib/revisionInsights.js
//
// Read-only presentation-layer aggregation for the Revision page. Priority
// ordering and urgency scoring are NOT recomputed here — they're read
// straight from rankConceptsByUrgency (lib/recommendations.js, Phase 8),
// the same deterministic engine that already blends weak concepts, recent
// failures, revision overdue-ness, and Micro-Proof performance into one
// score. This file only adds real presentation data on top: a human-
// readable "why" per concept (from real FailureAnalysis text and
// describeRevisionStatus-equivalent phrasing), real pending-recommendation
// counts, and real revision history. Mirrors lib/dashboard.js and
// lib/masteryInsights.js's read-only aggregation pattern.

import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { rankConceptsByUrgency, priorityLabelFor } from "@/lib/recommendations";
import { getMockSubconceptBreakdown } from "@/lib/mockSubconcepts";
import { getMasteryStatus } from "@/lib/mastery";
import { buildConceptTrends } from "@/lib/dashboard";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(date, now) {
  return Math.max(0, Math.round((now.getTime() - date.getTime()) / DAY_MS));
}

function describeLastPracticed(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// Real "why" text, in priority order: a repeated/recent failure's actual
// root cause beats a generic overdue notice, which beats a generic
// low-mastery notice. Never fabricated — every branch reads a real field.
function buildReason({ recentFailureCount, mostRecentRootCause, revisionStatus, masteryScore }) {
  if (mostRecentRootCause) {
    return recentFailureCount > 1
      ? `Repeated mistakes: ${mostRecentRootCause}`
      : `Recent mistake: ${mostRecentRootCause}`;
  }
  if (revisionStatus && revisionStatus !== "Not yet scheduled for revision.") {
    return revisionStatus;
  }
  return `Mastery is still low (${masteryScore}%) — this concept needs more practice.`;
}

/**
 * Prioritized revision items (High/Medium urgency only — Low-urgency
 * concepts don't need active revision right now) plus recent revision
 * session history.
 *
 * @param {string} clerkUserId
 */
export async function getRevisionOverview(clerkUserId) {
  const now = new Date();

  const [ranked, schedules, failureAnalyses, recommendations, revisionAttempts, allAttemptsForTrend] = await Promise.all([
    rankConceptsByUrgency(clerkUserId),
    prisma.revisionSchedule.findMany({ where: { clerkUserId } }),
    prisma.failureAnalysis.findMany({
      where: { clerkUserId },
      orderBy: { createdAt: "desc" },
      select: { concept: true, rootCause: true, createdAt: true },
    }),
    prisma.recommendation.findMany({
      where: { clerkUserId, completedAt: null },
      select: { targetConcept: true },
    }),
    prisma.microProofAttempt.findMany({
      where: { clerkUserId, intervalDaysAfterReview: { not: null } },
      include: { microProof: { include: { concept: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    // For real trend arrows (see buildConceptTrends) — same real signal the
    // dashboard and Mastery page already show, not recomputed logic.
    prisma.microProofAttempt.findMany({
      where: { clerkUserId },
      select: { score: true, createdAt: true, microProof: { select: { concept: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const trends = buildConceptTrends(allAttemptsForTrend);

  const scheduleByConcept = new Map(schedules.map((s) => [s.concept, s]));
  const recommendationCountByConcept = new Map();
  for (const r of recommendations) {
    recommendationCountByConcept.set(r.targetConcept, (recommendationCountByConcept.get(r.targetConcept) || 0) + 1);
  }

  const priorityItems = ranked
    .filter((r) => priorityLabelFor(r.conceptScore) !== "Low")
    .map((r) => {
      const schedule = scheduleByConcept.get(r.concept);
      const matchingFailures = failureAnalyses.filter((f) => (normalizeConceptName(f.concept) || f.concept) === r.concept);
      const breakdown = getMockSubconceptBreakdown(r.concept, r.masteryScore);
      const weakestSubarea = breakdown.reduce((min, item) => (item.score < min.score ? item : min), breakdown[0]);

      return {
        concept: r.concept,
        masteryScore: r.masteryScore,
        status: getMasteryStatus(r.masteryScore),
        trend: trends.get(r.concept) || null,
        priorityLabel: priorityLabelFor(r.conceptScore),
        priorityScore: r.conceptScore,
        lastPracticed: schedule ? describeLastPracticed(daysAgo(schedule.lastReviewedAt, now)) : "Never practiced",
        reason: buildReason({
          recentFailureCount: r.signals.recentFailureCount,
          mostRecentRootCause: matchingFailures[0]?.rootCause || null,
          revisionStatus: r.signals.revisionStatus,
          masteryScore: r.masteryScore,
        }),
        weakestSubarea: weakestSubarea.name,
        recommendedProblemCount: recommendationCountByConcept.get(r.concept) || 0,
        hasRevisionSchedule: Boolean(schedule),
      };
    });

  const history = revisionAttempts.map((a) => ({
    id: a.id,
    concept: normalizeConceptName(a.microProof?.concept?.name) || a.microProof?.concept?.name || "Unknown concept",
    score: a.score,
    understanding: a.understanding,
    label: describeLastPracticed(daysAgo(a.createdAt, now)),
  }));

  return { priorityItems, history };
}
