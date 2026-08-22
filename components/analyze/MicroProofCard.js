"use client";

import { useState } from "react";
import Link from "next/link";
import { DARK_BTN_PRIMARY, DARK_BTN_SECONDARY } from "@/lib/theme";

const UNDERSTANDING_TONE = {
  strong: "text-emerald-300",
  partial: "text-amber-300",
  weak: "text-rose-300",
};

// Real Micro-Proof question + real evaluation (Phase 5,
// POST /api/microproofs/[id]/evaluate — the same endpoint
// ConceptWorkspace.js already uses), inline in the Analyze workspace so
// proving understanding is a natural continuation of the analysis rather
// than a hop to another page. Concept extraction is accepted-submission-
// scoped (see /concepts), so a failing submission for a problem the user
// hasn't solved yet legitimately has no Micro-Proof — shown as an honest
// empty state, not a fabricated question.
export default function MicroProofCard({ microProof, onEvaluated }) {
  const [attempts, setAttempts] = useState(microProof?.attempts || []);
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const latestAttempt = attempts[0] || null;
  const [isComposing, setIsComposing] = useState((microProof?.attempts || []).length === 0);

  if (!microProof) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-400/90">Micro-Proof</p>
        <p className="mt-1.5 text-sm text-neutral-500">No Micro-Proof for this concept yet.</p>
        <Link href="/concepts" className={`mt-2 inline-block ${DARK_BTN_SECONDARY}`}>
          Extract one from a solved problem
        </Link>
      </div>
    );
  }

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      setError("Write an answer before checking.");
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      const res = await fetch(`/api/microproofs/${microProof.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check this answer.");
      }

      setAttempts((prev) => [data.attempt, ...prev]);
      setAnswer("");
      setIsComposing(false);
      onEvaluated?.(data.attempt, data.mastery);
    } catch (err) {
      setError(err.message || "Unable to check your answer right now.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-purple-400/90">Prove Your Understanding</p>
      <p className="mt-1.5 text-sm italic leading-snug text-neutral-300">&ldquo;{microProof.question}&rdquo;</p>

      {isComposing ? (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer in a few sentences..."
            className="mt-2 h-20 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-indigo-400/40"
          />
          {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
          <button onClick={handleEvaluate} disabled={isEvaluating || !answer.trim()} className={`mt-2 w-full ${DARK_BTN_PRIMARY}`}>
            {isEvaluating ? "Checking…" : "Check Answer →"}
          </button>
        </>
      ) : (
        latestAttempt && (
          <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-neutral-100">{latestAttempt.score}</span>
              <span className="text-xs text-neutral-500">/10</span>
              <span className={`text-xs font-semibold capitalize ${UNDERSTANDING_TONE[latestAttempt.understanding] || "text-neutral-400"}`}>
                {latestAttempt.understanding} understanding
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{latestAttempt.feedback}</p>
            <button onClick={() => setIsComposing(true)} className={`mt-2 ${DARK_BTN_SECONDARY}`}>
              Try Again
            </button>
          </div>
        )
      )}
    </div>
  );
}
