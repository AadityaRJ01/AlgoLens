"use client";

import { useState } from "react";

const DIFFICULTY_STYLES = {
  Easy: "text-emerald-600",
  Medium: "text-amber-500",
  Hard: "text-rose-500",
};

export default function FailureAnalyzer({ submission, initialAnalysis }) {
  const [sourceCode, setSourceCode] = useState(submission.sourceCode || "");
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const hasOriginalCode = Boolean(submission.sourceCode);

  const handleAnalyze = async () => {
    if (!sourceCode.trim()) {
      setError("Paste or edit your submission's code before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/failures/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id, sourceCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze this submission.");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
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
          <span className="font-semibold text-rose-600">{submission.verdict}</span>
          <span>{submission.language}</span>
          <span>{new Date(submission.timestamp).toLocaleString()}</span>
          {submission.runtime && <span>Runtime: {submission.runtime}</span>}
          {submission.memory && <span>Memory: {submission.memory}</span>}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="sourceCode" className="block text-sm font-medium text-slate-700">
            Your Submitted Code
          </label>
          {!hasOriginalCode && (
            <span className="text-xs text-slate-500">
              Source code wasn&apos;t available from LeetCode &mdash; paste it below.
            </span>
          )}
        </div>
        <textarea
          id="sourceCode"
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          spellCheck={false}
          placeholder="Paste your submitted code here..."
          className="w-full h-72 font-mono text-sm p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
        />

        {error && (
          <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !sourceCode.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze My Failure"}
        </button>
      </div>

      {analysis && <AutopsyCard submission={submission} analysis={analysis} />}
    </div>
  );
}

function AutopsyCard({ submission, analysis }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4">
        <h2 className="text-lg font-bold tracking-tight">WHY DID I FAIL?</h2>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="font-semibold text-slate-500">Problem: </span>
            <span className="text-slate-900">{submission.problem.title}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Verdict: </span>
            <span className="text-slate-900">{submission.verdict}</span>
          </div>
        </div>

        <Section label="Root Cause" text={analysis.rootCause} />
        <Section label="Failure Category" text={analysis.failureCategory} />
        <Section label="Concept" text={analysis.concept} />
        <Section label="Evidence From Your Code" text={analysis.evidence} mono />
        <Section label="Prevention Rule" text={analysis.preventionRule} />
        <Section label="Suggested Follow-up" text={analysis.suggestedFollowUp} />

        {analysis.failingTestCase && <FailingTestCase testCase={analysis.failingTestCase} />}

        <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
          Diagnosed by {analysis.aiModel}
        </p>
      </div>
    </div>
  );
}

function FailingTestCase({ testCase }) {
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-bold text-amber-900 tracking-tight">FAILURE EXAMPLE</h3>

      <div>
        <h4 className="text-xs font-semibold text-slate-700">Input</h4>
        <p className="mt-1 text-sm text-slate-800 font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-amber-100">
          {testCase.input}
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-700">Expected</h4>
        <p className="mt-1 text-sm text-slate-800 font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-amber-100">
          {testCase.expectedOutput}
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-700">Your Output</h4>
        <p className="mt-1 text-sm text-slate-800 font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-amber-100">
          {testCase.actualOutput}
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-700">Why it fails</h4>
        <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{testCase.explanation}</p>
      </div>
    </div>
  );
}

function Section({ label, text, mono = false }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
      <p className={`mt-1 text-sm text-slate-600 whitespace-pre-wrap ${mono ? "font-mono bg-slate-50 p-3 rounded-lg border border-slate-100" : ""}`}>
        {text}
      </p>
    </div>
  );
}
