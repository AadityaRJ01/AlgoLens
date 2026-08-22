"use client";

import { useState } from "react";
import { DARK_CARD_PADDED } from "@/lib/theme";
import ConceptReview from "@/components/revision/ConceptReview";
import MicroProofStep from "@/components/revision/MicroProofStep";
import RevisionResult from "@/components/revision/RevisionResult";
import RevisionProblem from "@/components/revision/RevisionProblem";

// The guided revision session: Concept -> Quick Explanation -> Micro-Proof
// -> Result -> "Now Apply It" practice problem. Every step after the first
// is real, working functionality already used elsewhere in the app (the
// same POST /api/microproofs/[id]/evaluate and
// POST /api/revision/[concept]/still-shaky the original /concepts and
// /revision flows use) — this component only restyles it dark and adds the
// concept refresher + practice-problem steps around it.
export default function RevisionWorkspace({ concept, mastery, coreIdea, microProofId, question, history, recommendation }) {
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [historyList, setHistoryList] = useState(history);
  const [isMarkingShaky, setIsMarkingShaky] = useState(false);
  const [shakyError, setShakyError] = useState(null);

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      setError("Write an answer before checking.");
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      const res = await fetch(`/api/microproofs/${microProofId}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check this answer.");
      }

      setResult(data);
      setHistoryList((prev) => [
        ...prev,
        {
          id: data.attempt.id,
          score: data.attempt.score,
          intervalDaysAfterReview: data.attempt.intervalDaysAfterReview,
          createdAt: data.attempt.createdAt,
        },
      ]);
    } catch (err) {
      setError(err.message || "Unable to check your answer right now.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStillShaky = async () => {
    setIsMarkingShaky(true);
    setShakyError(null);

    try {
      const res = await fetch(`/api/revision/${encodeURIComponent(concept)}/still-shaky`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update the revision schedule.");
      }

      setResult((prev) => (prev ? { ...prev, revision: data.revision, stillShaky: true } : prev));
    } catch (err) {
      setShakyError(err.message);
    } finally {
      setIsMarkingShaky(false);
    }
  };

  return (
    <div className="space-y-4">
      <ConceptReview concept={concept} masteryScore={mastery.masteryScore} status={mastery.status} coreIdea={coreIdea} />

      <MicroProofStep
        question={question}
        answer={answer}
        onAnswerChange={setAnswer}
        onSubmit={handleEvaluate}
        isEvaluating={isEvaluating}
        error={error}
        answered={Boolean(result)}
      />

      {result && (
        <>
          <RevisionResult result={result} onStillShaky={handleStillShaky} isMarkingShaky={isMarkingShaky} shakyError={shakyError} />
          {recommendation && <RevisionProblem recommendation={recommendation} />}
        </>
      )}

      {historyList.length > 0 && (
        <div className={DARK_CARD_PADDED}>
          <h2 className="text-sm font-semibold text-neutral-300">Revision History</h2>
          <ol className="mt-2 space-y-1 text-sm text-neutral-400">
            {historyList.map((h, i) => (
              <li key={h.id}>
                Review {i + 1} → <span className="text-neutral-200">{h.score}/10</span>
                {h.intervalDaysAfterReview != null ? (
                  <span className="text-neutral-500"> → next in {h.intervalDaysAfterReview} day{h.intervalDaysAfterReview === 1 ? "" : "s"}</span>
                ) : (
                  ""
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
