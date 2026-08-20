// lib/doubtSolverContext.js
//
// Phase 9: shared best-effort personalization lookup for the Doubt Solver.
// Used by both the hint endpoint and the full-solution endpoint so the two
// stay consistent without duplicating the Prisma lookups. Never throws —
// a lookup failure just means less personalized context, not a failed request.

import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";

/**
 * @param {string} userId
 * @param {{topicTags?: string[], problemSlug?: string}} [options]
 * @returns {Promise<{masteryContext: object|null, failureContext: object|null}>}
 */
export async function getDoubtPersonalizationContext(userId, { topicTags = [], problemSlug = "" } = {}) {
  let masteryContext = null;
  let failureContext = null;

  try {
    for (const tag of topicTags) {
      const candidate = normalizeConceptName(tag);
      if (!candidate) continue;
      const mastery = await prisma.conceptMastery.findUnique({
        where: { clerkUserId_concept: { clerkUserId: userId, concept: candidate } },
      });
      if (mastery) {
        masteryContext = {
          concept: mastery.concept,
          masteryScore: mastery.masteryScore,
          status: mastery.status,
          failureCount: mastery.failureCount,
        };
        break;
      }
    }

    if (problemSlug) {
      const problem = await prisma.leetCodeProblem.findUnique({ where: { titleSlug: problemSlug } });
      if (problem) {
        const latestFailure = await prisma.failureAnalysis.findFirst({
          where: { clerkUserId: userId, submission: { problemId: problem.id } },
          orderBy: { createdAt: "desc" },
        });
        if (latestFailure) {
          failureContext = {
            rootCause: latestFailure.rootCause,
            preventionRule: latestFailure.preventionRule,
          };
        }
      }
    }
  } catch (err) {
    console.error("[DOUBT_SOLVER_CONTEXT_ERROR]", err.message);
  }

  return { masteryContext, failureContext };
}
