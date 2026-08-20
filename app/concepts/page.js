import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ACCEPTED_VERDICT } from "@/lib/constants";
import EmptyState from "@/components/ui/EmptyState";
import { CARD, DIFFICULTY_STYLES, pageClass } from "@/lib/theme";

export default async function ConceptsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const account = await prisma.leetCodeAccount.findUnique({
    where: { clerkUserId: userId },
  });

  const acceptedSubmissions = account
    ? await prisma.leetCodeSubmission.findMany({
        where: {
          accountId: account.id,
          verdict: ACCEPTED_VERDICT,
        },
        include: { problem: true },
        orderBy: { timestamp: "desc" },
      })
    : [];

  // Dedupe to the most recent accepted submission per problem.
  const seenProblems = new Set();
  const problems = [];
  for (const sub of acceptedSubmissions) {
    if (seenProblems.has(sub.problemId)) continue;
    seenProblems.add(sub.problemId);
    problems.push(sub);
  }

  const concepts = problems.length
    ? await prisma.concept.findMany({
        where: { clerkUserId: userId, problemId: { in: problems.map((p) => p.problemId) } },
        select: { problemId: true },
      })
    : [];
  const extractedProblemIds = new Set(concepts.map((c) => c.problemId));

  return (
    <div className={pageClass("max-w-5xl")}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Micro-Proofs</h1>
        <p className="text-slate-600 mt-1">
          Pick a problem you&apos;ve solved to extract its core concept and test your
          understanding with a short active-recall question.
        </p>
      </div>

      {!account && (
        <EmptyState
          message="No LeetCode account connected yet."
          actionHref="/settings"
          actionLabel="Connect your LeetCode profile"
        />
      )}

      {account && problems.length === 0 && (
        <EmptyState
          message="No accepted submissions found yet. Sync your LeetCode data again, or solve a problem first."
          actionHref="/settings"
          actionLabel="Sync LeetCode data"
        />
      )}

      {problems.length > 0 && (
        <ul className="space-y-3">
          {problems.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/concepts/${sub.id}`}
                className={`block ${CARD} p-5 hover:border-blue-300 hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-slate-900 truncate">
                        {sub.problem.title}
                      </h2>
                      <span className={`text-xs font-semibold ${DIFFICULTY_STYLES[sub.problem.difficulty] || "text-slate-500"}`}>
                        {sub.problem.difficulty}
                      </span>
                      {extractedProblemIds.has(sub.problemId) && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Concept Extracted
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {sub.problem.topicTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{sub.language}</span>
                      <span>{new Date(sub.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    {sub.verdict}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
