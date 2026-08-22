import { TIER_META } from "./statusTier";

// Mastery % + real trend arrow (see buildConceptTrends, reused as-is in
// lib/revisionInsights.js). A decline is always rose regardless of tier — a
// regression is never good news. An improvement is colored by the item's
// own tier, so an IMPROVING/STRONG concept reads greener while an
// ATTENTION concept ticking up still reads amber — "context" per
// AGENTS.md's color-hierarchy spec, without a separate color table.
export default function MasteryTrend({ masteryScore, trend, tier }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-semibold text-neutral-100">{masteryScore}%</span>
      {trend && (
        <span className={`text-xs font-medium ${trend.direction === "up" ? TIER_META[tier].text : "text-rose-400"}`}>
          {trend.direction === "up" ? "↑" : "↓"} {Math.round(trend.deltaPoints)}%
        </span>
      )}
    </span>
  );
}
