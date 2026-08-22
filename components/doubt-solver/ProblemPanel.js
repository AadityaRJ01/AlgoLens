import { DARK_CARD_PADDED, DARK_DIFFICULTY_STYLES } from "@/lib/theme";
import CodeView from "./CodeView";

// LEFT pane — problem context. Every field here is the exact same real
// form state/setter already owned by DoubtSolverWorkspace.js
// (form/updateField/selectedProblem/catalog search) — this component only
// arranges it into collapsible sections instead of one flat stack of
// inputs. Inputs disable once `sessionStarted`, exactly as before.
export default function ProblemPanel({
  form,
  updateField,
  sessionStarted,
  selectedProblem,
  query,
  setQuery,
  searchResults,
  isSearching,
  isLoadingProblem,
  onSearch,
  onSelectProblem,
  languages,
}) {
  return (
    <div className={`${DARK_CARD_PADDED} space-y-4`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Problem Context</p>

      {!sessionStarted && (
        <div className="space-y-2">
          <label htmlFor="catalog-search" className="block text-xs text-slate-500">
            Search the LeetCode catalog to auto-fill
          </label>
          <form onSubmit={onSearch} className="flex gap-2">
            <input
              id="catalog-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Two Sum"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
            >
              {isSearching ? "…" : "Search"}
            </button>
          </form>
          {searchResults.length > 0 && (
            <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
              {searchResults.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => onSelectProblem(p)}
                    disabled={isLoadingProblem}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    <span className="truncate text-sm text-slate-200">{p.title}</span>
                    <span className={`shrink-0 text-xs font-semibold ${DARK_DIFFICULTY_STYLES[p.difficulty] || "text-slate-400"}`}>
                      {p.difficulty}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {isLoadingProblem && <p className="text-xs text-slate-500">Loading problem details…</p>}
        </div>
      )}

      <div>
        <label htmlFor="problemTitle" className="mb-1 block text-xs text-slate-500">
          Title
        </label>
        <input
          id="problemTitle"
          type="text"
          value={form.problemTitle}
          onChange={(e) => updateField("problemTitle", e.target.value)}
          disabled={sessionStarted}
          placeholder="e.g. Two Sum"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40 disabled:text-slate-400"
        />
      </div>

      {(selectedProblem || sessionStarted) && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {selectedProblem?.difficulty && (
            <span className={`font-semibold ${DARK_DIFFICULTY_STYLES[selectedProblem.difficulty] || "text-slate-400"}`}>
              {selectedProblem.difficulty}
            </span>
          )}
          {selectedProblem?.topicTags?.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-800/80 px-2 py-0.5 text-slate-300 border border-slate-700/50">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div>
        <label htmlFor="language" className="mb-1 block text-xs text-slate-500">
          Language
        </label>
        <select
          id="language"
          value={form.language}
          onChange={(e) => updateField("language", e.target.value)}
          disabled={sessionStarted}
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40 disabled:text-slate-400"
        >
          <option value="" className="bg-slate-900">Select language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang} className="bg-slate-900">{lang}</option>
          ))}
        </select>
      </div>

      <details className="group rounded-lg border border-white/10 open:bg-white/[0.02]">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200">
          <span className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
          Description &amp; Constraints
        </summary>
        <div className="space-y-3 px-3 pb-3">
          <textarea
            aria-label="Problem description"
            value={form.problemDescription}
            onChange={(e) => updateField("problemDescription", e.target.value)}
            disabled={sessionStarted}
            rows={4}
            placeholder="Paste the problem statement..."
            className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40 disabled:text-slate-500"
          />
          <textarea
            aria-label="Constraints"
            value={form.constraints}
            onChange={(e) => updateField("constraints", e.target.value)}
            disabled={sessionStarted}
            rows={2}
            placeholder="e.g. 1 <= n <= 10^5"
            className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40 disabled:text-slate-500"
          />
        </div>
      </details>

      <details className="group rounded-lg border border-white/10 open:bg-white/[0.02]" open={sessionStarted && Boolean(form.currentCode)}>
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200">
          <span className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
          Current Code
        </summary>
        <div className="px-3 pb-3">
          {sessionStarted ? (
            <CodeView code={form.currentCode} language={form.language} />
          ) : (
            <textarea
              aria-label="Current code"
              value={form.currentCode}
              onChange={(e) => updateField("currentCode", e.target.value)}
              spellCheck={false}
              rows={8}
              placeholder="Paste your current attempt..."
              className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-400/40"
            />
          )}
        </div>
      </details>
    </div>
  );
}
