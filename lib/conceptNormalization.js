// lib/conceptNormalization.js
//
// Phase 6: lightweight, explainable concept-name normalization.
//
// Goal: collapse obvious surface-form duplicates ("Sliding Window" vs
// "sliding-window" vs "Sliding Window Technique") into one canonical
// mastery bucket, WITHOUT merging genuinely distinct/more specific concepts
// (e.g. "DP State Design" stays its own concept — it must NOT collapse into
// the more generic "Dynamic Programming" bucket just because both relate to
// dynamic programming).
//
// This is intentionally a small controlled map + regex containment check,
// not an NLP/embedding-based similarity system.

const CANONICAL_CONCEPTS = [
  { canonical: "Sliding Window", pattern: /\bsliding[\s-]?window\b/i },
  { canonical: "Two Pointers", pattern: /\btwo[\s-]?pointers?\b/i },
  { canonical: "Binary Search", pattern: /\bbinary[\s-]?search\b/i },
  { canonical: "Monotonic Stack", pattern: /\bmonotonic[\s-]?stack\b/i },
  { canonical: "Monotonic Queue", pattern: /\bmonotonic[\s-]?queue\b/i },
  { canonical: "Dynamic Programming", pattern: /\bdynamic[\s-]?programming\b/i },
  { canonical: "Backtracking", pattern: /\bbacktrack(ing)?\b/i },
  { canonical: "Union-Find", pattern: /\b(union[\s-]?find|disjoint[\s-]?set)\b/i },
  { canonical: "Topological Sort", pattern: /\btopological[\s-]?sort(ing)?\b/i },
  { canonical: "Divide and Conquer", pattern: /\bdivide[\s-]?(and|&)[\s-]?conquer\b/i },
  { canonical: "Prefix Sum", pattern: /\bprefix[\s-]?sums?\b/i },
  { canonical: "Breadth-First Search", pattern: /\bbreadth[\s-]?first[\s-]?search\b/i },
  { canonical: "Depth-First Search", pattern: /\bdepth[\s-]?first[\s-]?search\b/i },
  { canonical: "Bit Manipulation", pattern: /\bbit[\s-]?(manipulation|mask(ing)?)\b/i },
];

/**
 * Normalizes an AI-generated concept name into a canonical mastery bucket.
 *
 * Known named patterns (sliding window, two pointers, binary search, ...)
 * collapse to one canonical form regardless of casing/hyphenation/phrasing.
 * Anything else is preserved as-is (only whitespace/hyphen cleanup) so more
 * specific concepts are never silently merged into an unrelated generic one.
 *
 * @param {string} raw
 * @returns {string|null} the canonical concept name, or null if raw is empty/invalid
 */
export function normalizeConceptName(raw) {
  if (typeof raw !== "string") return null;

  // AI output often uses typographic dash characters (non-breaking hyphen,
  // en/em dash, minus sign, ...) instead of a plain ASCII "-". Fold them all
  // down first so pattern matching and cleanup behave consistently.
  // U+2010 hyphen, U+2011 non-breaking hyphen, U+2012 figure dash,
  // U+2013 en dash, U+2014 em dash, U+2015 horizontal bar, U+2212 minus sign.
  const trimmed = raw.replace(/[‐‑‒–—―−]/g, "-").trim();
  if (!trimmed) return null;

  for (const { canonical, pattern } of CANONICAL_CONCEPTS) {
    if (pattern.test(trimmed)) return canonical;
  }

  return trimmed.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}
