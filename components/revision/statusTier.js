// Shared 4-tier semantic color system for the Revision page — presentation
// only, derived from the real `status` (ConceptMastery.status, via
// lib/mastery.js's getMasteryStatus) and `priorityLabel` (from
// rankConceptsByUrgency) already attached to each item in
// lib/revisionInsights.js. Nothing here changes which items appear or how
// they're ordered — it only maps real fields to a consistent color/label.
export function getStatusTier({ status, priorityLabel }) {
  if (status === "WEAK" && priorityLabel === "High") return "URGENT";
  if (status === "WEAK" || priorityLabel === "High") return "ATTENTION";
  if (status === "STRONG") return "STRONG";
  return "IMPROVING";
}

export const TIER_META = {
  URGENT: {
    dot: "🔴",
    dotClass: "bg-rose-400",
    badge: "border-rose-400/25 bg-rose-500/10 text-rose-300",
    bar: "from-rose-500 to-rose-400",
    text: "text-rose-300",
    borderLeft: "border-l-rose-400/60",
    label: "Needs Immediate Revision",
    queueLabel: "High Priority",
  },
  ATTENTION: {
    dot: "🟠",
    dotClass: "bg-amber-400",
    badge: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    bar: "from-amber-500 to-amber-400",
    text: "text-amber-300",
    borderLeft: "border-l-amber-400/60",
    label: "Needs Attention",
    queueLabel: "Medium Priority",
  },
  IMPROVING: {
    dot: "🔵",
    dotClass: "bg-blue-400",
    badge: "border-blue-400/25 bg-blue-500/10 text-blue-300",
    bar: "from-blue-500 to-indigo-400",
    text: "text-blue-300",
    borderLeft: "border-l-blue-400/60",
    label: "Improving",
    queueLabel: "Improving",
  },
  STRONG: {
    dot: "🟢",
    dotClass: "bg-emerald-400",
    badge: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    bar: "from-emerald-500 to-cyan-400",
    text: "text-emerald-300",
    borderLeft: "border-l-emerald-400/60",
    label: "Strong",
    queueLabel: "Strong",
  },
};
