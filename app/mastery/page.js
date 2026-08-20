import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { CARD_PADDED, pageClass } from "@/lib/theme";

export default async function MasteryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const mastery = await prisma.conceptMastery.findMany({
    where: { clerkUserId: userId },
    orderBy: { masteryScore: "desc" },
  });

  return (
    <div className={pageClass("max-w-4xl")}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Concept Mastery</h1>
        <p className="text-slate-600 mt-1">
          A deterministic score for how well you understand each concept, calculated from
          your Micro-Proof answers, failure history, and solved problems.
        </p>
      </div>

      {mastery.length === 0 && (
        <EmptyState
          message="Complete a few Micro-Proofs to build your learning profile."
          actionHref="/concepts"
          actionLabel="Extract a concept"
        />
      )}

      {mastery.length > 0 && (
        <ul className="space-y-3">
          {mastery.map((m) => (
            <li key={m.concept} className={`${CARD_PADDED} p-5`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="font-semibold text-slate-900">{m.concept}</h2>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-2xl font-bold text-slate-900">{m.masteryScore}%</span>
                  <Badge status={m.status} />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 space-y-1">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Evidence
                </h3>
                <ul className="space-y-0.5">
                  <li>
                    Micro-Proof average:{" "}
                    {m.averageMicroProofScore !== null ? `${m.averageMicroProofScore.toFixed(1)}/10` : "No attempts yet"}
                  </li>
                  <li>Micro-Proof attempts: {m.totalMicroProofAttempts}</li>
                  <li>Concept-specific failures: {m.failureCount}</li>
                  <li>Accepted problems: {m.successfulProblemCount}</li>
                </ul>
                <p className="text-xs text-slate-400 pt-1">
                  Last evaluated {new Date(m.lastEvaluatedAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
