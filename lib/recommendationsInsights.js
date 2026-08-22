// lib/recommendationsInsights.js
//
// Read-only presentation-layer aggregation for the Recommendations page.
// Problem SELECTION is never recomputed here — every candidate comes from
// selectRecommendationCandidates / rankConceptsByUrgency
// (lib/recommendations.js, Phase 8), the same deterministic engine already
// used to generate the persisted Recommendation rows. This file only adds
// real presentation data on top (clustering, a traceback link, engine
// stats, pathway steps, completed history) plus a few clearly-isolated
// deterministic estimates (see lib/recommendationFlavor.js) for numbers
// the schema has no real source for (time-to-solve, mastery-gain estimate,
// engine "confidence").

import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { ACCEPTED_VERDICT } from "@/lib/constants";
import { selectRecommendationCandidates } from "@/lib/recommendations";
import { getMasteryStatus } from "@/lib/mastery";
import { buildConceptTrends } from "@/lib/dashboard";
import { failureModeFor, whyPillFor, estimatedTimeFor, patternHintFor } from "@/lib/recommendationFlavor";

const CLUSTER_CANDIDATE_LIMIT = 8;
const TIER_RANK = { CRITICAL: 4, REINFORCEMENT: 3, PROGRESSION: 2, COMPLETED: 1 };

// Deterministic, bounded heuristic — NOT a measured statistic. The lower a
// concept's mastery, the more headroom a well-targeted problem has to move
// it, with diminishing/bounded returns so this never reads as precise.
function estimateMasteryGain(masteryScore) {
  const gap = 100 - masteryScore;
  return Math.max(3, Math.min(15, Math.round(gap * 0.15)));
}

function tierFor(masteryScore, priorityLabel) {
  const status = getMasteryStatus(masteryScore);
  if (status === "WEAK" && priorityLabel === "High") return "CRITICAL";
  if (status === "WEAK" || priorityLabel === "High") return "REINFORCEMENT";
  if (status === "STRONG") return "COMPLETED";
  return "PROGRESSION";
}

/**
 * @param {string} clerkUserId
 * @param {Array} recommendations - already-fetched result of
 *   getOrGenerateRecommendations(clerkUserId) (real, persisted, Groq-authored
 *   reasons) — passed in rather than re-fetched, since that call has real
 *   side effects (Groq calls, DB writes) that must only happen once per request.
 */
