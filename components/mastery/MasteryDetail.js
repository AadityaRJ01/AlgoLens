import { DARK_CARD_PADDED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import MasteryBreakdown from "./MasteryBreakdown";
import CommonMistakes from "./CommonMistakes";
import ConceptSignals from "./ConceptSignals";
import MasteryChart from "./MasteryChart";
import RecommendedImprovement from "./RecommendedImprovement";

const STATUS_HEADING = { WEAK: "Needs Attention", DEVELOPING: "Improving", STRONG: "Strong" };

function supportingLine(mastery, weakestSubconcept) {
  if (mastery.status === "STRONG") return "You have a solid handle on this concept.";
  const lead = mastery.status === "DEVELOPING" ? "Your understanding is improving," : "This concept still needs deliberate practice,";
  const weakPhrase = weakestSubconcept ? `${weakestSubconcept.name.toLowerCase()} remains a weak area.` : "keep practicing.";
  return `${lead} but ${weakPhrase}`;
}

// Orchestrates the "concept detail" view as a stack of sibling cards — the
// same pattern used elsewhere in AlgoLens (dashboard sections, Analyze
// panels) rather than one giant nested card. `detail` is real data from
// getConceptDetail in lib/masteryInsights.js; `breakdown` is the isolated
// mock sub-concept split (lib/mockSubconcepts.js). ConceptSignals reuses
// the dashboard's LearningSignalsList, which already renders its own card,
// so it isn't wrapped again here.
export default function MasteryDetail({ detail, breakdown }) {
  const { mastery } = detail;
  const weakestSubconcept = breakdown.reduce((min, item) => (item.score < min.score ? item : min), breakdown[0]);

  return (
    <div className="space-y-4">
      <div className={DARK_CARD_PADDED}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-slate-50">{mastery.concept}</h2>
          <Badge status={mastery.status} tone="dark">
            {mastery.masteryScore}% — {STATUS_HEADING[mastery.status] || mastery.status}
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-slate-400">{supportingLine(mastery, weakestSubconcept)}</p>

        <div className="mt-4 border-t border-slate-800 pt-4">
          <MasteryBreakdown breakdown={breakdown} />
        </div>

        <div className="mt-4 border-t border-slate-800 pt-4">
          <CommonMistakes mistakes={detail.commonMistakes} submissionCount={detail.mistakesSubmissionCount} />
        </div>
      </div>

      <ConceptSignals events={detail.recentSignals} />

      <div className={DARK_CARD_PADDED}>
        <MasteryChart data={detail.progressChart} />
      </div>

      <div className={DARK_CARD_PADDED}>
        <RecommendedImprovement
          concept={mastery.concept}
          weakestSubconcept={weakestSubconcept}
          recommendation={detail.recommendation}
          hasRevisionSchedule={detail.hasRevisionSchedule}
        />
      </div>
    </div>
  );
}
