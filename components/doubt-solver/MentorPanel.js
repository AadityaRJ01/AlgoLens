import { DARK_CARD_PADDED, DARK_BTN_PRIMARY, DARK_BTN_SECONDARY } from "@/lib/theme";
import HintProgress from "./HintProgress";
import SolutionView from "./SolutionView";

const HINT_META = {
  1: { label: "HINT 1 — CONCEPT", tone: "border-blue-400/20 bg-blue-500/10 text-blue-300" },
  2: { label: "HINT 2 — APPROACH", tone: "border-amber-400/20 bg-amber-500/10 text-amber-300" },
  3: { label: "HINT 3 — IMPLEMENTATION", tone: "border-rose-400/20 bg-rose-500/10 text-rose-300" },
  4: { label: "FULL EXPLANATION", tone: "border-slate-800 bg-white/5 text-slate-300" },
};

const NEXT_LABEL = { 1: "Ask Mentor for Hint 2 →", 2: "Ask Mentor for Hint 3 →", 3: "Ask Mentor to Explain Fully →" };

const PROMPT_CHIPS = [
  "Why does my approach fail?",
  "I don't understand the greedy choice.",
  "What edge case am I missing?",
  "Why is this the right time complexity?",
];

// CENTER pane, primary focus. Every network call is still owned by
// DoubtSolverWorkspace.js (onGetFirstHint/onNextHint/onGenerateSolution) —
// this component only lays out the existing hints/fullSolution/error state
// as a mentor conversation instead of a flat form-result stack.
export default function MentorPanel({
  sessionStarted,
  currentLevel,
  hints,
  error,
  isLoadingHint,
  doubt,
  onDoubtChange,
  canGetFirstHint,
  onGetFirstHint,
  onNextHint,
  hasHint3,
  fullSolution,
  isGeneratingSolution,
  solutionError,
  onGenerateSolution,
  onReset,
  language,
}) {
  return (
    <div className={`${DARK_CARD_PADDED} space-y-5`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-50">AI Mentor Workspace</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${isLoadingHint || isGeneratingSolution ? "bg-violet-400 animate-pulse" : "bg-emerald-400"}`} />
          {isLoadingHint || isGeneratingSolution ? "Thinking" : "Ready"}
        </span>
      </div>

      <HintProgress currentLevel={currentLevel} />

      {!sessionStarted && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onDoubtChange(chip)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-violet-400/30 hover:text-violet-200"
              >
                {chip}
              </button>
            ))}
          </div>

          <label htmlFor="doubt" className="sr-only">
            What&apos;s your doubt?
          </label>
          <textarea
            id="doubt"
            value={doubt}
            onChange={(e) => onDoubtChange(e.target.value)}
            rows={4}
            placeholder="What's your doubt? Explain what's confusing you..."
            className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-3.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-violet-400/50 focus-visible:ring-2 focus-visible:ring-violet-400/40"
          />

          {error && (
            <p role="alert" className="text-sm text-rose-400">
              {error}
            </p>
          )}

          <button onClick={onGetFirstHint} disabled={!canGetFirstHint} className={`w-full sm:w-auto ${DARK_BTN_PRIMARY}`}>
            {isLoadingHint ? "Analyzing logic pattern..." : "Ask Mentor →"}
          </button>
        </div>
      )}

      {sessionStarted && (
        <div className="space-y-4">
          {hints.map(({ level, text }) => (
            <div key={level} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${HINT_META[level].tone}`}>
                {HINT_META[level].label}
              </span>
              <p className="mt-2.5 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-200">{text}</p>
            </div>
          ))}

          {error && (
            <p role="alert" className="text-sm text-rose-400">
              {error}
            </p>
          )}

          {isLoadingHint && (
            <p className="animate-pulse text-sm text-violet-300">Analyzing logic pattern...</p>
          )}

          {hasHint3 && (
            <SolutionView
              solution={fullSolution}
              isGenerating={isGeneratingSolution}
              error={solutionError}
              onGenerate={onGenerateSolution}
              language={language}
            />
          )}

          {currentLevel < 4 && NEXT_LABEL[currentLevel] && (
            <button onClick={onNextHint} disabled={isLoadingHint} className={DARK_BTN_PRIMARY}>
              {isLoadingHint ? "Analyzing logic pattern..." : NEXT_LABEL[currentLevel]}
            </button>
          )}

          {currentLevel === 4 && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <p className="text-sm text-slate-500">That&apos;s the full explanation for this doubt.</p>
              <button onClick={onReset} className={DARK_BTN_SECONDARY}>
                New Problem
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
