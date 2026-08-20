import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard";
import { CARD_PADDED, DIFFICULTY_STYLES, PRIORITY_STYLES, STATUS_STYLES, BTN_PRIMARY, BTN_SECONDARY, pageClass } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import MasteryBarChart from "./MasteryBarChart";
import MasteryTrendChart from "./MasteryTrendChart";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const ACTIVITY_ICON = {
  SOLVED: "✅",
  FAILURE: "🩺",
  MICROPROOF: "🧠",
  REVISION: "🔁",
  MASTERY: "📈",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [user, data] = await Promise.all([currentUser(), getDashboardData(userId)]);
  const firstName = user?.firstName || "there";
  const hasAnyMastery = data.masteryList.length > 0;

  return (
    <div className={pageClass()}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-slate-600 mt-1">Your personalized DSA learning overview.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Concept Mastery"
          value={data.summary.overallMasteryPercent !== null ? `${data.summary.overallMasteryPercent}%` : "—"}
        />
        <SummaryCard label="Concepts to Improve" value={data.summary.conceptsToImprove} />
        <SummaryCard label="Reviews Due" value={data.summary.reviewsDueCount} />
        <SummaryCard label="Problems Solved" value={data.summary.problemsSolved} />
      </div>

      {/* Concept Mastery */}
      <section className={CARD_PADDED}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Concept Mastery</h2>
          <Link href="/mastery" className="text-sm font-medium text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {!hasAnyMastery && (
          <p className="text-sm text-slate-600">
            Complete a few Micro-Proofs to build your learning profile.
          </p>
        )}

        {hasAnyMastery && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ul className="space-y-2">
              {data.masteryList.map((m) => (
                <li key={m.concept} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-800 truncate">{m.concept}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-slate-900">{m.masteryScore}%</span>
                    <Badge status={m.status} />
                  </div>
                </li>
              ))}
            </ul>
            <MasteryBarChart data={data.masteryList} />
          </div>
        )}
      </section>

      {/* Mastery Progression */}
      <section className={CARD_PADDED}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Mastery Progress</h2>
        {data.trend ? (
          <>
            <p className="text-sm text-slate-500 mb-2">
              Micro-Proof score trend for <span className="font-medium text-slate-700">{data.trend.concept}</span>
            </p>
            <MasteryTrendChart data={data.trend.data} concept={data.trend.concept} />
          </>
        ) : (
          <p className="text-sm text-slate-600">Complete more Micro-Proofs to see your mastery trend.</p>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revision */}
        <section className={CARD_PADDED}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revision</h2>
          {data.revision.items.length === 0 ? (
            <p className="text-sm text-slate-600">You&apos;re all caught up.</p>
          ) : (
            <ul className="space-y-3">
              {data.revision.items.map((item) => (
                <li key={item.concept} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800 truncate">{item.concept}</span>
                  <Badge
                    className={item.isOverdueOrDueToday ? STATUS_STYLES.WEAK : STATUS_STYLES.DEVELOPING}
                  >
                    {item.label}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Link href="/revision" className={`inline-block mt-4 ${BTN_SECONDARY}`}>
            View Revision Queue
          </Link>
        </section>

        {/* Failure Insights */}
        <section className={CARD_PADDED}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Failure Patterns</h2>
          {data.failurePatterns.length === 0 ? (
            <p className="text-sm text-slate-600">No failure patterns recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.failurePatterns.map((p) => (
                <li key={p.concept} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-800 truncate">{p.concept}</span>
                  <span className="text-slate-500 shrink-0">
                    {p.count} failure{p.count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/failures" className={`inline-block mt-4 ${BTN_SECONDARY}`}>
            View Failure Analysis
          </Link>
        </section>
      </div>

      {/* Recommended Practice */}
      <section className={CARD_PADDED}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recommended Practice</h2>
          <Link href="/recommendations" className="text-sm font-medium text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {data.recommendations.length === 0 ? (
          <EmptyState message="Complete more problems and Micro-Proofs to unlock personalized recommendations." />
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recommendations.map((rec) => (
              <li key={rec.id} className="border border-slate-200 rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{rec.problem.title}</h3>
                  <span className={`text-xs font-semibold ${DIFFICULTY_STYLES[rec.problem.difficulty] || "text-slate-500"}`}>
                    {rec.problem.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Target: {rec.targetConcept} · Mastery: {rec.masteryScore ?? "—"}%
                </p>
                <span
                  className={`self-start mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[rec.priorityLabel] || PRIORITY_STYLES.Low}`}
                >
                  {rec.priorityLabel} priority
                </span>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 flex-1">{rec.reason}</p>
                {rec.problem.url && (
                  <a
                    href={rec.problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-3 text-center ${BTN_PRIMARY}`}
                  >
                    Practice
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* AI Doubt Solver access */}
      <section className={`${CARD_PADDED} flex items-center justify-between gap-4 flex-wrap`}>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Stuck on a problem?</h2>
          <p className="text-sm text-slate-600 mt-1">Get progressive hints from your AI coach — no full solution dumps.</p>
        </div>
        <Link href="/doubt-solver" className={BTN_PRIMARY}>
          Ask AI Coach
        </Link>
      </section>

      {/* Recent Learning Activity */}
      <section className={CARD_PADDED}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Learning Activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-slate-600">No activity yet. Solve a problem or complete a Micro-Proof to get started.</p>
        ) : (
          <ul className="space-y-3">
            {data.recentActivity.map((event, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span aria-hidden="true">{ACTIVITY_ICON[event.type] || "•"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800 truncate">{event.label}</p>
                  <p className="text-xs text-slate-500">
                    {event.detail} · {new Date(event.date).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className={CARD_PADDED}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
