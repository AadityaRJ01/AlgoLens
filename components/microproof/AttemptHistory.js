import EvaluationResult from "./EvaluationResult";

const UNDERSTANDING_TONE = {
  strong: "text-emerald-300",
  partial: "text-amber-300",
  weak: "text-rose-300",
};

// Real attempt history for this Micro-Proof (Phase 5,
// MicroProofAttempt rows) — collapsed by default, oldest detail hidden
// behind a disclosure per attempt so the page doesn't dump a wall of past
// AI feedback.
export default function AttemptHistory({ attempts }) {
  if (attempts.length === 0) return null;

  return (
    <div className="border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Previous Attempts ({attempts.length})
      </p>
      <div className="mt-2 space-y-1.5">
        {attempts.map((attempt, i) => (
          <details key={attempt.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-300">
              <span>Attempt {attempts.length - i}</span>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-200">{attempt.score}/10</span>
                <span className={`capitalize ${UNDERSTANDING_TONE[attempt.understanding] || "text-slate-400"}`}>
                  {attempt.understanding}
                </span>
                <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
              </span>
            </summary>
            <div className="mt-3">
              <EvaluationResult attempt={attempt} showAnswer />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
