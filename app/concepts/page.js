import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ACCEPTED_VERDICT } from "@/lib/constants";

const DIFFICULTY_STYLES = {
  Easy: "text-emerald-600",
  Medium: "text-amber-500",
  Hard: "text-rose-500",
};

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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Micro-Proofs</h1>
        <p className="text-slate-600 mt-1">
          Pick a problem you&apos;ve solved to extract its core concept and test your
          understanding with a short active-recall question.
        </p>
      </div>

      {!account && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600">
          No LeetCode account connected yet.{" "}
          <Link href="/settings" className="text-blue-600 hover:underline font-medium">
            Connect your LeetCode profile
          </Link>{" "}
          to import submissions.
        </div>
      )}

      {account && problems.length === 0 && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600">
          No accepted submissions found yet.{" "}
          <Link href="/settings" className="text-blue-600 hover:underline font-medium">
            Sync your LeetCode data
          </Link>{" "}
          again, or solve a problem first.
        </div>
      )}

      {problems.length > 0 && (
        <ul className="space-y-3">
          {problems.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/concepts/${sub.id}`}
                className="block bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all"
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
