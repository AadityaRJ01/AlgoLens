// Compact top bar — purely presentational, driven by real session state
// (sessionStarted / selectedProblem / form.problemTitle) already owned by
// DoubtSolverWorkspace.js. No new state, no API calls.
export default function DoubtSolverHeader({ problemTitle, isActive }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
      <div className="flex items-center gap-2">
        <span className="text-violet-400" aria-hidden="true">◈</span>
        <span className="text-sm font-semibold tracking-tight text-slate-50">AlgoLens</span>
        <span className="text-slate-700">|</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI Doubt Solver</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-violet-400 animate-pulse" : "bg-slate-600"}`} />
          AI Mentor {isActive ? "Active" : "Idle"}
        </span>
        {problemTitle && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            {problemTitle}
          </span>
        )}
      </div>
    </div>
  );
}
