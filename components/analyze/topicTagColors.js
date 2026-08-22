// Subtle per-category tinting for problem topic tags, so the tag row reads
// as information rather than uniform gray chips. Deliberately a small,
// curated map (not every possible LeetCode tag) — anything unmatched falls
// back to the same neutral tint as before, so this never turns into a
// rainbow of arbitrary colors.
const CATEGORY_TONES = {
  blue: "border-blue-400/15 bg-blue-500/10 text-blue-300",
  purple: "border-purple-400/15 bg-purple-500/10 text-purple-300",
  amber: "border-amber-400/15 bg-amber-500/10 text-amber-300",
  cyan: "border-cyan-400/15 bg-cyan-500/10 text-cyan-300",
  neutral: "border-slate-800 bg-white/5 text-slate-400",
};

const TAG_TONE = {
  array: "blue",
  string: "blue",
  "hash table": "blue",
  "two pointers": "blue",
  "sliding window": "blue",
  "binary search": "blue",
  sorting: "blue",
  matrix: "blue",

  "dynamic programming": "purple",
  backtracking: "purple",
  recursion: "purple",
  "divide and conquer": "purple",
  "bit manipulation": "purple",

  greedy: "amber",
  math: "amber",

  heap: "cyan",
  "priority queue": "cyan",
  stack: "cyan",
  queue: "cyan",
  graph: "cyan",
  tree: "cyan",
  "binary tree": "cyan",
  "breadth-first search": "cyan",
  "depth-first search": "cyan",
  "union find": "cyan",
  trie: "cyan",
  "linked list": "cyan",
};

export function topicTagClass(tag) {
  const tone = TAG_TONE[tag.trim().toLowerCase()] || "neutral";
  return CATEGORY_TONES[tone];
}
