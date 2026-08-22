import Link from "next/link";
import { DARK_CARD_PADDED, DARK_BTN_SECONDARY } from "@/lib/theme";
import RevisionReason from "./RevisionReason";
import { getStatusTier, TIER_META } from "./statusTier";

// The fuller prioritized list — same real, ranked items as
// RevisionPriorityCard (just every urgent concept, compactly), each showing
// its specific weak sub-area (mock, see lib/mockSubconcepts.js — no
// sub-concept schema exists) and real pending-recommendation count, colored
// by the same 4-tier semantic system (see statusTier.js).
export default function RevisionQueue({ items }) {
  return (
    <div className={DARK_CARD_PADDED}>
      <h2 className="text-base font-semibold text-slate-50">Revision Queue</h2>

      <ul className="mt-3 divide-y divide-white/5">
        {items.map((item) => {
          const tier = getStatusTier(item);
          const meta = TIER_META[tier];
          return (
            <li key={item.concept} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100">
                  <span aria-hidden="true" className="mr-1.5">{meta.dot}</span>
                  {item.concept}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{item.weakestSubarea}</p>
                <div className="mt-1">
                  <RevisionReason reason={item.reason} tier={tier} compact />
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                <span className={`text-xs font-semibold ${meta.text}`}>{meta.queueLabel}</span>
                <span className="text-xs text-slate-500">
                  {item.masteryScore}%{item.recommendedProblemCount > 0 ? ` · ${item.recommendedProblemCount} problem${item.recommendedProblemCount === 1 ? "" : "s"}` : ""}
                </span>
                {item.hasRevisionSchedule ? (
                  <Link href={`/revision/${encodeURIComponent(item.concept)}`} className={DARK_BTN_SECONDARY}>
                    Start Revision →
                  </Link>
                ) : (
                  <Link href="/concepts" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                    Unlock revision
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
