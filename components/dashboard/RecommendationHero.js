import Link from "next/link";
import { DARK_DIFFICULTY_STYLES, DARK_BTN_PRIMARY } from "@/lib/theme";
import { CheckIcon } from "@/components/icons";
import EmptyState from "@/components/ui/EmptyState";

// "Recommended for You" — section 8, the single most prominent component on
// the dashboard (see AGENTS: "the most important answer should always be
// 'here's what AlgoLens recommends you do next — and here's why'"). `rec` is
// a real Recommendation row (see lib/dashboard.js); the three "why" bullets
// are derived from its real fields (target concept, priority, mastery) —
// never fabricated copy.
export default function RecommendationHero({ rec }) {
  if (!rec) {
    return (
      <section>
        <SectionHeading />
        <div className="mt-5">
          <EmptyState
            tone="dark"
            message="Complete more problems and Micro-Proofs to unlock a personalized recommendation."
            actionHref="/recommendations"
            actionLabel="See recommendations"
          />
        </div>
      </section>
    );
  }

  const whyBullets = [
    `Targets your weakest concept: ${rec.targetConcept}`,
    `Current mastery in this concept: ${rec.masteryScore ?? "—"}%`,
    `${rec.priorityLabel} priority pick, based on your recent learning signals`,
  ];

  return (
    <section>
      <SectionHeading />

      <div className="group relative mt-3 overflow-hidden rounded-xl border border-indigo-400/25 bg-gradient-to-br from-indigo-950/60 via-slate-900/70 to-slate-900/70 p-5 shadow-lg shadow-black/30 transition-shadow duration-300 hover:shadow-indigo-950/40 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
        />

        {/* title -> difficulty/topic -> priority, all in one compact block */}
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white sm:text-xl">{rec.problem.title}</h3>
              <span className={`text-sm font-semibold ${DARK_DIFFICULTY_STYLES[rec.problem.difficulty] || "text-slate-400"}`}>
                {rec.problem.difficulty}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-400">{rec.targetConcept}</p>
          </div>
          <span className="shrink-0 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
            {rec.priorityLabel} priority
          </span>
        </div>

        {/* reason -> why this problem, condensed into one block */}
        <div className="relative mt-3.5 rounded-lg border border-white/10 bg-white/[0.03] p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Why AlgoLens picked this</p>
          <p className="mt-1 text-sm leading-snug text-slate-300">{rec.reason}</p>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Why this problem?</p>
          <ul className="mt-1.5 space-y-1">
            {whyBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-1.5 text-[13px] leading-snug text-slate-300">
                <CheckIcon width={13} height={13} className="mt-0.5 shrink-0 text-indigo-400" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {rec.problem.url && (
          <a
            href={rec.problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative mt-4 ${DARK_BTN_PRIMARY}`}
          >
            Start Problem <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </section>
  );
}

function SectionHeading() {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-50">Recommended for You</h2>
      <p className="mt-0.5 text-sm text-slate-500">Based on your recent learning signals.</p>
    </div>
  );
}
