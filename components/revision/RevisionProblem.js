import { DARK_CARD_PADDED } from "@/lib/theme";
import RecommendationCard from "@/components/analyze/RecommendationCard";

// "Now Apply It" — reuses the real Recommendation data + the same card the
// Analyze and Mastery pages already use, instead of duplicating the
// problem-title/difficulty/reason/CTA markup a third time.
export default function RevisionProblem({ recommendation }) {
  return (
    <div className={DARK_CARD_PADDED}>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90">Now Apply It</p>
      <div className="mt-2">
        <RecommendationCard recommendation={recommendation} />
      </div>
    </div>
  );
}
