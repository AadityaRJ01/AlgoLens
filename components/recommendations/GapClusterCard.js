import { DARK_DIFFICULTY_STYLES } from "@/lib/theme";
import { TIER_META } from "./tierMeta";

// One candidate problem — real, deterministically selected by
// selectRecommendationCandidates (lib/recommendations.js), grouped into its
// cluster by lib/recommendationFlavor.js's curated failure-mode map. The
// "why" pill and time estimate are deterministic/derived (not measured);
// the hover reveal shows a short static pattern hint for the concept —
// CSS-only, no client JS needed.
export default function GapClusterCard({ item }) {
  const meta = TIER_META[item.tier];

  return (
    <a
      href={item.url || undefined}
      target={item.url ? "_blank" : undefined}
      rel={item.url ? "noopener noreferrer" : undefined}
      className="group relative block overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-100">{item.title}</p>
        <span className={`shrink-0 text-xs font-semibold ${DARK_DIFFICULTY_STYLES[item.difficulty] || "text-neutral-400"}`}>
          {item.difficulty}
        </span>
      </div>

      <span className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}>
        {item.whyPill}
      </span>

      <p className="mt-1.5 text-[11px] text-neutral-500">{item.estimatedTime}</p>

      {/* Hover-expand mini pattern preview — pure CSS, height animates from
          0 so it doesn't reflow the grid until hovered. */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="mt-2 border-t border-white/10 pt-2 text-[11px] leading-snug text-neutral-400">{item.patternHint}</p>
        </div>
      </div>
    </a>
  );
}
