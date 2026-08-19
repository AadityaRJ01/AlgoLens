import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ACCEPTED_VERDICT } from "@/lib/constants";
import ConceptWorkspace from "./ConceptWorkspace";

export default async function ConceptDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const submission = await prisma.leetCodeSubmission.findUnique({
    where: { id },
    include: { problem: true, account: true },
  });

  // Only the owning Clerk user may view this submission, and only accepted
  // submissions are eligible for concept extraction.
  if (!submission || submission.account.clerkUserId !== userId || submission.verdict !== ACCEPTED_VERDICT) {
    notFound();
  }

  const existingConcept = await prisma.concept.findUnique({
    where: { clerkUserId_problemId: { clerkUserId: userId, problemId: submission.problemId } },
    include: {
      microProofs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { attempts: { orderBy: { createdAt: "desc" } } },
      },
    },
  });

  const plainSubmission = {
    id: submission.id,
    language: submission.language,
    timestamp: submission.timestamp.toISOString(),
    sourceCode: submission.sourceCode,
    problem: {
      title: submission.problem.title,
      difficulty: submission.problem.difficulty,
      topicTags: submission.problem.topicTags,
      url: submission.problem.url,
    },
  };

  const initialConcept = existingConcept
    ? {
        id: existingConcept.id,
        name: existingConcept.name,
        coreIdea: existingConcept.coreIdea,
        invariant: existingConcept.invariant,
        aiModel: existingConcept.aiModel,
        createdAt: existingConcept.createdAt.toISOString(),
      }
    : null;

  const latestMicroProof = existingConcept?.microProofs?.[0];
  const initialMicroProof = latestMicroProof
    ? {
        id: latestMicroProof.id,
        question: latestMicroProof.question,
        expectedPoints: latestMicroProof.expectedPoints,
        createdAt: latestMicroProof.createdAt.toISOString(),
        // Attempt history only — the editable answer field always starts blank.
        attempts: latestMicroProof.attempts.map((a) => ({
          id: a.id,
          answer: a.answer,
          score: a.score,
          understanding: a.understanding,
          whatWasCorrect: a.whatWasCorrect,
          missingPoints: a.missingPoints,
          feedback: a.feedback,
          createdAt: a.createdAt.toISOString(),
        })),
      }
    : null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/concepts" className="text-sm text-blue-600 hover:underline">
        &larr; Back to Micro-Proofs
      </Link>

      <ConceptWorkspace
        submission={plainSubmission}
        initialConcept={initialConcept}
        initialMicroProof={initialMicroProof}
      />
    </div>
  );
}
