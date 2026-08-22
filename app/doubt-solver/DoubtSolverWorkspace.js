"use client";

import { useState } from "react";
import DoubtSolverHeader from "@/components/doubt-solver/DoubtSolverHeader";
import ProblemPanel from "@/components/doubt-solver/ProblemPanel";
import MentorPanel from "@/components/doubt-solver/MentorPanel";
import LearningPanel from "@/components/doubt-solver/LearningPanel";

// All state and API calls below are unchanged from the pre-redesign
// version of this component — only the JSX layout (which components render
// where) changed, to the 3-pane dock: ProblemPanel (left) / MentorPanel
// (center) / LearningPanel (right). Every request still goes to the same
// existing routes: /api/catalog/search, /api/catalog/[slug],
// /api/doubt-solver/hint, /api/doubt-solver/solution.

const LANGUAGES = ["Java", "Python", "C++", "C", "C#", "JavaScript", "TypeScript", "Go", "Kotlin", "Other"];

const EMPTY_FORM = {
  problemTitle: "",
  problemDescription: "",
  constraints: "",
  language: "",
  currentCode: "",
  doubt: "",
};

export default function DoubtSolverWorkspace() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedProblem, setSelectedProblem] = useState(null); // { slug, topicTags, url }

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);

  const [hints, setHints] = useState([]); // [{ level, text }]
  const [masteryContext, setMasteryContext] = useState(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [error, setError] = useState(null);

  const [fullSolution, setFullSolution] = useState(null);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [solutionError, setSolutionError] = useState(null);

  const sessionStarted = hints.length > 0;
  const currentLevel = hints.length; // 0 before first hint, up to 4

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetSession() {
    setForm(EMPTY_FORM);
    setSelectedProblem(null);
    setQuery("");
    setSearchResults([]);
    setHints([]);
    setMasteryContext(null);
    setError(null);
    setFullSolution(null);
    setIsGeneratingSolution(false);
    setSolutionError(null);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      setSearchResults(data.problems || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSelectProblem(problem) {
    setIsLoadingProblem(true);
    setError(null);
    try {
      const res = await fetch(`/api/catalog/${problem.slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load this problem.");

      setForm((prev) => ({
        ...prev,
        problemTitle: data.title,
        problemDescription: data.description || "",
      }));
      setSelectedProblem({ slug: data.slug, topicTags: data.topicTags || [], url: data.url, difficulty: data.difficulty });
      setSearchResults([]);
      setQuery("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingProblem(false);
    }
  }

  // Best-effort: if the user typed a problem title directly instead of
  // using catalog search+select, `selectedProblem` was never populated —
  // that's the root cause of the Session panel showing no Difficulty/Topic/
  // Target Concept even mid-session. Reuses the existing
  // /api/catalog/search endpoint (no new backend) to resolve real metadata
  // for that title before the first hint request, so it can be attached to
  // `selectedProblem` and then persists for the rest of the session exactly
  // like an explicit catalog selection would. Silently no-ops (leaves
  // selectedProblem null) if nothing matches — never fabricates metadata
  // for a title that isn't a real catalog problem.
  async function resolveProblemMetadata(title) {
    try {
      const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(title.trim())}`);
      if (!res.ok) return null;
      const data = await res.json();
      const candidates = data.problems || [];
      const match =
        candidates.find((p) => p.title.toLowerCase() === title.trim().toLowerCase()) || candidates[0] || null;
      if (!match) return null;
      return { slug: match.slug, topicTags: match.topicTags || [], url: null, difficulty: match.difficulty };
    } catch {
      return null;
    }
  }

  async function requestHint(level) {
    setIsLoadingHint(true);
    setError(null);

    let activeProblem = selectedProblem;
    if (level === 1 && !activeProblem && form.problemTitle.trim()) {
      activeProblem = await resolveProblemMetadata(form.problemTitle);
      if (activeProblem) setSelectedProblem(activeProblem);
    }

    try {
      const res = await fetch("/api/doubt-solver/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle: form.problemTitle,
          problemDescription: form.problemDescription,
          constraints: form.constraints,
          language: form.language,
          currentCode: form.currentCode,
          doubt: form.doubt,
          hintLevel: level,
          previousHints: hints.map((h) => h.text),
          topicTags: activeProblem?.topicTags || [],
          problemSlug: activeProblem?.slug || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI coaching is temporarily unavailable. Please try again.");
      }
      setHints((prev) => [...prev, { level, text: data.hint }]);
      if (data.masteryContext) setMasteryContext(data.masteryContext);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingHint(false);
    }
  }

  async function requestFullSolution() {
    setIsGeneratingSolution(true);
    setSolutionError(null);
    try {
      const res = await fetch("/api/doubt-solver/solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle: form.problemTitle,
          problemDescription: form.problemDescription,
          constraints: form.constraints,
          language: form.language,
          currentCode: form.currentCode,
          doubt: form.doubt,
          previousHints: hints.map((h) => h.text),
          topicTags: selectedProblem?.topicTags || [],
          problemSlug: selectedProblem?.slug || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to generate the solution right now. Please try again.");
      }
      setFullSolution(data.solution);
    } catch (err) {
      setSolutionError(err.message);
    } finally {
      setIsGeneratingSolution(false);
    }
  }

  const canGetFirstHint = Boolean(form.problemTitle.trim() && form.doubt.trim() && !isLoadingHint);
  const hasHint3 = currentLevel >= 3;

  return (
    <div className="space-y-4">
      <DoubtSolverHeader problemTitle={form.problemTitle || null} isActive={isLoadingHint || isGeneratingSolution} />

      {(sessionStarted || form.problemTitle || form.doubt) && (
        <div className="flex justify-end">
          <button type="button" onClick={resetSession} className="text-xs font-medium text-slate-500 hover:text-slate-300">
            New Problem
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[30fr_45fr_25fr] lg:items-start">
        <ProblemPanel
          form={form}
          updateField={updateField}
          sessionStarted={sessionStarted}
          selectedProblem={selectedProblem}
          query={query}
          setQuery={setQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          isLoadingProblem={isLoadingProblem}
          onSearch={handleSearch}
          onSelectProblem={handleSelectProblem}
          languages={LANGUAGES}
        />

        <MentorPanel
          sessionStarted={sessionStarted}
          currentLevel={currentLevel}
          hints={hints}
          error={error}
          isLoadingHint={isLoadingHint}
          doubt={form.doubt}
          onDoubtChange={(value) => updateField("doubt", value)}
          canGetFirstHint={canGetFirstHint}
          onGetFirstHint={() => requestHint(1)}
          onNextHint={() => requestHint(currentLevel + 1)}
          hasHint3={hasHint3}
          fullSolution={fullSolution}
          isGeneratingSolution={isGeneratingSolution}
          solutionError={solutionError}
          onGenerateSolution={requestFullSolution}
          onReset={resetSession}
          language={form.language}
        />

        <LearningPanel selectedProblem={selectedProblem} masteryContext={masteryContext} currentLevel={currentLevel} />
      </div>
    </div>
  );
}
