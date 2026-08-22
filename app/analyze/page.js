import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { FAILING_VERDICTS } from "@/lib/constants";
import { DARK_CARD, DARK_CARD_PADDED, DARK_BTN_PRIMARY, DARK_BTN_SECONDARY, DARK_DIFFICULTY_STYLES, pageClass } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";

// The dashboard-family "Analyze" surface. This is a foundation over real
// data, not a rebuild of the AI analysis engine: the actual "why did I
// fail?" analysis already lives at /failures/[id] (FailureAnalyzer.js,
// /api/failures/analyze). This page reads the most recently generated
// FailureAnalysis (real stored data — rootCause/concept/evidence/
// preventionRule/suggestedFollowUp, all AI-authored by Phase 4, never
// fabricated here) and presents it in the three-pane
// problem/code/analysis layout, with a hand-off into /failures to analyze
// a different (or new) submission.
export default async function AnalyzePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const account = await prisma.leetCodeAccount.findUnique({ where: { clerkUserId: userId } });

  const [latestAnalysis, recentFailures] = await Promise.all([
    prisma.failureAnalysis.findFirst({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
      include: { submission: { include: { problem: true } } },
    }),
    account
      ? prisma.leetCodeSubmission.findMany({
          where: { accountId: account.id, verdict: { in: FAILING_VERDICTS } },
          include: { problem: true },
          orderBy: { timestamp: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  let masteryScore = null;
  if (latestAnalysis) {
    const concept = normalizeConceptName(latestAnalysis.concept) || latestAnalysis.concept;
    const mastery = await prisma.conceptMastery.findUnique({
      where: { clerkUserId_concept: { clerkUserId: userId, concept } },
      select: { masteryScore: true },
    });
    masteryScore = mastery?.masteryScore ?? null;
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-6xl")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">Analyze</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Why did your last submission fail — and what should you understand instead?
            </p>
          </div>
          <Link href="/failures" className={DARK_BTN_SECONDARY}>
            Analyze another submission
          </Link>
        </div>

        {!account && (
          <EmptyState
            tone="dark"
            message="Connect your LeetCode account to start analyzing failed submissions."
            actionHref="/settings"
            actionLabel="Connect LeetCode"
          />
        )}

        {account && !latestAnalysis && (
          <EmptyState
            tone="dark"
            message="No failure analysis yet. Pick a failed submission and AlgoLens will diagnose it."
            actionHref="/failures"
            actionLabel="Choose a submission to analyze"
          />
        )}

        {latestAnalysis && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-start">
            {/* left: problem info */}
            <div className={DARK_CARD_PADDED}>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Problem</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-neutral-50">
                  {latestAnalysis.submission.problem.title}
                </h2>
                <span className={`text-sm font-semibold ${DARK_DIFFICULTY_STYLES[latestAnalysis.submission.problem.difficulty] || "text-neutral-400"}`}>
                  {latestAnalysis.submission.problem.difficulty}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {latestAnalysis.submission.problem.topicTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-neutral-400">
                    {tag}
                  </span>
                ))}
              </div>
              <dl className="mt-4 space-y-1.5 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <dt>Verdict</dt>
                  <dd className="text-rose-300 font-medium">{latestAnalysis.submission.verdict}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Language</dt>
                  <dd className="text-neutral-300">{latestAnalysis.submission.language}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Analyzed</dt>
                  <dd className="text-neutral-300">{new Date(latestAnalysis.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
              <Link href={`/failures/${latestAnalysis.submission.id}`} className={`mt-4 block text-center ${DARK_BTN_SECONDARY}`}>
                Open full submission
              </Link>
            </div>

            {/* center: code */}
            <div className={DARK_CARD}>
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-2 text-xs text-neutral-500">Submitted code</span>
              </div>
              <pre className="max-h-[28rem] overflow-auto p-4 text-xs leading-relaxed text-neutral-300">
                <code>{latestAnalysis.submission.sourceCode || "No source code was stored for this submission."}</code>
              </pre>
            </div>

            {/* right: AI analysis */}
            <div className={DARK_CARD_PADDED}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                  ✕ Incorrect
                </span>
              </div>
              <h2 className="mt-3 text-base font-semibold text-neutral-50">AI Analysis</h2>

              <AnalysisField label="Root Cause" value={latestAnalysis.rootCause} tone="rose" />
              <AnalysisField label="Concept" value={latestAnalysis.concept} />
              <AnalysisField label="Your Mistake" value={latestAnalysis.evidence} />
              <AnalysisField label="What You Should Understand" value={latestAnalysis.preventionRule} />

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Concept Mastery</p>
                {masteryScore !== null ? (
                  <>
                    <div className="mt-1.5 flex items-center justify-between text-sm">
                      <span className="text-neutral-300">{latestAnalysis.concept}</span>
                      <span className="font-semibold text-neutral-100">{masteryScore}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${masteryScore}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-neutral-500">Not enough evidence yet.</p>
                )}
              </div>

              <AnalysisField label="Recommended Next" value={latestAnalysis.suggestedFollowUp} />
            </div>
          </div>
        )}

        {recentFailures.length > 1 && (
          <section className={DARK_CARD_PADDED}>
            <h2 className="text-sm font-semibold text-neutral-300">Other recent failed submissions</h2>
            <ul className="mt-3 space-y-2">
              {recentFailures
                .filter((s) => s.id !== latestAnalysis?.submission.id)
                .slice(0, 4)
                .map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/failures/${s.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5"
                    >
                      <span className="truncate">{s.problem.title}</span>
                      <span className="shrink-0 text-xs text-neutral-500">{s.verdict}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function AnalysisField({ label, value, tone }) {
  return (
    <div className={`mt-4 rounded-lg border px-3 py-2.5 ${tone === "rose" ? "border-rose-400/20 bg-rose-500/[0.07]" : "border-white/10 bg-white/[0.03]"}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${tone === "rose" ? "text-rose-300" : "text-neutral-500"}`}>
        {label}
      </p>
      <p className="mt-1 text-sm text-neutral-200 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
