"use client";

import { DARK_CARD_PADDED, DARK_BTN_PRIMARY } from "@/lib/theme";

// Step 2: the real Micro-Proof re-check (same question, same
// POST /api/microproofs/[id]/evaluate the first-time flow on /concepts
// uses — see RevisionWorkspace.js for the call). Once answered, the
// question stays visible as a reminder but the composer is replaced by the
// result (see RevisionResult.js).
export default function MicroProofStep({ question, answer, onAnswerChange, onSubmit, isEvaluating, error, answered }) {
  return (
    <div className={`${DARK_CARD_PADDED} ring-1 ring-inset ring-purple-400/10`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-purple-400/90">Prove Your Understanding</p>
      <p className="mt-1.5 text-sm italic leading-snug text-neutral-300">&ldquo;{question}&rdquo;</p>

      {!answered && (
        <>
          <textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Answer in a few sentences..."
            className="mt-3 h-28 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-indigo-400/40"
          />

          {error && <p className="mt-1.5 text-sm text-rose-400">{error}</p>}

          <button onClick={onSubmit} disabled={isEvaluating || !answer.trim()} className={`mt-3 ${DARK_BTN_PRIMARY}`}>
            {isEvaluating ? "Checking…" : "Check Answer →"}
          </button>
        </>
      )}
    </div>
  );
}
