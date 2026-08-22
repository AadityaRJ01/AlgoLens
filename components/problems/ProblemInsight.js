import { PURPLE_ACCENT } from "@/components/recommendations/tierMeta";

// "Why practice this?" — a real Groq-authored Recommendation.reason when
// this problem is actively recommended, otherwise a real signal-derived
// line (recent failure root cause, trend, or mastery status). Never shown
// with invented copy — see buildInsight in lib/problemsInsights.js, which
// returns null (rendered as nothing) when there's genuinely no real signal.
export default function ProblemInsight({ insight }) {
  if (!insight) return null;

  return (
    <div className={`rounded-lg border px-3 py-2 ${PURPLE_ACCENT.badge}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wide ${PURPLE_ACCENT.text}`}>Why practice this?</p>
      <p className="mt-0.5 text-xs leading-snug text-slate-300">{insight}</p>
    </div>
  );
}
