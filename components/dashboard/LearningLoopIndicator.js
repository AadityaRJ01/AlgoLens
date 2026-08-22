import { DARK_CARD_PADDED } from "@/lib/theme";

const STAGES = ["Problem", "Failure", "Concept", "Mastery", "Revision", "Recommendation"];

// Small, compact reinforcement of AlgoLens's core loop — deliberately NOT
// the large landing-page LearningLoop visualization (see AGENTS.md
// dashboard refinement #8: "do not recreate the large learning-loop
// visualization from the landing page"). `currentStage` is derived
// server-side in app/dashboard/page.js from real data (the newest
// recommendation/signal), never hardcoded.
export default function LearningLoopIndicator({ currentStage }) {
  return (
    <section className={`${DARK_CARD_PADDED} flex h-full flex-col`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Your Learning Loop</p>

      <div className="mt-3 flex-1 space-y-1">
        {STAGES.map((stage, i) => {
          const isActive = stage === currentStage;
          return (
            <div key={stage}>
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    isActive ? "bg-indigo-400 shadow-[0_0_6px_1px_rgba(129,140,248,0.7)]" : "bg-white/15"
                  }`}
                />
                <span className={`text-xs ${isActive ? "font-semibold text-neutral-100" : "text-neutral-500"}`}>
                  {stage}
                </span>
              </div>
              {i < STAGES.length - 1 && <div className="ml-[3px] h-2.5 w-px bg-white/10" />}
            </div>
          );
        })}
        <div className="flex items-center gap-2 pt-0.5">
          <span aria-hidden="true" className="ml-[1px] text-xs text-neutral-600">↻</span>
          <span className="text-[11px] text-neutral-600">back to Problem</span>
        </div>
      </div>

      <p className="mt-3 border-t border-white/10 pt-3 text-xs text-neutral-500">
        Current stage: <span className="font-medium text-indigo-300">{currentStage}</span>
      </p>
    </section>
  );
}
