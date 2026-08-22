// "Your Progress" — real per-problem/concept data (see
// getProblemsListData in lib/problemsInsights.js): mastery score for the
// matched concept, real submission attempt count, real last-attempted date.
export default function ProblemProgress({ problem }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-400/90">Your Progress</p>
      <dl className="mt-1.5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Mastery</dt>
          <dd className="font-semibold text-slate-100">{problem.masteryScore !== null ? `${problem.masteryScore}%` : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Attempts</dt>
          <dd className="font-semibold text-slate-100">{problem.attempts}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Last attempted</dt>
          <dd className="font-semibold text-slate-100">{problem.lastAttempted || "Never"}</dd>
        </div>
      </dl>
    </div>
  );
}
