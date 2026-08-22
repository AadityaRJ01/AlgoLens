import { TIER_META } from "./statusTier";

// "Why are you revising this?" — real text built in lib/revisionInsights.js
// from the user's own FailureAnalysis root causes / revision-schedule
// status / mastery score (see buildReason). Never a generic placeholder.
// `tier` (see statusTier.js) drives the small colored indicator dot so the
// reason reads with the same semantic color as the rest of the card.
export default function RevisionReason({ reason, tier, compact = false }) {
  const dotClass = tier ? TIER_META[tier].dotClass : "bg-neutral-500";

  if (compact) {
    return (
      <p className="flex items-start gap-1.5 text-xs text-neutral-400">
        <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
        <span className="line-clamp-2">{reason}</span>
      </p>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Why are you revising this?</p>
      <p className="mt-1 flex items-start gap-1.5 text-sm leading-snug text-neutral-300">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
        <span className="italic">&ldquo;{reason}&rdquo;</span>
      </p>
    </div>
  );
}
