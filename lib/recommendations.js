// lib/recommendations.js
//
// Phase 8: Personalized Practice & Recommendations. Server-only.
//
// Problem SELECTION is 100% deterministic, computed from stored Phase 3-7
// data — Groq is never asked to pick a problem, only to explain a choice
// that has already been made (see explainRecommendation in lib/groq.js).
//
// Two-stage deterministic algorithm:
//   1. Rank the user's concepts by how urgently they need attention
//      (weakness + recent failures + revision urgency + Micro-Proof trend).
//   2. For the most urgent concepts, pick the single best unsolved
//      candidate problem — from the GLOBAL LeetCodeProblemCatalog (Phase 8,
//      independent of this user's submission history) minus this user's
//      Accepted problems — whose difficulty best matches their mastery.

import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { explainRecommendation, GroqServiceError } from "@/lib/groq";
import { ACCEPTED_VERDICT } from "@/lib/constants";

const MAX_RECOMMENDATIONS = 3;

// Thrown when the global LeetCodeProblemCatalog (Phase 8) has never been
// synced/is empty — a distinct case from "no candidates matched your
// concepts" so the UI can tell the user to initialize the catalog instead
// of showing a misleading "no recommendations" message.
export class CatalogNotInitializedError extends Error {
  constructor() {
    super("The global LeetCode problem catalog is empty. Run a catalog sync before requesting recommendations.");
    this.name = "CatalogNotInitializedError";
  }
}

// Weights for ranking WHICH concepts need attention most. Sum to 1.0.
const CONCEPT_WEIGHTS = {
  weakness: 0.45, // A. weak concepts
  failure: 0.3, // B. recent failure patterns
  revision: 0.2, // C. revision status (overdue/soon)
  microProof: 0.05, // D. low Micro-Proof scores, as a direct (smaller) signal
};

// Once a concept is chosen, this blends its urgency with how well-suited a
// specific candidate problem's difficulty is, to pick among candidates and
// to produce the final displayed priorityScore.
const PROBLEM_WEIGHTS = { conceptUrgency: 0.85, difficultyFit: 0.15 };

const PRIORITY_LABEL_THRESHOLDS = [
  { min: 70, label: "High" },
  { min: 40, label: "Medium" },
  { min: 0, label: "Low" },
];

