import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { priorityLabelFor } from "@/lib/recommendations";
import { pageClass } from "@/lib/theme";
import RevisionWorkspace from "./RevisionWorkspace";

export default async function RevisionConceptPage({ params }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { concept: rawConcept } = await params;
  const concept = decodeURIComponent(rawConcept || "");

  const schedule = await prisma.revisionSchedule.findUnique({
    where: { clerkUserId_concept: { clerkUserId: userId, concept } },
    include: { mastery: true },
  });

  // Only the owning Clerk user has a schedule row for their own (clerkUserId, concept).
  if (!schedule) {
    notFound();
  }

  const concepts = await prisma.concept.findMany({
    where: { clerkUserId: userId },
    include: {
      microProofs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { attempts: { orderBy: { createdAt: "asc" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const matching = concepts.filter(
    (c) => normalizeConceptName(c.name) === concept && c.microProofs.length > 0
  );
  if (matching.length === 0) {
    notFound();
  }

  // The most recently extracted matching Concept's Micro-Proof is what the
  // user answers again — we never generate a new question for a revision.
  const microProof = matching[0].microProofs[0];
  // Real "quick concept review" text — the most recent extracted
  // Concept.coreIdea for this concept (same field /concepts already shows).
  const coreIdea = matching[0].coreIdea;

  // Full history spans every attempt across every matching Concept's
  // Micro-Proof (chronological), so the count lines up with reviewCount.
  const history = matching
    .flatMap((c) => c.microProofs[0]?.attempts || [])
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((a) => ({
      id: a.id,
      score: a.score,
      intervalDaysAfterReview: a.intervalDaysAfterReview,
      createdAt: a.createdAt.toISOString(),
    }));

  // Real "Now Apply It" recommendation — prefers one targeting this
  // concept, same pattern already used on /analyze and /mastery.
  const recommendationRows = await prisma.recommendation.findMany({
    where: { clerkUserId: userId, completedAt: null },
    include: { problem: true },
    orderBy: { priorityScore: "desc" },
    take: 10,
  });
  const recommendationRow = recommendationRows.find((r) => r.targetConcept === concept) || recommendationRows[0] || null;
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

  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-3xl")}>
        <Link href="/revision" className="text-sm text-neutral-500 hover:text-neutral-300">
          ← Back to Revision
        </Link>

        <RevisionWorkspace
          concept={concept}
          mastery={{ masteryScore: schedule.mastery.masteryScore, status: schedule.mastery.status }}
          coreIdea={coreIdea}
          microProofId={microProof.id}
          question={microProof.question}
          history={history}
          recommendation={recommendation}
        />
      </div>
    </div>
  );
}
