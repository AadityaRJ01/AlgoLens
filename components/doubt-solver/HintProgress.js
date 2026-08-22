const STAGES = ["Hint 1", "Hint 2", "Hint 3", "🔒 Full Solution"];

// Purely visual — reflects `currentLevel` (hints.length, 0-4), the exact
// same real progression state DoubtSolverWorkspace.js already tracks. Never
// changes when a stage unlocks; that's still entirely gated by the real
// `hasHint3` check before the Solution Gate can be reached.
export default function HintProgress({ currentLevel }) {
  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => {
        const stepLevel = i + 1;
        const isDone = currentLevel >= stepLevel;
        const isActive = currentLevel === stepLevel - 1 || (stepLevel === 4 && currentLevel === 3);
        return (
          <div key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  isDone
                    ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                    : isActive
                    ? "border-violet-400/60 bg-violet-500/10 text-violet-300"
                    : "border-slate-800 bg-white/5 text-slate-500"
                }`}
              >
                {isDone ? "✓" : stepLevel}
              </span>
              <span className={`whitespace-nowrap text-[10px] ${isDone || isActive ? "text-slate-300" : "text-slate-600"}`}>
                {stage}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <span className={`mx-1.5 h-px flex-1 ${currentLevel > stepLevel - 1 ? "bg-violet-400/40" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
