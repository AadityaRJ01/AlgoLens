import { DARK_CARD_PADDED } from "@/lib/theme";

// Real counts (signals analyzed = every FailureAnalysis + MicroProofAttempt
// on record; active focus gaps = concepts with WEAK status) plus one
// transparent, real-data-derived proxy for "confidence": the share of the
// user's concept profile actually backed by evidence (a Micro-Proof attempt
// or a solved problem), not a fabricated ML confidence score — see
// getRecommendationEngineData in lib/recommendationsInsights.js.
export default function EngineStatusBar({ stats }) {
  return (
    <div className={`${DARK_CARD_PADDED} flex flex-wrap items-center gap-x-6 gap-y-2`}>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
        <span className="font-medium text-slate-300">Engine Active</span>
      </div>
      <Stat label="Engine Confidence" value={`${stats.confidencePercent}%`} />
      <Stat label="Signals Analyzed" value={stats.signalsAnalyzed} />
      <Stat label="Active Focus Gaps" value={stats.activeFocusGaps} tone={stats.activeFocusGaps > 0 ? "text-red-300" : undefined} />
    </div>
  );
}

function Stat({ label, value, tone = "text-slate-100" }) {
  return (
    <div className="text-xs text-slate-500">
      {label}: <span className={`font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
