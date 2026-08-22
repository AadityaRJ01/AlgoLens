import ScoreVisual from "./ScoreVisual";

function formatDays(days) {
  return `${days} day${days === 1 ? "" : "s"}`;
}

// Renders exactly what POST /api/microproofs/[id]/evaluate returns — no
// new scoring/evaluation logic. `mastery`/`revision`/`explanation` are the
// same real fields the API already returned but the previous UI silently
// dropped; showing them here is what makes the loop
// (Evaluate -> Understand weakness -> Improve) visible to the user.
export default function EvaluationResult({ attempt, mastery, revision, explanation, showAnswer = false }) {
  return (
    <div className="space-y-4">
      <ScoreVisual score={attempt.score} understanding={attempt.understanding} />

      {(mastery || revision) && (
        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3 text-sm">
          {mastery && (
            <div>
              <span className="text-xs text-slate-500">Concept Mastery</span>
              <p className="font-semibold text-slate-100">
                {mastery.previousScore !== null ? `${mastery.previousScore}% → ` : ""}
                <span className={mastery.previousScore !== null && mastery.masteryScore >= mastery.previousScore ? "text-emerald-400" : mastery.previousScore !== null ? "text-rose-400" : ""}>
                  {mastery.masteryScore}%
                </span>
              </p>
            </div>
          )}
          {revision && (
            <div>
              <span className="text-xs text-slate-500">Next review</span>
              <p className="font-semibold text-slate-100">{formatDays(revision.currentIntervalDays)}</p>
            </div>
          )}
        </div>
      )}

      {explanation && <p className="border-t border-slate-800 pt-3 text-sm text-slate-400">{explanation}</p>}

      {showAnswer && (
        <div className="border-t border-slate-800 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Your Answer</p>
          <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{attempt.answer}</p>
        </div>
      )}

      <div className="border-t border-slate-800 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/90">What You Got Right</p>
        <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{attempt.whatWasCorrect}</p>
      </div>

      {attempt.missingPoints?.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/90">What&apos;s Missing</p>
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-sm text-slate-300">
            {attempt.missingPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-400/90">How To Improve</p>
        <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{attempt.feedback}</p>
      </div>
    </div>
  );
}
