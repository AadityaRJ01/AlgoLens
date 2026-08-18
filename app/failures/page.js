import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { FAILING_VERDICTS } from "@/lib/constants";

const VERDICT_STYLES = {
  "Wrong Answer": "bg-rose-50 text-rose-700 border-rose-200",
  "Time Limit Exceeded": "bg-amber-50 text-amber-700 border-amber-200",
  "Memory Limit Exceeded": "bg-purple-50 text-purple-700 border-purple-200",
};

const DIFFICULTY_STYLES = {
  Easy: "text-emerald-600",
  Medium: "text-amber-500",
  Hard: "text-rose-500",
};

export default async function FailuresPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const account = await prisma.leetCodeAccount.findUnique({
    where: { clerkUserId: userId },
  });

  const submissions = account
    ? await prisma.leetCodeSubmission.findMany({
        where: {
          accountId: account.id,
          verdict: { in: FAILING_VERDICTS },
        },
        include: {
          problem: true,
          failureAnalyses: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { id: true },
          },
        },
        orderBy: { timestamp: "desc" },
      })
    : [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Failed Submissions</h1>
        <p className="text-slate-600 mt-1">
          Select a failed submission to find out why it didn&apos;t pass.
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

      {account && submissions.length === 0 && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600">
          No failed submissions found. Either you haven&apos;t failed anything recently, or you
          need to{" "}
          <Link href="/settings" className="text-blue-600 hover:underline font-medium">
            sync your LeetCode data
          </Link>{" "}
          again.
        </div>
      )}

      {submissions.length > 0 && (
        <ul className="space-y-3">
          {submissions.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/failures/${sub.id}`}
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
                      {sub.failureAnalyses.length > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Analyzed
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
                      {sub.runtime && <span>Runtime: {sub.runtime}</span>}
                      {sub.memory && <span>Memory: {sub.memory}</span>}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${VERDICT_STYLES[sub.verdict] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
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
