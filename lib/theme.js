// lib/theme.js
//
// Phase 10: single source of truth for the semantic status/color system and
// shared card/layout classnames, so the same status never gets a different
// color on different pages. Plain constants — no CSS-in-JS framework.

// Mastery status (Phase 6) — reused anywhere a WEAK/DEVELOPING/STRONG value
// is shown (Mastery, Dashboard, Revision).
export const STATUS_STYLES = {
  STRONG: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DEVELOPING: "bg-amber-50 text-amber-700 border-amber-200",
  WEAK: "bg-rose-50 text-rose-700 border-rose-200",
  NEUTRAL: "bg-slate-50 text-slate-600 border-slate-200",
};

export const STATUS_LABELS = {
  STRONG: "Strong",
  DEVELOPING: "Developing",
  WEAK: "Weak",
};

export const STATUS_DOT = {
  STRONG: "bg-emerald-500",
  DEVELOPING: "bg-amber-500",
  WEAK: "bg-rose-500",
  NEUTRAL: "bg-slate-400",
};

// Recharts fill colors — same semantic palette as STATUS_STYLES above.
export const STATUS_CHART_COLOR = {
  STRONG: "#10b981", // emerald-500
  DEVELOPING: "#f59e0b", // amber-500
  WEAK: "#f43f5e", // rose-500
  NEUTRAL: "#94a3b8", // slate-400
};

export function masteryStatusColor(status) {
  return STATUS_CHART_COLOR[status] || STATUS_CHART_COLOR.NEUTRAL;
}

// LeetCode difficulty (Phase 3/8) — reused on Mastery, Failures, Concepts,
// Recommendations, Dashboard.
export const DIFFICULTY_STYLES = {
  Easy: "text-emerald-600",
  Medium: "text-amber-500",
  Hard: "text-rose-500",
};

// Recommendation priority (Phase 8) — reused on Recommendations, Dashboard.
export const PRIORITY_STYLES = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

// Revision urgency (Phase 7) — overdue/due-today reuses WEAK red, upcoming
// reuses DEVELOPING amber, so revision urgency and mastery weakness always
// mean the same color across the app.
export const URGENCY_STYLES = {
  OVERDUE: STATUS_STYLES.WEAK,
  UPCOMING: STATUS_STYLES.DEVELOPING,
};

// Shared card/shell classnames so every page's cards match exactly.
export const CARD = "bg-white border border-slate-200 rounded-xl shadow-sm";
export const CARD_PADDED = `${CARD} p-6`;
// `maxW` lets each page pick its own content width (e.g. "max-w-4xl") while
// sharing the same responsive padding/spacing everywhere.
export function pageClass(maxW = "max-w-7xl") {
  return `p-4 sm:p-6 lg:p-8 ${maxW} mx-auto space-y-6`;
}
export const BTN_PRIMARY =
  "px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
export const BTN_SECONDARY =
  "px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
