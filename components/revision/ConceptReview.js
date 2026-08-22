import { DARK_CARD_PADDED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";

// Step 1 of the guided revision session: concept + a short "what you need
// to remember" refresher. `coreIdea` is real — the most recently extracted
// Concept.coreIdea for this concept (Phase 5, the same text shown on
// /concepts) — falling back to an honest note when none has been extracted
// yet, never a fabricated explanation.
export default function ConceptReview({ concept, masteryScore, status, coreIdea }) {
  return (
    <div className={DARK_CARD_PADDED}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-lg font-semibold text-neutral-50">{concept}</h1>
        <Badge status={status} tone="dark">Mastery: {masteryScore}%</Badge>
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-400/90">What you need to remember</p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-300">
          {coreIdea || "Extract this concept from a solved problem to get a personalized refresher here."}
        </p>
      </div>
    </div>
  );
}
