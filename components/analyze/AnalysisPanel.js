import { DARK_CARD_PADDED, DARK_BTN_SECONDARY } from "@/lib/theme";
import AnalysisStatus from "./AnalysisStatus";
import RootCauseCard from "./RootCauseCard";
import MasteryCard from "./MasteryCard";
import MicroProofCard from "./MicroProofCard";
import RecommendationCard from "./RecommendationCard";
import { CheckIcon } from "@/components/icons";

// Plain structured section (label + text), separated by a thin top divider
// — the "one clean list, not one giant paragraph" treatment every field in
// the result state uses except Root Cause (which gets its own accented
// RootCauseCard). `labelTone` lets specific sections (e.g. "Concept") pick
// up the AI/Concept purple accent instead of the neutral default.
function Section({ label, value, divider = true, labelTone = "text-slate-500" }) {
  if (!value) return null;
  return (
    <div className={divider ? "border-t border-slate-800 pt-3.5" : ""}>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${labelTone}`}>{label}</p>
      <p className="mt-1 text-sm text-slate-200 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

const AI_ANALYSIS_LABEL_TONE = "text-indigo-400/90";
const CONCEPT_LABEL_TONE = "text-purple-400/90";

const EMPTY_STATE_POINTS = [
  { label: "Root cause", tone: "text-rose-400" },
  { label: "Missing concept", tone: "text-purple-400" },
  { label: "Mastery impact", tone: "text-blue-400" },
  { label: "What to practice next", tone: "text-emerald-400" },
];

// RIGHT panel. Structured, section-by-section — never one large AI
// paragraph. Every field here comes straight from the real
// FailureAnalysis/Concept/ConceptMastery/Recommendation/MicroProof rows
// passed down from app/analyze/page.js and AnalyzeWorkspace.js; this
// component only arranges them.
export default function AnalysisPanel({
  canAnalyze,
  isAccepted,
  isAnalyzing,
  error,
  onRetry,
  analysis,
  mastery,
  microProof,
  onMicroProofEvaluated,
  recommendation,
  successConcept,
}) {
  if (isAnalyzing) {
    return (
      <div className={DARK_CARD_PADDED}>
        <AnalysisStatus />
      </div>
    );
  }

  if (error) {
    return (
      <div className={DARK_CARD_PADDED}>
        <div className="rounded-lg border border-rose-400/20 bg-rose-500/[0.07] p-4 text-center">
          <p className="text-sm font-medium text-rose-300">Unable to analyze your solution right now.</p>
          <button onClick={onRetry} className={`mt-3 ${DARK_BTN_SECONDARY}`}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className={`${DARK_CARD_PADDED} space-y-3.5`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${AI_ANALYSIS_LABEL_TONE}`}>AI Analysis</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
          ✓ Correct Solution
        </span>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/90">What You Did Well</p>
          <ul className="mt-1.5 space-y-1">
            {["Correct approach", "Correct state/logic", "Handles edge cases"].map((point) => (
              <li key={point} className="flex items-start gap-1.5 text-sm text-slate-300">
                <CheckIcon width={14} height={14} className="mt-0.5 shrink-0 text-emerald-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {successConcept && <Section label="Concept" value={successConcept.name} labelTone={CONCEPT_LABEL_TONE} />}

        <div className="border-t border-slate-800 pt-3.5">
          <MasteryCard mastery={mastery} />
        </div>

        <div className="border-t border-slate-800 pt-3.5">
          <MicroProofCard microProof={microProof} onEvaluated={onMicroProofEvaluated} />
        </div>

        <div className="border-t border-slate-800 pt-3.5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next Challenge</p>
          <RecommendationCard recommendation={recommendation} />
        </div>
      </div>
    );
  }

  if (!canAnalyze) {
    return (
      <div className={DARK_CARD_PADDED}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${AI_ANALYSIS_LABEL_TONE}`}>AI Analysis</p>
        <p className="mt-2 text-sm text-slate-500">
          AlgoLens currently diagnoses Wrong Answer, Time Limit Exceeded, and Memory Limit Exceeded submissions.
          This submission&apos;s verdict isn&apos;t one of those, so there&apos;s nothing to analyze here.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={DARK_CARD_PADDED}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${AI_ANALYSIS_LABEL_TONE}`}>AI Analysis</p>
        <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-50">
          Understand your mistake,
          <br />
          not just your output.
        </h2>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">AlgoLens will identify:</p>
        <ul className="mt-2 space-y-1.5">
          {EMPTY_STATE_POINTS.map((point) => (
            <li key={point.label} className="flex items-center gap-2 text-sm text-slate-300">
              <CheckIcon width={14} height={14} className={`shrink-0 ${point.tone}`} />
              {point.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`${DARK_CARD_PADDED} space-y-3.5`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wide ${AI_ANALYSIS_LABEL_TONE}`}>AI Analysis</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
          ✕ Incorrect Solution
        </span>
      </div>

      <RootCauseCard rootCause={analysis.rootCause} />

      <Section label="Your Mistake" value={analysis.evidence} />
      <Section label="Concept" value={analysis.concept} labelTone={CONCEPT_LABEL_TONE} />

      <div className="border-t border-slate-800 pt-3.5">
        <MasteryCard mastery={mastery} />
      </div>

      <Section label="What You Should Understand" value={analysis.preventionRule} />

      <div className="border-t border-slate-800 pt-3.5">
        <MicroProofCard microProof={microProof} onEvaluated={onMicroProofEvaluated} />
      </div>

      <div className="border-t border-slate-800 pt-3.5">
        <RecommendationCard recommendation={recommendation} />
      </div>

      <p className="border-t border-slate-800 pt-3 text-[11px] text-slate-600">Diagnosed by {analysis.aiModel}</p>
    </div>
  );
}
