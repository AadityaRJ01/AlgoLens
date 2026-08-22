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

// ---------------------------------------------------------------------------
// Dark tokens — the authenticated dashboard/analyze/problems surfaces (and
// the mastery/revision/recommendations pages) use these instead of the
// light tokens above, so the product-side app matches the landing page's
// near-black/indigo identity. Deliberately more restrained than the landing
// page itself: smaller radius, no big glows — see components/Sidebar.js and
// app/dashboard/page.js for usage. The light tokens above are untouched so
// nothing that already used them changes behavior.
export const DARK_STATUS_STYLES = {
  STRONG: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  DEVELOPING: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  WEAK: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  NEUTRAL: "bg-white/5 text-neutral-400 border-white/10",
};

export const DARK_STATUS_DOT = {
  STRONG: "bg-emerald-400",
  DEVELOPING: "bg-amber-400",
  WEAK: "bg-rose-400",
  NEUTRAL: "bg-neutral-500",
};

export const DARK_DIFFICULTY_STYLES = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

export const DARK_PRIORITY_STYLES = {
  High: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Low: "bg-white/5 text-neutral-400 border-white/10",
};

export const DARK_CARD = "bg-neutral-900/60 border border-white/10 rounded-xl";
export const DARK_CARD_PADDED = `${DARK_CARD} p-5 sm:p-6`;

export const DARK_BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";
export const DARK_BTN_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 text-neutral-200 text-sm font-medium transition-colors hover:bg-white/5 hover:border-white/25 disabled:opacity-50 disabled:cursor-not-allowed";
