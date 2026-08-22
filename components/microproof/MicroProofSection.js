"use client";

import { useState } from "react";
import { DARK_CARD_PADDED } from "@/lib/theme";
import QuestionCard from "./QuestionCard";
import AnswerComposer from "./AnswerComposer";
import EvaluationResult from "./EvaluationResult";
import NextActions from "./NextActions";
import AttemptHistory from "./AttemptHistory";

// Orchestrates the real Micro-Proof flow: Attempt -> Explain -> Evaluate ->
// Understand weakness -> Improve. The only network call here is the
// existing, unmodified POST /api/microproofs/[id]/evaluate — this
// component only owns UI state (composer text, loading, the latest result).
export default function MicroProofSection({ microProofId, question, concept, initialAttempts }) {
  const [attempts, setAttempts] = useState(initialAttempts || []);
  const [isComposing, setIsComposing] = useState(attempts.length === 0);
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [latestResult, setLatestResult] = useState(null);

  const latestAttempt = attempts[0] || null;
  const olderAttempts = attempts.slice(1);

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      setError("Write an answer before submitting.");
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
        throw new Error(data.error || "Failed to evaluate this answer.");
      }

      setAttempts((prev) => [data.attempt, ...prev]);
      setLatestResult(data);
      setAnswer("");
      setIsComposing(false);
    } catch (err) {
      setError(err.message || "Unable to evaluate your answer right now.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    setAnswer("");
    setError(null);
    setLatestResult(null);
    setIsComposing(true);
  };

  return (
    <div className={`${DARK_CARD_PADDED} space-y-4`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Micro-Proof</p>
        {attempts.length > 0 && (
          <p className="text-xs text-slate-500">
            Attempt {isComposing ? attempts.length + 1 : attempts.length}
          </p>
        )}
      </div>

      <QuestionCard question={question} />

      {isComposing && (
        <AnswerComposer
          answer={answer}
          onAnswerChange={setAnswer}
          onSubmit={handleEvaluate}
          isEvaluating={isEvaluating}
          error={error}
        />
      )}

      {!isComposing && latestAttempt && (
        <>
          <EvaluationResult
            attempt={latestAttempt}
            mastery={latestResult?.mastery}
            revision={latestResult?.revision}
            explanation={latestResult?.explanation}
          />
          <NextActions
            onTryAgain={handleTryAgain}
            concept={concept}
            hasRevisionSchedule={Boolean(latestResult?.revision)}
          />
        </>
      )}

      <AttemptHistory attempts={isComposing ? attempts : olderAttempts} />
    </div>
  );
}
