import { DARK_DIFFICULTY_STYLES, DARK_BTN_PRIMARY } from "@/lib/theme";

// Real Recommendation row (Phase 8, lib/recommendations.js) — prefers one
// targeting the same concept as this analysis, falling back to the user's
// top-priority pending recommendation. Never a random/fabricated problem;
// `reason` is always the real, AI-authored explanation already stored for
// that recommendation, so it always explains *why* it was picked.
export default function RecommendationCard({ recommendation }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90">Recommended Next</p>
      {recommendation ? (
        <>
          <p className="mt-1.5 text-sm font-semibold text-white">{recommendation.title}</p>
          <p className="text-xs text-slate-500">
            <span className={`font-medium ${DARK_DIFFICULTY_STYLES[recommendation.difficulty] || "text-slate-400"}`}>
              {recommendation.difficulty}
            </span>{" "}
            · {recommendation.targetConcept}
          </p>
          <p className="mt-1.5 text-xs italic leading-relaxed text-slate-400">&ldquo;{recommendation.reason}&rdquo;</p>
          {recommendation.url && (
            <a href={recommendation.url} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-block ${DARK_BTN_PRIMARY}`}>
              Practice This →
            </a>
          )}
        </>
      ) : (
        <p className="mt-1.5 text-sm text-slate-500">No pending recommendation right now.</p>
      )}
    </div>
  );
}
