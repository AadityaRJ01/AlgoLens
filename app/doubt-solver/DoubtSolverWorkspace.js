"use client";

import { useState } from "react";
import { DIFFICULTY_STYLES } from "@/lib/theme";

const LANGUAGES = [
  "Java",
  "Python",
  "C++",
  "C",
  "C#",
  "JavaScript",
  "TypeScript",
  "Go",
  "Kotlin",
  "Other",
];

const HINT_META = {
  1: { label: "HINT 1 — CONCEPT", nextLabel: "Get Hint 2", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  2: { label: "HINT 2 — APPROACH", nextLabel: "Get Hint 3", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  3: { label: "HINT 3 — IMPLEMENTATION", nextLabel: "Show Full Explanation", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  4: { label: "FULL EXPLANATION", nextLabel: null, badge: "bg-slate-100 text-slate-700 border-slate-300" },
};

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

  async function requestHint(level) {
    setIsLoadingHint(true);
    setError(null);
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
          topicTags: selectedProblem?.topicTags || [],
          problemSlug: selectedProblem?.slug || null,
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

  const canGetFirstHint = form.problemTitle.trim() && form.doubt.trim() && !isLoadingHint;
  const hasHint3 = currentLevel >= 3;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-slate-900">Problem</h2>
          {(sessionStarted || form.problemTitle || form.doubt) && (
            <button
              onClick={resetSession}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              New Problem
            </button>
          )}
        </div>

        {!sessionStarted && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Optional: search the LeetCode catalog to auto-fill the problem
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Two Sum"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
            {searchResults.length > 0 && (
              <ul className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                {searchResults.map((p) => (
                  <li key={p.slug}>
                    <button
                      onClick={() => handleSelectProblem(p)}
                      disabled={isLoadingProblem}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
                    >
                      <span className="text-sm text-slate-800">{p.title}</span>
                      <span className={`text-xs font-semibold ${DIFFICULTY_STYLES[p.difficulty] || "text-slate-500"}`}>
                        {p.difficulty}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {isLoadingProblem && <p className="text-xs text-slate-500">Loading problem details...</p>}
          </div>
        )}

        {selectedProblem && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">From catalog</span>
            {selectedProblem.difficulty && (
              <span className={`font-semibold ${DIFFICULTY_STYLES[selectedProblem.difficulty] || "text-slate-500"}`}>
                {selectedProblem.difficulty}
              </span>
            )}
            {selectedProblem.topicTags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div>
          <label htmlFor="problemTitle" className="block text-sm font-medium text-slate-700 mb-1">
            Problem Title
          </label>
          <input
            id="problemTitle"
            type="text"
            value={form.problemTitle}
            onChange={(e) => updateField("problemTitle", e.target.value)}
            disabled={sessionStarted}
            placeholder="e.g. Two Sum"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div>
          <label htmlFor="problemDescription" className="block text-sm font-medium text-slate-700 mb-1">
            Problem Description (optional)
          </label>
          <textarea
            id="problemDescription"
            value={form.problemDescription}
            onChange={(e) => updateField("problemDescription", e.target.value)}
            disabled={sessionStarted}
            rows={4}
            placeholder="Paste the problem statement..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-y disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div>
          <label htmlFor="constraints" className="block text-sm font-medium text-slate-700 mb-1">
            Constraints (optional)
          </label>
          <textarea
            id="constraints"
            value={form.constraints}
            onChange={(e) => updateField("constraints", e.target.value)}
            disabled={sessionStarted}
            rows={2}
            placeholder="e.g. 1 <= n <= 10^5"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-y disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-slate-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={form.language}
            onChange={(e) => updateField("language", e.target.value)}
            disabled={sessionStarted}
            className="w-full sm:w-56 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">Select language</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="currentCode" className="block text-sm font-medium text-slate-700 mb-1">
            Current Code (optional)
          </label>
          <textarea
            id="currentCode"
            value={form.currentCode}
            onChange={(e) => updateField("currentCode", e.target.value)}
            disabled={sessionStarted}
            spellCheck={false}
            rows={10}
            placeholder="Paste your current attempt..."
            className="w-full font-mono text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div>
          <label htmlFor="doubt" className="block text-sm font-medium text-slate-700 mb-1">
            What&apos;s your doubt?
          </label>
          <textarea
            id="doubt"
            value={form.doubt}
            onChange={(e) => updateField("doubt", e.target.value)}
            disabled={sessionStarted}
            rows={3}
            placeholder="e.g. I don't understand why my current approach is failing."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-y disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {!sessionStarted && (
          <button
            onClick={() => requestHint(1)}
            disabled={!canGetFirstHint}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingHint ? "Thinking..." : "Get Hint"}
          </button>
        )}
      </div>

      {hints.length > 0 && (
        <div className="space-y-4">
          {masteryContext && (
            <div className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <span className="font-semibold text-slate-800">{masteryContext.concept}</span>
              <span className="mx-2 text-slate-300">|</span>
              Mastery: <span className="font-medium text-slate-800">{masteryContext.masteryScore}%</span>
              <span className="mx-2 text-slate-300">|</span>
              Related failures: <span className="font-medium text-slate-800">{masteryContext.failureCount}</span>
            </div>
          )}

          {hints.map(({ level, text }) => (
            <div key={level} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${HINT_META[level].badge}`}>
                {HINT_META[level].label}
              </span>
              <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{text}</p>
            </div>
          ))}

          {error && currentLevel > 0 && (
            <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          {hasHint3 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-3">
              {!fullSolution && (
                <>
                  <p className="text-sm text-slate-600">Still stuck?</p>
                  <button
                    onClick={requestFullSolution}
                    disabled={isGeneratingSolution}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGeneratingSolution ? "Generating Solution..." : "Get Full Solution"}
                  </button>
                  {solutionError && (
                    <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
                      {solutionError}
                    </div>
                  )}
                </>
              )}

              {fullSolution && (
                <>
                  <button
                    disabled
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 text-slate-500 font-medium rounded-lg cursor-default"
                  >
                    Solution Generated
                  </button>
                  <FullSolutionCard solution={fullSolution} language={form.language} />
                </>
              )}
            </div>
          )}

          {currentLevel < 4 && HINT_META[currentLevel]?.nextLabel && (
            <button
              onClick={() => requestHint(currentLevel + 1)}
              disabled={isLoadingHint}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingHint ? "Thinking..." : HINT_META[currentLevel].nextLabel}
            </button>
          )}

          {currentLevel === 4 && (
            <p className="text-sm text-slate-500">
              That&apos;s the full explanation for this doubt. Start a{" "}
              <button onClick={resetSession} className="font-medium text-slate-700 underline hover:text-slate-900">
                new problem
              </button>{" "}
              whenever you&apos;re ready.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FullSolutionCard({ solution, language }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-900 text-white px-4 py-3">
        <h3 className="text-sm font-bold tracking-tight">FULL SOLUTION</h3>
      </div>
      <div className="p-4 space-y-4">
        <SolutionSection label="1. Approach" text={solution.approach} />
        <SolutionSection label="2. Why It Works" text={solution.whyItWorks} />
        <div>
          <h4 className="text-sm font-semibold text-slate-800">
            3. Correct Code{language ? ` (${language})` : ""}
          </h4>
          <pre className="mt-1 text-sm font-mono bg-slate-50 border border-slate-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
            {solution.code}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">4. Complexity</h4>
          <p className="mt-1 text-sm text-slate-600">
            Time Complexity: <span className="font-mono">{solution.timeComplexity}</span>
          </p>
          <p className="text-sm text-slate-600">
            Space Complexity: <span className="font-mono">{solution.spaceComplexity}</span>
          </p>
        </div>
        <SolutionSection label="5. Key Takeaway" text={solution.keyTakeaway} />
      </div>
    </div>
  );
}

function SolutionSection({ label, text }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-800">{label}</h4>
      <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{text}</p>
    </div>
  );
}
