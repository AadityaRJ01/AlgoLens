"use client";

import { useState } from "react";
import { DARK_CARD_PADDED, DARK_DIFFICULTY_STYLES, DARK_BTN_PRIMARY } from "@/lib/theme";
import MicroProofSection from "@/components/microproof/MicroProofSection";

// Real concept-extraction flow (POST /api/concepts/extract) — unmodified
// logic, restyled dark. Once a concept + Micro-Proof exist, the actual
// "prove your understanding" experience is MicroProofSection, which owns
// the real POST /api/microproofs/[id]/evaluate call.
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
      setExtractError(err.message || "Unable to extract a concept right now.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Micro-Proof</h1>
        <p className="mt-1 text-sm text-slate-400">Prove that you understand the concept—not just the solution.</p>
        {concept && (
          <p className="mt-2 text-sm text-slate-500">
            Concept: <span className="font-medium text-indigo-300">{concept.name}</span>
            <span className="mx-1.5 text-slate-700">·</span>
            Problem: <span className="font-medium text-slate-300">{submission.problem.title}</span>
          </p>
        )}
      </div>

      <div className={DARK_CARD_PADDED}>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-white">{submission.problem.title}</h2>
          <span className={`text-sm font-semibold ${DARK_DIFFICULTY_STYLES[submission.problem.difficulty] || "text-slate-400"}`}>
            {submission.problem.difficulty}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {submission.problem.topicTags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300 border border-slate-700/50">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800 pt-3 text-xs text-slate-500">
          <span className="font-medium text-emerald-400">Accepted</span>
          <span>{submission.language}</span>
          <span>{new Date(submission.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {!concept && (
        <div className={`${DARK_CARD_PADDED} space-y-3`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label htmlFor="sourceCode" className="text-sm font-medium text-slate-300">
              Your Accepted Code (optional)
            </label>
            {!hasOriginalCode && (
              <span className="text-xs text-slate-500">Not available from LeetCode — extraction works without it too.</span>
            )}
          </div>
          <textarea
            id="sourceCode"
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            spellCheck={false}
            placeholder="Optionally paste your accepted solution for a more specific concept..."
            className="h-56 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-4 font-mono text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40"
          />

          {extractError && (
            <p role="alert" className="text-sm text-rose-400">
              {extractError}
            </p>
          )}

          <button onClick={handleExtract} disabled={isExtracting} className={`w-full sm:w-auto ${DARK_BTN_PRIMARY}`}>
            {isExtracting ? "Extracting..." : "Extract Concept"}
          </button>
        </div>
      )}

      {concept && (
        <div className={`${DARK_CARD_PADDED} ring-1 ring-inset ring-purple-400/10`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-400/90">Concept</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-50">{concept.name}</h3>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Core Idea</p>
              <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{concept.coreIdea}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Invariant / Principle</p>
              <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{concept.invariant}</p>
            </div>
          </div>
          <p className="mt-3 border-t border-slate-800 pt-2 text-[11px] text-slate-600">Extracted by {concept.aiModel}</p>
        </div>
      )}

      {microProof && (
        <MicroProofSection
          microProofId={microProof.id}
          question={microProof.question}
          concept={concept?.name}
          initialAttempts={microProof.attempts}
        />
      )}
    </div>
  );
}
