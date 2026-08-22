"use client";

import { DARK_CARD_PADDED, DARK_BTN_SECONDARY } from "@/lib/theme";

function formatDays(days) {
  return `${days} day${days === 1 ? "" : "s"}`;
}

// Real result of the real POST /api/microproofs/[id]/evaluate call this
// revision session just made — score, mastery before->after (masteryDelta
// is the same real before/after the API already computes), and next-review
// interval are all genuine, nothing simulated. Branches on the real
// `understanding` field: "weak" reads as "More Practice Needed", anything
// else as "Revision Complete" — never a fabricated pass/fail.
export default function RevisionResult({ result, onStillShaky, isMarkingShaky, shakyError }) {
  const { attempt, mastery: masteryDelta, revision, explanation, stillShaky } = result;
  const isWeak = attempt.understanding === "weak";

  return (
    <div className={DARK_CARD_PADDED}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
          isWeak ? "border-amber-400/20 bg-amber-500/10 text-amber-300" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
        }`}
      >
        {isWeak ? "⚠ More Practice Needed" : "✓ Revision Complete"}
      </span>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-50">{attempt.score}</span>
        <span className="text-sm text-slate-500">/10</span>
      </div>

      {masteryDelta && (
        <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-800 pt-3 text-sm">
          <div>
            <span className="text-xs text-slate-500">Mastery</span>
            <p className="font-semibold text-slate-100">
              {masteryDelta.previousScore !== null ? `${masteryDelta.previousScore}% → ` : ""}
              <span
                className={
                  masteryDelta.previousScore === null
                    ? ""
                    : masteryDelta.masteryScore > masteryDelta.previousScore
                    ? isWeak
                      ? "text-amber-400"
                      : "text-emerald-400"
                    : masteryDelta.masteryScore < masteryDelta.previousScore
                    ? "text-rose-400"
                    : ""
                }
              >
                {masteryDelta.masteryScore}%
              </span>
            </p>
          </div>
          {revision && (
            <div>
              <span className="text-xs text-slate-500">Next review</span>
              <p className="font-semibold text-slate-100">
                {formatDays(revision.currentIntervalDays)}
                {stillShaky ? " (still shaky)" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {explanation && <p className="mt-3 border-t border-slate-800 pt-3 text-sm text-slate-400">{explanation}</p>}

      <div className="mt-3 border-t border-slate-800 pt-3">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${isWeak ? "text-amber-400/90" : "text-emerald-400/90"}`}>
          {isWeak ? "What's Still Weak" : "What Improved"}
        </p>
        <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{attempt.whatWasCorrect}</p>
      </div>

      {attempt.missingPoints?.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/90">What Is Missing</p>
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-sm text-slate-300">
            {attempt.missingPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Feedback</p>
        <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{attempt.feedback}</p>
      </div>

      {shakyError && <p className="mt-3 text-sm text-rose-400">{shakyError}</p>}

      {!stillShaky && (
        <button onClick={onStillShaky} disabled={isMarkingShaky} className={`mt-4 ${DARK_BTN_SECONDARY}`}>
          {isMarkingShaky ? "Updating…" : "Still Shaky"}
        </button>
      )}
    </div>
  );
}
