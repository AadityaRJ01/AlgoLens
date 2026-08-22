import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ACCEPTED_VERDICT } from "@/lib/constants";
import EmptyState from "@/components/ui/EmptyState";
import { DARK_CARD, DARK_DIFFICULTY_STYLES, pageClass } from "@/lib/theme";

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
    <div className="min-h-screen bg-[#0B0F17] text-slate-50">
      <div className={pageClass("max-w-5xl")}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Micro-Proofs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Pick a problem you&apos;ve solved to extract its core concept and test your
            understanding with a short active-recall question.
          </p>
        </div>

        {!account && (
          <EmptyState
            tone="dark"
            message="No LeetCode account connected yet."
            actionHref="/settings"
            actionLabel="Connect your LeetCode profile"
          />
        )}

        {account && problems.length === 0 && (
          <EmptyState
            tone="dark"
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
                  className={`block ${DARK_CARD} p-5 transition-all hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-500/5`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-white truncate">
                          {sub.problem.title}
                        </h2>
                        <span className={`text-xs font-semibold ${DARK_DIFFICULTY_STYLES[sub.problem.difficulty] || "text-slate-400"}`}>
                          {sub.problem.difficulty}
                        </span>
                        {extractedProblemIds.has(sub.problemId) && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 text-indigo-300">
                            Concept Extracted
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {sub.problem.topicTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50"
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
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                      {sub.verdict}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
