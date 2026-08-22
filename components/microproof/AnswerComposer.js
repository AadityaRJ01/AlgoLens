"use client";

import { DARK_BTN_PRIMARY } from "@/lib/theme";

// Conceptual explanation, never code — reuses the existing real
// POST /api/microproofs/[id]/evaluate call (owned by the parent
// ConceptWorkspace). This component only renders the composer UI.
export default function AnswerComposer({ answer, onAnswerChange, onSubmit, isEvaluating, error }) {
  return (
    <div>
      <label htmlFor="microproof-answer" className="sr-only">
        Your explanation
      </label>
      <textarea
        id="microproof-answer"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Explain your reasoning in your own words..."
        rows={6}
        className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-400">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isEvaluating || !answer.trim()}
        className={`mt-3 w-full sm:w-auto ${DARK_BTN_PRIMARY}`}
      >
        {isEvaluating ? "Evaluating your reasoning..." : "Submit Answer →"}
      </button>
    </div>
  );
}
