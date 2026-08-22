import Link from "next/link";
import { DARK_DIFFICULTY_STYLES, DARK_BTN_PRIMARY, DARK_BTN_SECONDARY } from "@/lib/theme";
import { TIER_META, PURPLE_ACCENT } from "./tierMeta";

// The single top-priority recommendation — same real, persisted
// Recommendation row (with its real Groq-authored `reason`) the previous
// version of this page already showed, just presented as the hero. The
// "Estimated Mastery Gain" is a bounded heuristic, not a measured number
// (see estimateMasteryGain in lib/recommendationsInsights.js); the
// "View Linked Mistake" link is real when a matching FailureAnalysis exists.
export default function PrimaryPrescriptionCard({ hero }) {
  const meta = TIER_META[hero.tier];

  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-transparent blur-sm"
      />
      <div className="relative rounded-xl border border-purple-400/20 bg-[#151C28] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Pick</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`text-sm font-semibold ${DARK_DIFFICULTY_STYLES[hero.problem.difficulty] || "text-slate-400"}`}>
            {hero.problem.difficulty}
          </span>
          <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300 border border-slate-700/50">{hero.targetConcept}</span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}>
            {meta.emoji} Focus: {hero.targetConcept}
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-white">{hero.problem.title}</h2>

        <div className={`mt-4 rounded-lg border ${PURPLE_ACCENT.badge} p-4`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${PURPLE_ACCENT.text}`}>Why AlgoLens Chose This</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{hero.reason}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3">
            <span className="text-xs font-medium text-blue-300">
              📈 Estimated Mastery Gain: +{hero.estimatedGainPercent}% {hero.targetConcept} Confidence
            </span>
            {hero.linkedMistake && (
              <Link
                href={`/failures/${hero.linkedMistake.submissionId}`}
                className="text-xs font-medium text-purple-300 underline decoration-purple-400/40 underline-offset-2 hover:text-purple-200"
              >
                View Linked Mistake ({hero.linkedMistake.problemTitle})
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {hero.problem.url && (
            <a href={hero.problem.url} target="_blank" rel="noopener noreferrer" className={DARK_BTN_PRIMARY}>
              Start Problem →
            </a>
          )}
          <Link href="/analyze" className={DARK_BTN_SECONDARY}>
            Analyze a related failure
          </Link>
        </div>
      </div>
    </section>
  );
}
