import { DARK_BTN_PRIMARY } from "@/lib/theme";
import CodeView from "./CodeView";

// The gated full-solution reveal. Rendered by MentorPanel.js only when the
// real `hasHint3` condition (currentLevel >= 3) is met — this component
// itself adds no additional gating logic, it only presents whatever
// POST /api/doubt-solver/solution already returned.
export default function SolutionView({ solution, isGenerating, error, onGenerate, language }) {
  if (!solution) {
    return (
      <div className="rounded-lg border border-amber-400/20 bg-amber-500/[0.06] p-4">
        <p className="text-sm text-slate-300">Still stuck? Reveal the full solution.</p>
        <button onClick={onGenerate} disabled={isGenerating} className={`mt-3 ${DARK_BTN_PRIMARY}`}>
          {isGenerating ? "Generating Solution…" : "Reveal Full Solution"}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-sm text-rose-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-emerald-400/20">
      <div className="bg-emerald-500/10 px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Full Solution</p>
      </div>
      <div className="space-y-4 p-4">
        <Section label="1. Approach" text={solution.approach} />
        <Section label="2. Why It Works" text={solution.whyItWorks} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            3. Correct Code{language ? ` (${language})` : ""}
          </p>
          <div className="mt-1.5">
            <CodeView code={solution.code} language={language} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">4. Complexity</p>
          <p className="mt-1 text-sm text-slate-300">
            Time: <span className="font-mono text-slate-200">{solution.timeComplexity}</span>
          </p>
          <p className="text-sm text-slate-300">
            Space: <span className="font-mono text-slate-200">{solution.spaceComplexity}</span>
          </p>
        </div>
        <Section label="5. Key Takeaway" text={solution.keyTakeaway} tone="text-violet-300" />
      </div>
    </div>
  );
}

function Section({ label, text, tone = "text-slate-500" }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone}`}>{label}</p>
      <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{text}</p>
    </div>
  );
}
