import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import FailureAnalyzer from "./FailureAnalyzer";
import { pageClass } from "@/lib/theme";

export default async function FailureDetailPage({ params }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const submission = await prisma.leetCodeSubmission.findUnique({
    where: { id },
    include: {
      problem: true,
      account: true,
      failureAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // Only the owning Clerk user may view/analyze this submission.
  if (!submission || submission.account.clerkUserId !== userId) {
    notFound();
  }

  const plainSubmission = {
    id: submission.id,
    verdict: submission.verdict,
    language: submission.language,
    runtime: submission.runtime,
    memory: submission.memory,
    timestamp: submission.timestamp.toISOString(),
    sourceCode: submission.sourceCode,
    problem: {
      title: submission.problem.title,
      difficulty: submission.problem.difficulty,
      topicTags: submission.problem.topicTags,
      url: submission.problem.url,
    },
  };

  const initialAnalysis = submission.failureAnalyses[0]
    ? {
        rootCause: submission.failureAnalyses[0].rootCause,
        failureCategory: submission.failureAnalyses[0].failureCategory,
        concept: submission.failureAnalyses[0].concept,
        evidence: submission.failureAnalyses[0].evidence,
        preventionRule: submission.failureAnalyses[0].preventionRule,
        suggestedFollowUp: submission.failureAnalyses[0].suggestedFollowUp,
        failingTestCase: submission.failureAnalyses[0].failingTestCase,
        aiModel: submission.failureAnalyses[0].aiModel,
        createdAt: submission.failureAnalyses[0].createdAt.toISOString(),
      }
    : null;

  return (
    <div className={pageClass("max-w-4xl")}>
      <Link href="/failures" className="text-sm text-blue-600 hover:underline">
        &larr; Back to failed submissions
      </Link>

      <FailureAnalyzer submission={plainSubmission} initialAnalysis={initialAnalysis} />
    </div>
  );
}
