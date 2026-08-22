import { DARK_CARD_PADDED, DARK_DIFFICULTY_STYLES } from "@/lib/theme";

const STATUS_META = {
  MASTERED: { label: "Mastered", emoji: "🟢", tone: "border-green-400/25 bg-green-500/10 text-green-300" },
  TARGETING: { label: "Targeting Now", emoji: "🔵", tone: "border-blue-400/25 bg-blue-500/10 text-blue-300" },
  LOCKED: { label: "Locked", emoji: "🔒", tone: "border-slate-800 bg-white/5 text-slate-400" },
  NONE: { label: "Not started", emoji: "○", tone: "border-slate-800 bg-white/5 text-slate-500" },
};

// Easy -> Medium -> Hard progression for the hero's concept. Step 1 (Easy)
// and Step 3 (Hard) are real problems when a matching one exists (a solved
// Easy problem tagged with this concept; an unsolved Hard catalog problem
// tagged with it) — see getRecommendationEngineData in
// lib/recommendationsInsights.js. A step with no real match shows "Not
// started" rather than a fabricated title.
export default function ProgressivePathway({ pathway }) {
  return (
    <div className={DARK_CARD_PADDED}>
      <h2 className="text-base font-semibold text-slate-50">Progressive Pathway</h2>
      <p className="mt-0.5 text-sm text-slate-500">{pathway.concept} — difficulty progression.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {pathway.steps.map((step, i) => {
          const status = STATUS_META[step.status];
          const content = (
            <div
              className={`h-full rounded-lg border px-3.5 py-3 ${
                step.status === "TARGETING" ? "border-blue-400/25 bg-blue-500/[0.06]" : "border-slate-800 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{step.stepLabel}</span>
                <span className={`text-xs font-semibold ${DARK_DIFFICULTY_STYLES[step.difficulty] || "text-slate-400"}`}>
                  {step.difficulty}
                </span>
              </div>
              <p className="mt-1.5 truncate text-sm font-semibold text-white">{step.title || "—"}</p>
              <span className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.tone}`}>
                {status.emoji} {status.label}
              </span>
            </div>
          );

          return (
            <div key={step.stepLabel} className="flex flex-1 items-center gap-3">
              {step.url ? (
                <a href={step.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  {content}
                </a>
              ) : (
                <div className="flex-1">{content}</div>
              )}
              {i < pathway.steps.length - 1 && (
                <span aria-hidden="true" className="hidden shrink-0 text-slate-700 sm:block">
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
