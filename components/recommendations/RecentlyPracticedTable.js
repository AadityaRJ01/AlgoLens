import { DARK_CARD_PADDED, DARK_DIFFICULTY_STYLES } from "@/lib/theme";

// Real completed recommendations (Recommendation.completedAt set once the
// user solves the recommended problem — see lib/recommendations.js) paired
// with the concept's current real mastery score/trend. Not a claim that
// this specific problem caused the mastery change (that attribution isn't
// tracked) — just the honest adjacent signal: here's what you finished, and
// here's where that concept stands now.
export default function RecentlyPracticedTable({ history }) {
  if (history.length === 0) return null;

  return (
    <div className={DARK_CARD_PADDED}>
      <h2 className="text-sm font-semibold text-slate-300">Recently Practiced / Verified</h2>
      <ul className="mt-2.5 divide-y divide-white/5">
        {history.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-slate-200">
                {h.problemTitle}{" "}
                <span className={`text-xs font-semibold ${DARK_DIFFICULTY_STYLES[h.difficulty] || "text-slate-500"}`}>
                  {h.difficulty}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {h.targetConcept} · {new Date(h.completedAt).toLocaleDateString()}
              </p>
            </div>
            {h.currentMasteryScore !== null && (
              <span className="shrink-0 text-xs font-medium text-slate-400">
                <span className="text-slate-200">{h.currentMasteryScore}%</span> mastery
                {h.trend && (
                  <span className={`ml-1 ${h.trend.direction === "up" ? "text-green-400" : "text-red-400"}`}>
                    {h.trend.direction === "up" ? "↑" : "↓"} {Math.round(h.trend.deltaPoints)}%
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