export async function getRecommendationEngineData(clerkUserId, recommendations) {
  const hero = recommendations[0] || null;

  const [candidates, failureAnalyses, microProofAttempts, allMasteries, completedRecs, solvedSubmissions] =
    await Promise.all([
      selectRecommendationCandidates(clerkUserId, { limit: CLUSTER_CANDIDATE_LIMIT }).catch(() => []),
      prisma.failureAnalysis.findMany({
        where: { clerkUserId },
        include: { submission: { include: { problem: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.microProofAttempt.findMany({
        where: { clerkUserId },
        select: { score: true, createdAt: true, microProof: { select: { concept: { select: { name: true } } } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.conceptMastery.findMany({ where: { clerkUserId } }),
      prisma.recommendation.findMany({
        where: { clerkUserId, completedAt: { not: null } },
        include: { problem: true },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      prisma.leetCodeSubmission.findMany({
        where: { account: { clerkUserId }, verdict: ACCEPTED_VERDICT },
        select: { problem: { select: { titleSlug: true } } },
      }),
    ]);

  const trends = buildConceptTrends(microProofAttempts);
  const masteryByConcept = new Map(allMasteries.map((m) => [m.concept, m.masteryScore]));

  // ---- Engine status bar (real counts + one bounded heuristic) ----
  const focusGapConcepts = allMasteries.filter((m) => m.status === "WEAK" || m.status === "DEVELOPING");
  const evidencedConcepts = allMasteries.filter((m) => m.totalMicroProofAttempts > 0 || m.successfulProblemCount > 0);
  const engineStats = {
    signalsAnalyzed: failureAnalyses.length + microProofAttempts.length,
    activeFocusGaps: focusGapConcepts.filter((m) => m.status === "WEAK").length,
    // Share of the user's concept profile actually backed by evidence
    // (a Micro-Proof attempt or a solved problem) rather than mastery rows
    // that only exist because of a single failure — a real, if simple,
    // proxy for "how much signal is this engine working with."
    confidencePercent: allMasteries.length ? Math.round((evidencedConcepts.length / allMasteries.length) * 100) : 0,
  };

  // ---- Hero enrichment: traceback link + estimated gain ----
  let heroEnriched = null;
  if (hero) {
    const linkedFailure = failureAnalyses.find(
      (f) => (normalizeConceptName(f.concept) || f.concept) === hero.targetConcept
    );
    heroEnriched = {
      ...hero,
      tier: tierFor(hero.masteryScore, hero.priorityLabel),
      estimatedGainPercent: estimateMasteryGain(hero.masteryScore),
      linkedMistake: linkedFailure
        ? { submissionId: linkedFailure.submissionId, problemTitle: linkedFailure.submission.problem.title }
        : null,
    };
  }

  // ---- Cognitive Gap Clusters (real candidates, grouped by curated failure mode) ----
  const clusterMap = new Map();
  for (const c of candidates) {
    const label = failureModeFor(c.targetConcept);
    if (!clusterMap.has(label)) clusterMap.set(label, []);
    clusterMap.get(label).push({
      id: c.problem.id,
      title: c.problem.title,
      difficulty: c.problem.difficulty,
      url: c.problem.url,
      targetConcept: c.targetConcept,
      masteryScore: c.masteryScore,
      priorityLabel: c.priorityLabel,
      tier: tierFor(c.masteryScore, c.priorityLabel),
      whyPill: whyPillFor(c),
      estimatedTime: estimatedTimeFor(c.problem.difficulty),
      patternHint: patternHintFor(c.targetConcept),
    });
  }
  const clusters = [...clusterMap.entries()]
    .map(([label, items]) => ({
      label,
      tier: items.reduce((worst, item) => (TIER_RANK[item.tier] > TIER_RANK[worst] ? item.tier : worst), "COMPLETED"),
      items,
    }))
    .sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier]);

  // ---- Progressive Pathway (best-effort real problems for the hero's concept) ----
  let pathway = null;
  if (hero) {
    const solvedSlugs = new Set(solvedSubmissions.map((s) => s.problem.titleSlug));
    const [easySolved, hardCandidate] = await Promise.all([
      prisma.leetCodeSubmission.findFirst({
        where: {
          account: { clerkUserId },
          verdict: ACCEPTED_VERDICT,
          problem: { difficulty: "Easy", topicTags: { has: hero.targetConcept } },
        },
        include: { problem: true },
        orderBy: { timestamp: "desc" },
      }),
      prisma.leetCodeProblemCatalog.findFirst({
        where: { difficulty: "Hard", topicTags: { has: hero.targetConcept } },
        orderBy: { title: "asc" },
      }),
    ]);

    const hardUnsolved = hardCandidate && !solvedSlugs.has(hardCandidate.slug) ? hardCandidate : null;

    pathway = {
      concept: hero.targetConcept,
      steps: [
        {
          stepLabel: "Step 1",
          difficulty: "Easy",
          title: easySolved?.problem.title || null,
          status: easySolved ? "MASTERED" : "NONE",
        },
        {
          stepLabel: "Step 2",
          difficulty: hero.problem.difficulty,
          title: hero.problem.title,
          url: hero.problem.url,
          status: "TARGETING",
        },
        {
          stepLabel: "Step 3",
          difficulty: "Hard",
          title: hardUnsolved?.title || null,
          status: hardUnsolved ? "LOCKED" : "NONE",
        },
      ],
    };
  }

  // ---- Recently Practiced / Verified (real completions + current mastery) ----
  const completedHistory = completedRecs.map((r) => ({
    id: r.id,
    problemTitle: r.problem.title,
    difficulty: r.problem.difficulty,
    targetConcept: r.targetConcept,
    completedAt: r.completedAt.toISOString(),
    currentMasteryScore: masteryByConcept.get(r.targetConcept) ?? null,
    trend: trends.get(r.targetConcept) || null,
  }));

  return { hero: heroEnriched, clusters, pathway, completedHistory, engineStats };
}

export { tierFor };
