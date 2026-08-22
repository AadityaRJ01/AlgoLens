const UNDERSTANDING_META = {
  strong: { label: "Strong understanding", tone: "text-emerald-300", bar: "from-emerald-500 to-emerald-400" },
  partial: { label: "Partial understanding", tone: "text-amber-300", bar: "from-amber-500 to-amber-400" },
  weak: { label: "Needs revision", tone: "text-rose-300", bar: "from-rose-500 to-rose-400" },
};

// The real 0-10 score + understanding tier from
// POST /api/microproofs/[id]/evaluate — never rescaled to a fake "out of
// 100" or otherwise embellished, per AGENTS.md ("do not create a fake
// score if the API does not provide one").
export default function ScoreVisual({ score, understanding }) {
  const meta = UNDERSTANDING_META[understanding] || { label: understanding, tone: "text-slate-300", bar: "from-indigo-500 to-blue-500" };

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-50">{score}</span>
        <span className="text-sm text-slate-500">/ 10</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${meta.bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      <p className={`mt-1.5 text-sm font-medium ${meta.tone}`}>{meta.label}</p>
    </div>
  );
}
