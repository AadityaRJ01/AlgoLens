"use client";

import { useState } from "react";
import { DIFFICULTY_STYLES } from "@/lib/theme";

const UNDERSTANDING_STYLES = {
  strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  weak: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function ConceptWorkspace({ submission, initialConcept, initialMicroProof }) {
  const [sourceCode, setSourceCode] = useState(submission.sourceCode || "");
  const [concept, setConcept] = useState(initialConcept);
  const [microProof, setMicroProof] = useState(initialMicroProof);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);

  const hasOriginalCode = Boolean(submission.sourceCode);

  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch("/api/concepts/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id, sourceCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract a concept for this problem.");
      }

      setConcept(data.concept);
      setMicroProof(data.microProof);
    } catch (err) {
      setExtractError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900">{submission.problem.title}</h1>
          <span className={`text-sm font-semibold ${DIFFICULTY_STYLES[submission.problem.difficulty] || "text-slate-500"}`}>
            {submission.problem.difficulty}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {submission.problem.topicTags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {tag}
            </span>
          ))}
        </div>
        <div className="text-sm text-slate-500 mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-semibold text-emerald-600">Accepted</span>
          <span>{submission.language}</span>
          <span>{new Date(submission.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {!concept && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="sourceCode" className="block text-sm font-medium text-slate-700">
              Your Accepted Code (optional)
            </label>
            {!hasOriginalCode && (
              <span className="text-xs text-slate-500">
                Not available from LeetCode &mdash; extraction works without it too.
              </span>
            )}
          </div>
          <textarea
            id="sourceCode"
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            spellCheck={false}
            placeholder="Optionally paste your accepted solution for a more specific concept..."
            className="w-full h-56 font-mono text-sm p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
          />

          {extractError && (
            <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
              {extractError}
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExtracting ? "Extracting..." : "Extract Concept"}
          </button>
        </div>
      )}

      {concept && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4">
            <h2 className="text-lg font-bold tracking-tight">CONCEPT</h2>
          </div>
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">{concept.name}</h3>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Core Idea</h4>
              <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{concept.coreIdea}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Invariant / Principle</h4>
              <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{concept.invariant}</p>
            </div>
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              Extracted by {concept.aiModel}
            </p>
          </div>
        </div>
      )}

      {microProof && <MicroProofCard microProof={microProof} />}
    </div>
  );
}

function MicroProofCard({ microProof }) {
  // Attempt history from the server, most recent first. The answer field is
  // never pre-filled from a past attempt — a fresh visit always starts blank,
  // and only the explicit "Try Again" action reopens the composer.
  const [attempts, setAttempts] = useState(microProof.attempts || []);
  const [isComposing, setIsComposing] = useState(attempts.length === 0);
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const latestAttempt = attempts[0] || null;
  const olderAttempts = attempts.slice(1);

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      setError("Write an answer before evaluating.");
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
        throw new Error(data.error || "Failed to evaluate this answer.");
      }

      setAttempts((prev) => [data.attempt, ...prev]);
      setAnswer("");
      setIsComposing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    setAnswer("");
    setError(null);
    setIsComposing(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4">
        <h2 className="text-lg font-bold tracking-tight">MICRO-PROOF</h2>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{microProof.question}</p>

        {isComposing && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer in a few sentences..."
              className="w-full h-32 text-sm p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
            />

            {error && (
              <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !answer.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isEvaluating ? "Evaluating..." : "Evaluate Answer"}
            </button>
          </>
        )}

        {!isComposing && latestAttempt && (
          <>
            <EvaluationResult attempt={latestAttempt} />
            <button
              onClick={handleTryAgain}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Try Again
            </button>
          </>
        )}

        {olderAttempts.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">
              Previous Attempts ({olderAttempts.length})
            </h4>
            {olderAttempts.map((attempt, i) => (
              <details key={attempt.id} className="border border-slate-200 rounded-lg px-4 py-2">
                <summary className="cursor-pointer text-sm text-slate-700 flex items-center justify-between gap-3">
                  <span>Attempt {olderAttempts.length - i}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{attempt.score}/10</span>
                    <span
                      className={`px-2 py-0.5 rounded-full border capitalize ${UNDERSTANDING_STYLES[attempt.understanding] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                    >
                      {attempt.understanding}
                    </span>
                    <span>{new Date(attempt.createdAt).toLocaleString()}</span>
                  </span>
                </summary>
                <div className="mt-3">
                  <EvaluationResult attempt={attempt} showAnswer />
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EvaluationResult({ attempt, showAnswer = false }) {
  return (
    <div className="space-y-4 pt-2 border-t border-slate-100">
      <div className="flex items-center gap-3">
        <div>
          <span className="text-3xl font-bold text-slate-900">{attempt.score}</span>
          <span className="text-slate-500 text-sm">/10</span>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${UNDERSTANDING_STYLES[attempt.understanding] || "bg-slate-50 text-slate-600 border-slate-200"}`}
        >
          {attempt.understanding} understanding
        </span>
      </div>

      {showAnswer && (
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Your Answer</h4>
          <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{attempt.answer}</p>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-slate-800">What You Got Right</h4>
        <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{attempt.whatWasCorrect}</p>
      </div>

      {attempt.missingPoints?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-800">What Is Missing</h4>
          <ul className="mt-1 list-disc list-inside text-sm text-slate-600 space-y-0.5">
            {attempt.missingPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-slate-800">Feedback</h4>
        <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{attempt.feedback}</p>
      </div>
    </div>
  );
}
