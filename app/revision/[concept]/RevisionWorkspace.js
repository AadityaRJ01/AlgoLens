"use client";

import { useState } from "react";

const STATUS_STYLES = {
  STRONG: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DEVELOPING: "bg-amber-50 text-amber-700 border-amber-200",
  WEAK: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatDays(days) {
  return `${days} day${days === 1 ? "" : "s"}`;
}

export default function RevisionWorkspace({ concept, mastery, microProofId, question, history }) {
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [historyList, setHistoryList] = useState(history);
  const [isMarkingShaky, setIsMarkingShaky] = useState(false);
  const [shakyError, setShakyError] = useState(null);

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      setError("Write an answer before evaluating.");
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
      setError(err.message);
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
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900">{concept}</h1>
          <span
            className={`text-sm font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[mastery.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}
          >
            Mastery: {mastery.masteryScore}%
          </span>
        </div>
      </div>

      {!result && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4">
            <h2 className="text-lg font-bold tracking-tight">MICRO-PROOF</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{question}</p>

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
          </div>
        </div>
      )}

      {result && (
        <ReviewResult
          result={result}
          onStillShaky={handleStillShaky}
          isMarkingShaky={isMarkingShaky}
          shakyError={shakyError}
        />
      )}

      {historyList.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Revision History</h2>
          <ol className="space-y-1 text-sm text-slate-600">
            {historyList.map((h, i) => (
              <li key={h.id}>
                Review {i + 1} &rarr; {h.score}/10
                {h.intervalDaysAfterReview != null ? ` → ${formatDays(h.intervalDaysAfterReview)}` : ""}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function ReviewResult({ result, onStillShaky, isMarkingShaky, shakyError }) {
  const { attempt, mastery: masteryDelta, revision, explanation, stillShaky } = result;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4">
        <h2 className="text-lg font-bold tracking-tight">REVIEW RESULT</h2>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <span className="text-3xl font-bold text-slate-900">{attempt.score}</span>
          <span className="text-slate-500 text-sm">/10</span>
        </div>

        {masteryDelta && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Previous mastery</span>
              <p className="font-semibold text-slate-900">
                {masteryDelta.previousScore !== null ? `${masteryDelta.previousScore}%` : "—"}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Updated mastery</span>
              <p className="font-semibold text-slate-900">{masteryDelta.masteryScore}%</p>
            </div>
          </div>
        )}

        {revision && (
          <div>
            <span className="text-slate-500 text-sm">Next review</span>
            <p className="font-semibold text-slate-900">
              {formatDays(revision.currentIntervalDays)}
              {stillShaky ? " (still shaky)" : ""}
            </p>
          </div>
        )}

        {explanation && <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">{explanation}</p>}

        <div>
          <h3 className="text-sm font-semibold text-slate-800">What You Got Right</h3>
          <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{attempt.whatWasCorrect}</p>
        </div>

        {attempt.missingPoints?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-800">What Is Missing</h3>
            <ul className="mt-1 list-disc list-inside text-sm text-slate-600 space-y-0.5">
              {attempt.missingPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-slate-800">Feedback</h3>
          <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{attempt.feedback}</p>
        </div>

        {shakyError && (
          <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {shakyError}
          </div>
        )}

        {!stillShaky && (
          <button
            onClick={onStillShaky}
            disabled={isMarkingShaky}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isMarkingShaky ? "Updating..." : "Still Shaky"}
          </button>
        )}
      </div>
    </div>
  );
}
