import Link from "next/link";
import { DARK_BTN_PRIMARY, DARK_BTN_SECONDARY } from "@/lib/theme";

// Only real, existing destinations: Try Again re-opens the composer
// in-place; /mastery and /revision/[concept] are existing routes — the
// revision link only appears once the evaluate response actually included
// a `revision` object (i.e. a real RevisionSchedule now exists for this
// concept; /revision/[concept] 404s otherwise).
export default function NextActions({ onTryAgain, concept, hasRevisionSchedule }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={onTryAgain} className={DARK_BTN_SECONDARY}>
        Try Again
      </button>
      {hasRevisionSchedule && (
        <Link href={`/revision/${encodeURIComponent(concept)}`} className={DARK_BTN_PRIMARY}>
          Continue to Revision →
        </Link>
      )}
      <Link href="/mastery" className={DARK_BTN_SECONDARY}>
        View Mastery →
      </Link>
    </div>
  );
}
