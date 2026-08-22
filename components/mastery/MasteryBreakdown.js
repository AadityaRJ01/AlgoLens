// Sub-concept breakdown — MOCK data (see lib/mockSubconcepts.js; there is no
// sub-concept schema anywhere in this project). Clearly scoped to this one
// section so it's obvious what to replace once real sub-concept tracking
// exists.
export default function MasteryBreakdown({ breakdown }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-purple-400/90">Mastery Breakdown</p>
      <div className="mt-2.5 space-y-2.5">
        {breakdown.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300">{item.name}</span>
              <span className="font-medium text-neutral-200">{item.score}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
