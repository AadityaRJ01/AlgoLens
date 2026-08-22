"use client";

import useInView from "./useInView";

const MASTERY_ROWS = [
  { concept: "Two Pointers", value: 68, tone: "from-blue-500 to-indigo-500" },
  { concept: "Greedy", value: 82, tone: "from-emerald-500 to-blue-500" },
  { concept: "Dynamic Programming", value: 41, tone: "from-rose-500 to-orange-400" },
];

// Purely decorative "product screenshot" for the landing hero. This data is
// hand-authored and static — it is NOT wired to the database or to the real
// mastery engine (see lib/mastery.js / lib/dashboard.js for that).
export default function ProductPreview() {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <div ref={ref} className="relative landing-float">
      {/* ambient blue/violet glow behind the card */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-blue-600/20 blur-2xl"
      />

      <div className="rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
        {/* window chrome, to read as a real product screenshot */}
        <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-4">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-3 text-xs text-neutral-500">AlgoLens — Concept Mastery</span>
        </div>

        <div className="space-y-5 px-6 py-6">
          <h3 className="text-sm font-semibold text-neutral-200">Concept Mastery</h3>

          <div className="space-y-4">
            {MASTERY_ROWS.map((row, i) => (
              <div key={row.concept}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-300">{row.concept}</span>
                  <span className="font-semibold text-neutral-100">{row.value}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${row.tone} transition-[width] ease-out`}
                    style={{
                      width: isInView ? `${row.value}%` : "0%",
                      transitionDuration: "1100ms",
                      transitionDelay: `${150 + i * 120}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              Weak concept detected
            </span>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
              Recommended practice
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
