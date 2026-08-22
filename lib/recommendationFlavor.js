// lib/recommendationFlavor.js
//
// ISOLATED CURATED CONTENT — not user data, not AI output. Two small,
// static maps used only to make the Recommendations page's grouping and
// hover-preview text readable:
//
//   1. FAILURE_MODE_MAP: groups real target concepts (from
//      selectRecommendationCandidates, lib/recommendations.js) under a
//      broader "cognitive failure mode" label for the cluster grid. Every
//      problem inside a cluster is still a real, deterministically-selected
//      candidate — this only changes how they're grouped/labeled.
//   2. CONCEPT_PATTERN_HINTS: a one-line static description of the pattern
//      behind a concept, shown on card hover. Not a per-problem AI insight —
//      just a short static hint, same spirit as a glossary entry.
//
// Swap/extend these freely; nothing else in the Recommendations page needs
// to change if a real taxonomy or AI-generated hint replaces them later.

const FAILURE_MODE_MAP = {
  "Dynamic Programming": "State Transition Deficits",
  Backtracking: "State Transition Deficits",
  "Divide and Conquer": "State Transition Deficits",

  "Two Pointers": "Pointer & Indexing Edge Cases",
  "Sliding Window": "Pointer & Indexing Edge Cases",
  "Binary Search": "Pointer & Indexing Edge Cases",
  "Prefix Sum": "Pointer & Indexing Edge Cases",

  Greedy: "Decision Logic Gaps",
  "Bit Manipulation": "Decision Logic Gaps",

  "Breadth-First Search": "Traversal & Connectivity Gaps",
  "Depth-First Search": "Traversal & Connectivity Gaps",
  "Topological Sort": "Traversal & Connectivity Gaps",
  "Union-Find": "Traversal & Connectivity Gaps",

  "Monotonic Stack": "Structural Pattern Gaps",
  "Monotonic Queue": "Structural Pattern Gaps",
};

const DEFAULT_FAILURE_MODE = "General Problem-Solving Gaps";

export function failureModeFor(concept) {
  return FAILURE_MODE_MAP[concept] || DEFAULT_FAILURE_MODE;
}

const CONCEPT_PATTERN_HINTS = {
  "Dynamic Programming": "Define the state first, then derive the transition — most bugs come from an ambiguous state definition, not the recurrence itself.",
  Backtracking: "Choose, explore, un-choose. The undo step is what most implementations get wrong.",
  "Two Pointers": "Two indices moving with a clear invariant about what's between them — the invariant is the whole trick.",
  "Sliding Window": "Expand to include, shrink to restore the invariant. Track the window's validity, not just its size.",
  "Binary Search": "The invariant is what's true on each side of the boundary — write that down before writing the loop.",
  Greedy: "Prove the exchange argument first: why does the locally-best choice never hurt the global answer?",
  "Breadth-First Search": "Layer-by-layer exploration — the first time you reach a node is via the shortest path, by construction.",
  "Depth-First Search": "Go deep, then backtrack. Track visited state carefully to avoid infinite recursion on cycles.",
  "Monotonic Stack": "Pop while the invariant breaks, then push — the stack always stays ordered by construction.",
};

const DEFAULT_PATTERN_HINT = "Isolate the core pattern from the surrounding problem details, then apply it directly.";

export function patternHintFor(concept) {
  return CONCEPT_PATTERN_HINTS[concept] || DEFAULT_PATTERN_HINT;
}

// A "why this fixes it" pill for a candidate card — deterministic, derived
// from the concept + priority signal already computed for that candidate
// (lib/recommendations.js's rankConceptsByUrgency), not invented per-card
// copy.
export function whyPillFor({ targetConcept, signals }) {
  if (signals?.recentFailureCount > 0) {
    return `⚡ Fixes your recent ${targetConcept} mistakes`;
  }
  if (signals?.revisionScore > 50) {
    return `⚡ Reinforces ${targetConcept} before it decays further`;
  }
  return `⚡ Builds ${targetConcept} pattern recognition`;
}

// Deterministic estimated time-to-solve, purely from difficulty — a
// reasonable planning hint, not a measured statistic.
const TIME_ESTIMATE_BY_DIFFICULTY = { Easy: "~15 mins", Medium: "~25 mins", Hard: "~40 mins" };

export function estimatedTimeFor(difficulty) {
  return TIME_ESTIMATE_BY_DIFFICULTY[difficulty] || "~25 mins";
}
