"use client";

import { DARK_CARD_PADDED } from "@/lib/theme";
import useInView from "@/components/useInView";

// Compact "how am I doing overall" summary — real ConceptMastery average +
// a real aggregate trend (see getMasteryOverview in lib/masteryInsights.js),
// never fabricated. Secondary counts (studied/mastered/needing attention)
// stay visually small, per AGENTS.md ("keep these secondary").
export default function OverallMasteryCard({ overallMasteryPercent, overallTrend, conceptsStudied, conceptsMastered, conceptsNeedingAttention }) {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <div ref={ref} className={DARK_CARD_PADDED}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400/90">Overall Mastery</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-50">
              {overallMasteryPercent !== null ? `${overallMasteryPercent}%` : "—"}
            </span>
            {overallTrend && (
              <span className={`text-sm font-medium ${overallTrend.direction === "up" ? "text-emerald-400" : "text-rose-400"}`}>
                {overallTrend.direction === "up" ? "↑" : "↓"} {overallTrend.deltaPoints}% recently
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-5 text-xs text-slate-500">
          <Stat label="Studied" value={conceptsStudied} />
          <Stat label="Mastered" value={conceptsMastered} tone="text-emerald-400" />
          <Stat label="Needs Attention" value={conceptsNeedingAttention} tone="text-amber-400" />
        </div>
      </div>

      {overallMasteryPercent !== null && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-1000 ease-out"
            style={{ width: isInView ? `${overallMasteryPercent}%` : "0%" }}
          />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "text-slate-300" }) {
  return (
    <div className="text-right">
      <p className={`text-sm font-semibold ${tone}`}>{value}</p>
      <p className="text-slate-600">{label}</p>
    </div>
  );
}
