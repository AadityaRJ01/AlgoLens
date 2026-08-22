"use client";

import { useMemo, useState } from "react";
import { DARK_CARD_PADDED } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";
import GapClusterCard from "./GapClusterCard";
import { TIER_META } from "./tierMeta";

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "CRITICAL", label: `${TIER_META.CRITICAL.emoji} ${TIER_META.CRITICAL.filterLabel}` },
  { id: "REINFORCEMENT", label: `${TIER_META.REINFORCEMENT.emoji} ${TIER_META.REINFORCEMENT.filterLabel}` },
  { id: "PROGRESSION", label: `${TIER_META.PROGRESSION.emoji} ${TIER_META.PROGRESSION.filterLabel}` },
  { id: "COMPLETED", label: `${TIER_META.COMPLETED.emoji} ${TIER_META.COMPLETED.filterLabel}` },
];

// "Cognitive Failure Modes" cluster grid — real candidate problems (see
// getRecommendationEngineData in lib/recommendationsInsights.js), grouped
// under a curated broader label. Filtering is a client-side view over the
// same real data, not a different query.
export default function CognitiveGapClusters({ clusters }) {
  const [filter, setFilter] = useState("ALL");

  const visibleClusters = useMemo(() => {
    if (filter === "ALL") return clusters;
    return clusters
      .map((cluster) => ({ ...cluster, items: cluster.items.filter((item) => item.tier === filter) }))
      .filter((cluster) => cluster.items.length > 0);
  }, [clusters, filter]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-base font-semibold text-slate-50">Cognitive Gap Clusters</h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "border-blue-400/40 bg-blue-500/10 text-blue-300"
                  : "border-slate-800 text-slate-400 hover:text-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visibleClusters.length === 0 ? (
        <EmptyState tone="dark" message="No candidate problems match this filter right now." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleClusters.map((cluster) => {
            const meta = TIER_META[cluster.tier];
            return (
              <div key={cluster.label} className={DARK_CARD_PADDED}>
                <p className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}>
                  {meta.emoji} {cluster.label}
                </p>
                <div className="mt-3 space-y-2.5">
                  {cluster.items.map((item) => (
                    <GapClusterCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
