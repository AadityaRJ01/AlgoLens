// lib/mockSubconcepts.js
//
// ISOLATED MOCK DATA — sub-concept breakdown ("1D DP", "2D DP", "Knapsack",
// ...) for the Mastery detail view. There is no schema for sub-concepts
// anywhere in this project (ConceptMastery tracks one score per top-level
// concept only), so this is intentionally kept separate from
// lib/masteryInsights.js's real-data aggregation and clearly labeled, per
// AGENTS.md: "If the backend does not yet provide sub-concept data, use
// mock data." Swap this file for a real query the moment sub-concept
// tracking exists — nothing else in the Mastery page needs to change, since
// callers only ever see { name, score }[].

const SUBCONCEPT_LIBRARY = {
  "Dynamic Programming": ["1D DP", "2D DP", "Knapsack", "State Transition", "Memoization"],
  Graphs: ["BFS", "DFS", "Shortest Path", "Topological Sort", "Union-Find"],
  "Binary Search": ["Search Space Reduction", "Boundary Conditions", "Search on Answer"],
  "Two Pointers": ["Fixed Window", "Variable Window", "Opposite Direction"],
  Greedy: ["Exchange Argument", "Interval Scheduling", "Local Optimality"],
  "Sliding Window": ["Fixed Size", "Variable Size", "Shrink/Expand Logic"],
  Backtracking: ["State Space Pruning", "Choice/Undo", "Constraint Propagation"],
  "Monotonic Stack": ["Next Greater Element", "Stack Invariant Maintenance"],
};

const GENERIC_SUBCONCEPTS = ["Core Pattern", "Edge Cases", "Optimization", "Implementation"];

// Deterministic pseudo-random spread around the real mastery score, so the
// mock breakdown looks plausible and stable across renders for the same
// concept/score rather than reshuffling on every request.
function seededOffset(seed, index) {
  const x = Math.sin(seed * 97 + index * 131) * 10000;
  return Math.round((x - Math.floor(x) - 0.5) * 36); // roughly ±18
}

function clampScore(value) {
  return Math.max(4, Math.min(98, value));
}

/**
 * @param {string} concept - the real top-level concept name
 * @param {number} masteryScore - the real overall mastery score for it
 * @returns {{name: string, score: number}[]}
 */
export function getMockSubconceptBreakdown(concept, masteryScore) {
  const names = SUBCONCEPT_LIBRARY[concept] || GENERIC_SUBCONCEPTS;
  const seed = concept.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  return names.map((name, i) => ({
    name,
    score: clampScore(masteryScore + seededOffset(seed, i)),
  }));
}