// Section 3: preferred difficulty band(s) by mastery. "primary" scores 100,
// "secondary" (still acceptable) scores 50, anything else scores 10 — so an
// unnecessarily hard problem is never picked over a suitable one, but isn't
// forbidden outright if it's genuinely the only candidate available.
const DIFFICULTY_BANDS = [
  { maxMastery: 39, primary: ["Easy"], secondary: ["Medium"] },
  { maxMastery: 59, primary: ["Easy", "Medium"], secondary: ["Hard"] },
  { maxMastery: 74, primary: ["Medium"], secondary: ["Easy", "Hard"] },
  { maxMastery: 89, primary: ["Medium", "Hard"], secondary: ["Easy"] },
  { maxMastery: 100, primary: ["Hard", "Medium"], secondary: ["Easy"] },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function daysBetween(a, b) {
  return Math.abs(a.getTime() - b.getTime()) / DAY_MS;
}

/**
 * Recency+frequency score for a concept's recent failures (0-100).
 * The single most recent failure sets a base score by how long ago it was;
 * additional failures within the last 30 days add a small bonus, capped —
 * so "two recent failures" ranks higher than one, without needing an ML model.
 */
function computeFailureScore(matchingFailures, now) {
  if (matchingFailures.length === 0) return 0;

  const mostRecentDaysAgo = Math.min(...matchingFailures.map((f) => daysBetween(f.createdAt, now)));
  let recencyScore;
  if (mostRecentDaysAgo <= 1) recencyScore = 100;
  else if (mostRecentDaysAgo <= 7) recencyScore = 80;
  else if (mostRecentDaysAgo <= 14) recencyScore = 60;
  else if (mostRecentDaysAgo <= 30) recencyScore = 40;
  else if (mostRecentDaysAgo <= 90) recencyScore = 20;
  else recencyScore = 5;

  const recentCount = matchingFailures.filter((f) => daysBetween(f.createdAt, now) <= 30).length;
  const frequencyBonus = Math.min(20, (recentCount - 1) * 10);

  return clamp(recencyScore + frequencyBonus, 0, 100);
}

/**
 * Revision urgency score (0-100): overdue concepts score highest and climb
 * the longer they're overdue; upcoming concepts score low and fall off the
 * closer they are to (but haven't reached) their due date; no schedule at
 * all is neutral (0) rather than penalized.
 */
function computeRevisionScore(schedule, now) {
  if (!schedule) return 0;

  if (schedule.nextReviewAt <= now) {
    const overdueDays = daysBetween(schedule.nextReviewAt, now);
    return clamp(60 + overdueDays * 5, 0, 100);
  }

  const daysUntilDue = daysBetween(now, schedule.nextReviewAt);
  return clamp(30 - daysUntilDue * 5, 0, 100);
}

function difficultyScoreFor(difficulty, masteryScore) {
  const band = DIFFICULTY_BANDS.find((b) => masteryScore <= b.maxMastery) || DIFFICULTY_BANDS[DIFFICULTY_BANDS.length - 1];
  if (band.primary.includes(difficulty)) return 100;
  if (band.secondary.includes(difficulty)) return 50;
  return 10;
}

// Exported for Phase 10: the dashboard reads Recommendation rows directly
// (see lib/dashboard.js) rather than re-running this engine, so it needs
// the same label thresholds without duplicating them.
export function priorityLabelFor(score) {
  return PRIORITY_LABEL_THRESHOLDS.find((t) => score >= t.min).label;
}

/**
 * Ranks the user's concepts by how urgently they need attention.
 * Pure aggregation over existing Phase 4/5/6/7 data — no AI involved.
 *
 * @param {string} clerkUserId
 * @returns {Promise<Array<{concept:string, masteryScore:number, conceptScore:number, signals:object}>>}
 */
export async function rankConceptsByUrgency(clerkUserId) {
  const masteries = await prisma.conceptMastery.findMany({ where: { clerkUserId } });
  if (masteries.length === 0) return [];

  const now = new Date();
  const [failures, schedules] = await Promise.all([
    prisma.failureAnalysis.findMany({ where: { clerkUserId }, select: { concept: true, createdAt: true } }),
    prisma.revisionSchedule.findMany({ where: { clerkUserId } }),
  ]);
  const scheduleByConcept = new Map(schedules.map((s) => [s.concept, s]));

  return masteries
    .map((m) => {
      const weaknessScore = clamp(100 - m.masteryScore, 0, 100);

      const matchingFailures = failures.filter((f) => normalizeConceptName(f.concept) === m.concept);
      const failureScore = computeFailureScore(matchingFailures, now);

      const revisionScore = computeRevisionScore(scheduleByConcept.get(m.concept), now);

      const microProofWeaknessScore =
        m.averageMicroProofScore != null ? clamp(100 - m.averageMicroProofScore * 10, 0, 100) : 0;

      const conceptScore = Math.round(
        CONCEPT_WEIGHTS.weakness * weaknessScore +
          CONCEPT_WEIGHTS.failure * failureScore +
          CONCEPT_WEIGHTS.revision * revisionScore +
          CONCEPT_WEIGHTS.microProof * microProofWeaknessScore
      );

      return {
        concept: m.concept,
        masteryScore: m.masteryScore,
        conceptScore,
        signals: {
          weaknessScore,
          failureScore,
          revisionScore,
          microProofWeaknessScore,
          recentFailureCount: matchingFailures.filter((f) => daysBetween(f.createdAt, now) <= 30).length,
          revisionStatus: describeRevisionStatus(scheduleByConcept.get(m.concept), now),
        },
      };
    })
    .sort((a, b) => b.conceptScore - a.conceptScore);
}

function describeRevisionStatus(schedule, now) {
  if (!schedule) return "Not yet scheduled for revision.";
  if (schedule.nextReviewAt <= now) {
    const overdueDays = Math.round(daysBetween(schedule.nextReviewAt, now));
    return overdueDays <= 0 ? "Due for revision now." : `Overdue for revision by ${overdueDays} day${overdueDays === 1 ? "" : "s"}.`;
  }
  const daysUntil = Math.round(daysBetween(now, schedule.nextReviewAt));
  return `Next revision due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}.`;
}

// Tags that describe nearly every LeetCode problem and therefore carry no
// concept-discriminating signal on their own (e.g. a "Two Pointers" concept
// must never be satisfied merely because a candidate happens to be tagged
// "Array" — that was the root cause of irrelevant recommendations). These
// may still ride along on a genuinely relevant candidate; they just can't
// be what makes a candidate relevant in the first place.
const GENERIC_TAGS = new Set(["array", "string", "math", "hash table"]);

// Curated, deterministic concept -> specific LeetCode tag(s) mapping.
// Concept names come from two places: (1) normalizeConceptName's canonical
// short forms (lib/conceptNormalization.js) for well-known technique names,
// which usually equal a real LeetCode tag directly, and (2) AI-generated
// free-text descriptions (e.g. "Greedy pairing of extremes after sorting")
// that are NOT LeetCode tags and must never be used as one verbatim.
//
// The first tag in each list is the concept's PRIMARY/defining tag (a
// candidate matching it scores 100); any further tags are SECONDARY
// related tags (score 50). Tag strings are the exact real topicTags values
// used by the LeetCodeProblemCatalog (verified against the live catalog).
//
// Concepts with no entry here yield no specific tags and are skipped for
// recommendation purposes (see selectRecommendationCandidates) rather than
// falling back to a generic-tag or free-text-as-tag match — a missing
// recommendation is better than an irrelevant one.
const CONCEPT_TAG_MAP = {
  // Canonical concepts (see CANONICAL_CONCEPTS in lib/conceptNormalization.js).
  "Sliding Window": ["Sliding Window"],
  "Two Pointers": ["Two Pointers"],
  "Binary Search": ["Binary Search"],
  "Monotonic Stack": ["Monotonic Stack", "Stack"],
  "Monotonic Queue": ["Monotonic Queue", "Queue"],
  "Dynamic Programming": ["Dynamic Programming"],
  "Backtracking": ["Backtracking"],
  "Union-Find": ["Union-Find"],
  "Topological Sort": ["Topological Sort"],
  "Divide and Conquer": ["Divide and Conquer"],
  "Prefix Sum": ["Prefix Sum"],
  "Breadth-First Search": ["Breadth-First Search"],
  "Depth-First Search": ["Depth-First Search"],
  "Bit Manipulation": ["Bit Manipulation", "Bitmask"],

  // Curated mappings for AI-generated free-text concepts observed in
  // practice. Chosen by human judgment about what the concept actually
  // means, NOT mechanically inherited from any seed problem's own tags.
  "Greedy pairing of extremes after sorting": ["Greedy", "Two Pointers"],
  // "Intervals" is not a real tag in the LeetCode catalog; "Sweep Line" is
  // the closest real tag for a sorted-sweep/merge-interval technique.
  "Sorted sweep with running merge interval": ["Sorting", "Sweep Line"],
};

/**
 * @param {string} concept normalized concept name
 * @returns {Map<string, number>} lowercased specific tag -> weight (100 primary / 50 secondary)
 */
function getConceptTagWeights(concept) {
  const tags = CONCEPT_TAG_MAP[concept];
  if (!tags) return new Map();
  return new Map(tags.map((tag, i) => [tag.toLowerCase(), i === 0 ? 100 : 50]));
}

/**
 * Deterministic relevance score for one candidate problem against one
 * concept's specific tag weights: the best (max) weight among the
 * candidate's tags that are specific matches, ignoring GENERIC_TAGS
 * entirely and ignoring tags outside the concept's curated set. A
 * candidate sharing only generic tags (or no curated tag at all) scores 0.
 */
function relevanceScoreFor(problemTags, tagWeights) {
  let best = 0;
  for (const tag of problemTags) {
    const lower = tag.toLowerCase();
    if (GENERIC_TAGS.has(lower)) continue;
    const weight = tagWeights.get(lower);
    if (weight != null && weight > best) best = weight;
  }
  return best;
}

/**
 * Finds unsolved candidate problems from the GLOBAL LeetCodeProblemCatalog
 * (Phase 8 — independent of any user's submission history) that carry a
 * genuine specific-tag match for the concept: GLOBAL CATALOG minus the
 * user's Accepted problems, minus anything already used this run, filtered
 * to relevanceScore > 0 (see relevanceScoreFor — generic-tag-only overlap
 * does not count).
 */
async function findCandidateProblems({ tagWeights, solvedSlugs, excludeSlugs }) {
  const catalogProblems = await prisma.leetCodeProblemCatalog.findMany({ take: 3000 });

  return catalogProblems
    .filter((p) => !solvedSlugs.has(p.slug) && !excludeSlugs.has(p.slug))
    .map((p) => ({ problem: p, relevanceScore: relevanceScoreFor(p.topicTags, tagWeights) }))
    .filter((c) => c.relevanceScore > 0);
}

/**
 * Picks the single best candidate: specific-tag relevance first (a strong
 * concept match beats a merely difficulty-appropriate one), then how well
 * the difficulty fits current mastery, then a stable slug tiebreaker.
 */
function pickBestCandidate(candidates, masteryScore) {
  const scored = candidates
    .map(({ problem, relevanceScore }) => ({
      problem,
      relevanceScore,
      difficultyScore: difficultyScoreFor(problem.difficulty, masteryScore),
    }))
    .sort(
      (a, b) =>
        b.relevanceScore - a.relevanceScore ||
        b.difficultyScore - a.difficultyScore ||
        a.problem.slug.localeCompare(b.problem.slug)
    );
  return scored[0] || null;
}

/**
 * A catalog candidate has just been chosen for a recommendation. The
 * Recommendation/Concept tables have a foreign key into LeetCodeProblem
 * (the table Phase 3 sync + submissions actually use), not the catalog —
 * so mirror the chosen catalog row into LeetCodeProblem (upsert by
 * titleSlug, idempotent) without touching any submission data.
 */
async function ensureLeetCodeProblemFromCatalog(catalogProblem) {
  return prisma.leetCodeProblem.upsert({
    where: { titleSlug: catalogProblem.slug },
    create: {
      questionNumber: catalogProblem.questionNumber || catalogProblem.slug,
      title: catalogProblem.title,
      titleSlug: catalogProblem.slug,
      difficulty: catalogProblem.difficulty,
      topicTags: catalogProblem.topicTags,
      url: catalogProblem.url,
    },
    update: {
      title: catalogProblem.title,
      difficulty: catalogProblem.difficulty,
      topicTags: catalogProblem.topicTags,
      url: catalogProblem.url,
    },
  });
}

/**
 * Deterministically selects up to `limit` recommendations: the most urgent
 * concepts, each paired with its single best-fitting unsolved candidate
 * problem. One problem per concept, for topic diversity across the list.
 *
 * @param {string} clerkUserId
 * @param {{limit?:number}} [options]
 * @returns {Promise<Array<object>>}
 */
export async function selectRecommendationCandidates(clerkUserId, { limit = MAX_RECOMMENDATIONS } = {}) {
  const catalogCount = await prisma.leetCodeProblemCatalog.count();
  if (catalogCount === 0) {
    throw new CatalogNotInitializedError();
  }

  const rankedConcepts = await rankConceptsByUrgency(clerkUserId);
  if (rankedConcepts.length === 0) return [];

  // GLOBAL CATALOG minus USER'S ACCEPTED PROBLEMS: identify solved problems
  // by slug (the identifier shared between LeetCodeProblem and the catalog),
  // since the catalog holds problems this user may never have synced.
  const solvedSubmissions = await prisma.leetCodeSubmission.findMany({
    where: { account: { clerkUserId }, verdict: ACCEPTED_VERDICT },
    select: { problem: { select: { titleSlug: true } } },
  });
  const solvedSlugs = new Set(solvedSubmissions.map((s) => s.problem.titleSlug));

  const chosen = [];
  const usedSlugs = new Set();

  for (const c of rankedConcepts) {
    if (chosen.length >= limit) break;

    const tagWeights = getConceptTagWeights(c.concept);
    if (tagWeights.size === 0) continue;

    const candidates = await findCandidateProblems({
      tagWeights,
      solvedSlugs,
      excludeSlugs: usedSlugs,
    });
    if (candidates.length === 0) continue;

    const best = pickBestCandidate(candidates, c.masteryScore);
    if (!best) continue;

    usedSlugs.add(best.problem.slug);
    const mirroredProblem = await ensureLeetCodeProblemFromCatalog(best.problem);

    const priorityScore = Math.round(
      PROBLEM_WEIGHTS.conceptUrgency * c.conceptScore + PROBLEM_WEIGHTS.difficultyFit * best.difficultyScore
    );

    chosen.push({
      problem: mirroredProblem,
      targetConcept: c.concept,
      masteryScore: c.masteryScore,
      priorityScore: clamp(priorityScore, 0, 100),
      priorityLabel: priorityLabelFor(priorityScore),
      signals: c.signals,
    });
  }

  return chosen;
}

/**
 * Full Phase 8 pipeline: mark solved recommendations complete, deterministically
 * pick fresh candidates, and upsert them — calling Groq for a new explanation
 * only when a recommendation is new or its target concept actually changed.
 *
 * @param {string} clerkUserId
 * @returns {Promise<Array<object>>} the active Recommendation rows (with problem), highest priority first
 */
export async function getOrGenerateRecommendations(clerkUserId) {
  const solvedSubmissions = await prisma.leetCodeSubmission.findMany({
    where: { account: { clerkUserId }, verdict: ACCEPTED_VERDICT },
    select: { problemId: true },
  });
  const solvedProblemIds = new Set(solvedSubmissions.map((s) => s.problemId));

  // Completion handling: a previously recommended problem the user has since
  // solved is done — it should never be shown as an active recommendation again.
  const activeRecs = await prisma.recommendation.findMany({ where: { clerkUserId, completedAt: null } });
  await Promise.all(
    activeRecs
      .filter((r) => solvedProblemIds.has(r.problemId))
      .map((r) => prisma.recommendation.update({ where: { id: r.id }, data: { completedAt: new Date() } }))
  );

  const candidates = await selectRecommendationCandidates(clerkUserId);
  if (candidates.length === 0) return [];

  const freshProblemIds = candidates.map((c) => c.problem.id);

  // Prune active recommendations that fell out of the fresh top set — keeps
  // the table small instead of accumulating stale rows on every refresh.
  // Completed rows are left alone as a lightweight history.
  await prisma.recommendation.deleteMany({
    where: { clerkUserId, completedAt: null, problemId: { notIn: freshProblemIds } },
  });

  const results = [];
  for (const c of candidates) {
    const existing = await prisma.recommendation.findUnique({
      where: { clerkUserId_problemId: { clerkUserId, problemId: c.problem.id } },
    });

    let reason = existing?.reason ?? null;
    let aiModel = existing?.aiModel ?? null;

    // Reuse the stored explanation when nothing meaningful changed — only
    // call Groq for genuinely new recommendations (or if the target concept
    // driving this recommendation changed), per "avoid calling Groq unnecessarily."
    if (!existing || existing.targetConcept !== c.targetConcept || !reason) {
      try {
        const explained = await explainRecommendation({
          targetConcept: c.targetConcept,
          masteryScore: c.masteryScore,
          recentFailureCount: c.signals.recentFailureCount,
          revisionStatus: c.signals.revisionStatus,
          problemTitle: c.problem.title,
          difficulty: c.problem.difficulty,
          tags: c.problem.topicTags,
        });
        reason = explained.reason;
        aiModel = explained.aiModel;
      } catch (err) {
        const message = err instanceof GroqServiceError ? err.message : err.message;
        console.error("[RECOMMENDATION_EXPLAIN_ERROR]", message);
        reason =
          reason ||
          `Your ${c.targetConcept} mastery is currently ${c.masteryScore}%. This ${c.problem.difficulty} problem targets that same concept at a suitable difficulty.`;
        aiModel = aiModel || null;
      }
    }

    const saved = await prisma.recommendation.upsert({
      where: { clerkUserId_problemId: { clerkUserId, problemId: c.problem.id } },
      create: {
        clerkUserId,
        problemId: c.problem.id,
        targetConcept: c.targetConcept,
        reason,
        priorityScore: c.priorityScore,
        aiModel,
      },
      update: {
        targetConcept: c.targetConcept,
        reason,
        priorityScore: c.priorityScore,
        aiModel,
        generatedAt: new Date(),
      },
      include: { problem: true },
    });

    results.push({ ...saved, priorityLabel: c.priorityLabel, masteryScore: c.masteryScore });
  }

  return results.sort((a, b) => b.priorityScore - a.priorityScore);
}
