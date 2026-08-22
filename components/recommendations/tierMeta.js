// Semantic color system for the Recommendations page, using the exact
// Tailwind color families specified: red (critical), amber (reinforcement),
// blue (progression/next step), green (completed/mastered), and purple
// reserved separately for AI reasoning/insight (not a status tier — see
// PURPLE_ACCENT below).
export const TIER_META = {
  CRITICAL: {
    emoji: "🔴",
    dot: "bg-red-400",
    badge: "border-red-400/25 bg-red-500/10 text-red-300",
    bar: "from-red-500 to-red-400",
    text: "text-red-300",
    label: "Critical Gap",
    filterLabel: "Critical Gaps",
  },
  REINFORCEMENT: {
    emoji: "🟠",
    dot: "bg-amber-400",
    badge: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    bar: "from-amber-500 to-amber-400",
    text: "text-amber-300",
    label: "Reinforcement",
    filterLabel: "Reinforcement",
  },
  PROGRESSION: {
    emoji: "🔵",
    dot: "bg-blue-400",
    badge: "border-blue-400/25 bg-blue-500/10 text-blue-300",
    bar: "from-blue-500 to-blue-400",
    text: "text-blue-300",
    label: "Progression",
    filterLabel: "Progression",
  },
  COMPLETED: {
    emoji: "🟢",
    dot: "bg-green-400",
    badge: "border-green-400/25 bg-green-500/10 text-green-300",
    bar: "from-green-500 to-green-400",
    text: "text-green-300",
    label: "Completed",
    filterLabel: "Completed",
  },
};

// Purple accent — Concept / AI Reasoning & Insight, per the spec's color
// system. Used for "Why AlgoLens Chose This" and other reasoning surfaces,
// never for a status/priority badge.
export const PURPLE_ACCENT = {
  badge: "border-purple-400/25 bg-purple-500/10 text-purple-300",
  text: "text-purple-300",
  ring: "ring-purple-400/15",
};
