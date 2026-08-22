import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { fetchProblemDescription } from "@/lib/leetcode";
import { FAILING_VERDICTS, ACCEPTED_VERDICT } from "@/lib/constants";
import { priorityLabelFor } from "@/lib/recommendations";
import { buildConceptTrends } from "@/lib/dashboard";
import { pageClass } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";
import AnalyzeWorkspace from "@/components/analyze/AnalyzeWorkspace";

// The core AlgoLens experience: Code -> Failure -> Root Cause -> Concept ->
// Mastery -> Micro-Proof -> Recommendation, in one workspace. This page does
// all the real data fetching (server-only) and hands fully-resolved,
// serializable props to the client workspace; the client side only owns the
// editable source code, the analyze request, and post-analysis mastery
// refresh (see AnalyzeWorkspace.js). No AI/analysis logic is duplicated —
// the real POST /api/failures/analyze (Phase 4) is reused as-is.
export default async function AnalyzePage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  const account = await prisma.leetCodeAccount.findUnique({ where: { clerkUserId: userId } });

  if (!account) {
    return (
      <Shell>
        <EmptyState
          tone="dark"
          message="Connect your LeetCode account to start analyzing submissions."
          actionHref="/settings"
          actionLabel="Connect LeetCode"
        />
      </Shell>
    );
  }

  const recentSubmissions = await prisma.leetCodeSubmission.findMany({
    where: { accountId: account.id },
    include: { problem: { select: { title: true, difficulty: true } } },
    orderBy: { timestamp: "desc" },
    take: 8,
  });

  if (recentSubmissions.length === 0) {
    return (
      <Shell>
        <EmptyState
          tone="dark"
          message="No submissions found yet. Sync your LeetCode data to get started."
          actionHref="/settings"
          actionLabel="Sync LeetCode data"
        />
      </Shell>
    );
  }

  const requestedId = typeof params?.submission === "string" ? params.submission : null;
  const defaultSubmission =
    recentSubmissions.find((s) => s.id === requestedId) ||
    recentSubmissions.find((s) => FAILING_VERDICTS.includes(s.verdict)) ||
    recentSubmissions[0];

  const submission = await prisma.leetCodeSubmission.findUnique({
    where: { id: defaultSubmission.id },
    include: {
      problem: true,
      account: true,
      failureAnalyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!submission || submission.account.clerkUserId !== userId) {
    return (
      <Shell>
        <EmptyState tone="dark" message="That submission couldn't be found." actionHref="/analyze" actionLabel="Back to Analyze" />
      </Shell>
    );
  }

  const canAnalyze = FAILING_VERDICTS.includes(submission.verdict);
  const isAccepted = submission.verdict === ACCEPTED_VERDICT;

  const [problemDescription, microProofSource, acceptedForProblem, allMasteries, microProofAttempts] = await Promise.all([
    fetchProblemDescription(submission.problem.titleSlug).catch(() => null),
    prisma.concept.findUnique({
      where: { clerkUserId_problemId: { clerkUserId: userId, problemId: submission.problemId } },
      include: {
        microProofs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { attempts: { where: { clerkUserId: userId }, orderBy: { createdAt: "desc" } } },
        },
      },
    }),
    prisma.leetCodeSubmission.findFirst({
      where: { problemId: submission.problemId, verdict: ACCEPTED_VERDICT, account: { clerkUserId: userId } },
      select: { id: true },
      orderBy: { timestamp: "desc" },
    }),
    prisma.conceptMastery.findMany({ where: { clerkUserId: userId } }),
    prisma.microProofAttempt.findMany({
      where: { clerkUserId: userId },
      select: {
        score: true,
        createdAt: true,
        microProof: { select: { concept: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

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

  const masteryByConcept = new Map(allMasteries.map((m) => [m.concept, m.masteryScore]));
  const trends = buildConceptTrends(microProofAttempts);

  const relevantConcept = isAccepted ? microProofSource?.name || null : initialAnalysis?.concept || null;
  const normalizedRelevantConcept = relevantConcept ? normalizeConceptName(relevantConcept) || relevantConcept : null;
  const mastery = normalizedRelevantConcept
    ? {
        concept: normalizedRelevantConcept,
        score: masteryByConcept.get(normalizedRelevantConcept) ?? null,
        trend: trends.get(normalizedRelevantConcept) || null,
      }
    : null;

  const microProof =
    microProofSource?.microProofs?.[0] && acceptedForProblem
      ? {
          id: microProofSource.microProofs[0].id,
          question: microProofSource.microProofs[0].question,
          conceptSubmissionId: acceptedForProblem.id,
          attempts: microProofSource.microProofs[0].attempts.map((a) => ({
            id: a.id,
            score: a.score,
            understanding: a.understanding,
            feedback: a.feedback,
            createdAt: a.createdAt.toISOString(),
          })),
        }
      : null;

  const recommendationRows = await prisma.recommendation.findMany({
    where: { clerkUserId: userId, completedAt: null },
    include: { problem: true },
    orderBy: { priorityScore: "desc" },
    take: 10,
  });
  const recommendationRow =
    recommendationRows.find((r) => r.targetConcept === normalizedRelevantConcept) || recommendationRows[0] || null;
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

  const successConcept =
    isAccepted && microProofSource
      ? { name: microProofSource.name, coreIdea: microProofSource.coreIdea }
      : null;

  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-[100rem]")}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">Analyze</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Understand your solution, identify your mistakes, and learn what to practice next.
          </p>
          <FlowStrip />
        </div>

        <AnalyzeWorkspace
          submission={{
            id: submission.id,
            verdict: submission.verdict,
            language: submission.language,
            runtime: submission.runtime,
            memory: submission.memory,
            timestamp: submission.timestamp.toISOString(),
            sourceCode: submission.sourceCode || "",
            problem: {
              title: submission.problem.title,
              difficulty: submission.problem.difficulty,
              topicTags: submission.problem.topicTags,
              url: submission.problem.url,
            },
          }}
          problemDescription={problemDescription}
          canAnalyze={canAnalyze}
          isAccepted={isAccepted}
          initialAnalysis={initialAnalysis}
          mastery={mastery}
          microProof={microProof}
          recommendation={recommendation}
          successConcept={successConcept}
          recentSubmissions={recentSubmissions.map((s) => ({
            id: s.id,
            title: s.problem.title,
            difficulty: s.problem.difficulty,
            verdict: s.verdict,
            isSelected: s.id === submission.id,
          }))}
        />
      </div>
    </div>
  );
}

// The learning-flow strip under the header — each stage gets its own
// subtle, muted tint (rather than one flat gray line) so the pipeline reads
// as a sequence of distinct steps at a glance. Purely decorative text; see
// AGENTS.md's dedicated color-hierarchy pass for the exact stage->color map.
const FLOW_STAGES = [
  { label: "Code", tone: "text-blue-400/80" },
  { label: "Failure", tone: "text-rose-400/80" },
  { label: "Root Cause", tone: "text-amber-400/80" },
  { label: "Concept", tone: "text-purple-400/80" },
  { label: "Mastery", tone: "text-blue-400/80" },
  { label: "Micro-Proof", tone: "text-cyan-400/80" },
  { label: "Recommendation", tone: "text-emerald-400/80" },
];

function FlowStrip() {
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
      {FLOW_STAGES.map((stage, i) => (
        <span key={stage.label} className="flex items-center gap-1.5">
          <span className={stage.tone}>{stage.label}</span>
          {i < FLOW_STAGES.length - 1 && <span className="text-neutral-700">→</span>}
        </span>
      ))}
    </p>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-3xl")}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">Analyze</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Understand your solution, identify your mistakes, and learn what to practice next.
          </p>
          <FlowStrip />
        </div>
        {children}
      </div>
    </div>
  );
}
