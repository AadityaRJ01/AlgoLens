import Link from "next/link";
import { DARK_BTN_PRIMARY, DARK_BTN_SECONDARY } from "@/lib/theme";
import RecommendationCard from "@/components/analyze/RecommendationCard";

// "What To Do Next" — weakest sub-area comes from the mock breakdown (see
// MasteryBreakdown.js); the recommended problem is real (see
// getConceptDetail in lib/masteryInsights.js, reusing the same
// RecommendationCard the Analyze page uses). "Start Revision" only links to
// /revision/[concept] when a real RevisionSchedule row exists for this
// concept — that route 404s otherwise (it requires an existing schedule),
// so we route to building one first instead of a dead link.
export default function RecommendedImprovement({ concept, weakestSubconcept, recommendation, hasRevisionSchedule }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400/90">Recommended Improvement</p>

      {weakestSubconcept && (
        <div className="mt-1.5">
          <p className="text-sm text-slate-400">Your weakest area is:</p>
          <p className="text-base font-semibold text-slate-100">{weakestSubconcept.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            Recommended action: <span className="text-slate-200">Practice a couple of problems focused on {weakestSubconcept.name.toLowerCase()}.</span>
          </p>
        </div>
      )}

      {recommendation && (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3.5">
          <RecommendationCard recommendation={recommendation} />
        </div>
      )}

      <div className="mt-3">
        {hasRevisionSchedule ? (
          <Link href={`/revision/${encodeURIComponent(concept)}`} className={DARK_BTN_PRIMARY}>
            Start Revision →
          </Link>
        ) : (
          <Link href="/concepts" className={DARK_BTN_SECONDARY}>
            Answer a Micro-Proof to unlock revision
          </Link>
        )}
      </div>
    </div>
  );
}
