// Status vocabulary for the Problems page — derived from real
// ConceptMastery.status (+ a real trend for the WEAK/ATTENTION split), see
// computeStatus in lib/problemsInsights.js. Colors follow the exact
// semantic palette specified for this page.
export const STATUS_META = {
  MASTERED: { emoji: "🟢", badge: "border-green-400/25 bg-green-500/10 text-green-300", dot: "bg-green-400", label: "Mastered" },
  IMPROVING: { emoji: "🔵", badge: "border-blue-400/25 bg-blue-500/10 text-blue-300", dot: "bg-blue-400", label: "Improving" },
  ATTENTION: { emoji: "🟠", badge: "border-amber-400/25 bg-amber-500/10 text-amber-300", dot: "bg-amber-400", label: "Needs Attention" },
  WEAK: { emoji: "🔴", badge: "border-red-400/25 bg-red-500/10 text-red-300", dot: "bg-red-400", label: "Weak" },
  NOT_ATTEMPTED: { emoji: "⚪", badge: "border-white/10 bg-white/5 text-neutral-400", dot: "bg-neutral-500", label: "Not Attempted" },
};
