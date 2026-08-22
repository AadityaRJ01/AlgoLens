"use client";

import { useState } from "react";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { labelForLanguage, normalizeLanguageId, starterTemplateFor } from "./languages";
import ProblemPanel from "./ProblemPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import AnalysisPanel from "./AnalysisPanel";

// Top-level client state for the Analyze workspace. Mirrors the existing,
// working pattern in app/failures/[id]/FailureAnalyzer.js (edit code -> POST
// /api/failures/analyze -> render result) rather than inventing a new
// analysis flow. Additions: a Monaco language selector whose value is sent
// along with the analyze request (see the `language` override in
// app/api/failures/analyze/route.js), and a post-analysis mastery refresh
// via the existing GET /api/mastery, so "Concept Mastery 41% -> 34%" is a
// real before/after delta, not a guess.
export default function AnalyzeWorkspace({
  submission,
  problemDescription,
  canAnalyze,
  isAccepted,
  initialAnalysis,
  mastery: initialMastery,
  microProof,
  recommendation,
  successConcept,
  recentSubmissions,
}) {
  const [language, setLanguage] = useState(normalizeLanguageId(submission.language));
  const [sourceCode, setSourceCode] = useState(submission.sourceCode);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [mastery, setMastery] = useState(initialMastery);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    // Only fill in a starter template when the editor is genuinely empty —
    // never overwrite code the user already has in it.
    if (!sourceCode.trim()) {
      setSourceCode(starterTemplateFor(nextLanguage));
    }
  };

  const handleAnalyze = async () => {
    if (!sourceCode.trim()) {
      setError("Paste or edit your submitted code before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/failures/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id, sourceCode, language: labelForLanguage(language) }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze this submission.");
      }

      setAnalysis(data.analysis);

      // Best-effort real mastery refresh — /api/failures/analyze already
      // triggered recalculateConceptMastery server-side, so the updated
      // score is immediately readable. A failure here just means the
      // mastery card falls back to its pre-analysis value.
      try {
        const conceptKey = normalizeConceptName(data.analysis.concept) || data.analysis.concept;
        const masteryRes = await fetch("/api/mastery");
        const masteryData = await masteryRes.json();
        const updated = masteryData.mastery?.find((m) => m.concept === conceptKey);
        if (updated) {
          setMastery((prev) => ({
            concept: conceptKey,
            score: updated.masteryScore,
            trend:
              prev?.concept === conceptKey && prev.score !== null
                ? { direction: updated.masteryScore >= prev.score ? "up" : "down", deltaPoints: Math.abs(updated.masteryScore - prev.score) }
                : null,
          }));
        }
      } catch {
        // non-fatal
      }
    } catch (err) {
      setError(err.message || "Unable to analyze your solution right now.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real Micro-Proof evaluation (POST /api/microproofs/[id]/evaluate) also
  // refreshes the mastery card with the score that call just recalculated,
  // same as an analyze run — proving understanding is a mastery signal too.
  const handleMicroProofEvaluated = (attempt, updatedMastery) => {
    if (updatedMastery && mastery) {
      setMastery((prev) => ({
        ...prev,
        score: updatedMastery.masteryScore,
        trend:
          updatedMastery.previousScore !== null
            ? {
                direction: updatedMastery.masteryScore >= updatedMastery.previousScore ? "up" : "down",
                deltaPoints: Math.abs(updatedMastery.masteryScore - updatedMastery.previousScore),
              }
            : prev.trend,
      }));
    }
  };

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[27fr_38fr_35fr] lg:items-start">
      <ProblemPanel submission={submission} description={problemDescription} recentSubmissions={recentSubmissions} />

      <CodeEditorPanel
        language={language}
        onLanguageChange={handleLanguageChange}
        sourceCode={sourceCode}
        onChange={setSourceCode}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        canAnalyze={canAnalyze}
        isAccepted={isAccepted}
      />

      <AnalysisPanel
        canAnalyze={canAnalyze}
        isAccepted={isAccepted}
        isAnalyzing={isAnalyzing}
        error={error}
        onRetry={handleAnalyze}
        analysis={analysis}
        mastery={mastery}
        microProof={microProof}
        onMicroProofEvaluated={handleMicroProofEvaluated}
        recommendation={recommendation}
        successConcept={successConcept}
      />
    </div>
  );
}
