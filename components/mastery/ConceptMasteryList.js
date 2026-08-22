"use client";

import { useMemo, useState } from "react";
import { DARK_CARD_PADDED } from "@/lib/theme";
import ConceptMasteryRow from "./ConceptMasteryRow";

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "WEAK", label: "Needs Attention" },
  { id: "DEVELOPING", label: "Improving" },
  { id: "STRONG", label: "Strong" },
];

const SORTS = [
  { id: "mastery", label: "Mastery" },
  { id: "recent", label: "Recent change" },
  { id: "attempted", label: "Most attempted" },
];

function sortList(list, sortId) {
  const copy = [...list];
  if (sortId === "attempted") {
    return copy.sort((a, b) => b.totalMicroProofAttempts - a.totalMicroProofAttempts);
  }
  if (sortId === "recent") {
    return copy.sort((a, b) => {
      const aVal = a.trend ? (a.trend.direction === "up" ? a.trend.deltaPoints : -a.trend.deltaPoints) : -Infinity;
      const bVal = b.trend ? (b.trend.direction === "up" ? b.trend.deltaPoints : -b.trend.deltaPoints) : -Infinity;
      return bVal - aVal;
    });
  }
  // "mastery" — weakest first, matches the order the server already sent.
  return copy.sort((a, b) => a.masteryScore - b.masteryScore);
}

// "Your Concepts" — client-side filter/sort over the real masteryList
// (see getMasteryOverview in lib/masteryInsights.js). Selecting a concept
// navigates via a real link (?concept=...), no client fetching involved.
export default function ConceptMasteryList({ masteryList, selectedConcept }) {
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("mastery");

  const filtered = useMemo(() => {
    const base = filter === "ALL" ? masteryList : masteryList.filter((m) => m.status === filter);
    return sortList(base, sort);
  }, [masteryList, filter, sort]);

  return (
    <div className={DARK_CARD_PADDED}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-base font-semibold text-slate-50">Your Concepts</h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 outline-none focus:border-indigo-400/40"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id} className="bg-slate-900">
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300"
                : "border-slate-800 text-slate-400 hover:text-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No concepts match this filter.</p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {filtered.map((m) => (
            <ConceptMasteryRow key={m.concept} {...m} isSelected={m.concept === selectedConcept} />
          ))}
        </div>
      )}
    </div>
  );
}
