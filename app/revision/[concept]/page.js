import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/revision" className="text-sm text-blue-600 hover:underline">
        &larr; Back to Revision Queue
      </Link>

      <RevisionWorkspace
        concept={concept}
        mastery={{ masteryScore: schedule.mastery.masteryScore, status: schedule.mastery.status }}
        microProofId={microProof.id}
        question={microProof.question}
        history={history}
      />
    </div>
  );
}
