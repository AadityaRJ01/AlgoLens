import Link from "next/link";
import { DARK_CARD_PADDED, DARK_BTN_PRIMARY, DARK_BTN_SECONDARY } from "@/lib/theme";
import RevisionReason from "./RevisionReason";
import MasteryTrend from "./MasteryTrend";
import { getStatusTier, TIER_META } from "./statusTier";

// A prominent "Needs Revision" card for one of the top-priority concepts —
// priority/status come straight from lib/revisionInsights.js (itself reading
// rankConceptsByUrgency + ConceptMastery.status), never recomputed here.
// Status is deliberately the most visually prominent element — bigger and
// higher up than the "last practiced" date, per AGENTS.md's color pass.
export default function RevisionPriorityCard({ item }) {
  const tier = getStatusTier(item);
  const meta = TIER_META[tier];

  return (
    <div className={`${DARK_CARD_PADDED} border-l-2 ${meta.borderLeft}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-slate-50">
            <span aria-hidden="true">{meta.dot}</span>
            {item.concept}
          </h3>
          <div className="mt-1">
            <MasteryTrend masteryScore={item.masteryScore} trend={item.trend} tier={tier} />
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`} style={{ width: `${item.masteryScore}%` }} />
      </div>

      <p className="mt-2 text-xs text-slate-500">Last practiced: {item.lastPracticed}</p>

      <div className="mt-3 border-t border-slate-800 pt-3">
        <RevisionReason reason={item.reason} tier={tier} />
      </div>

      <div className="mt-4">
        {item.hasRevisionSchedule ? (
          <Link href={`/revision/${encodeURIComponent(item.concept)}`} className={DARK_BTN_PRIMARY}>
            Start Revision →
          </Link>
        ) : (
          <Link href="/concepts" className={DARK_BTN_SECONDARY}>
            Answer a Micro-Proof to unlock revision
          </Link>
        )}
      </div>
    </div>
  );
}
