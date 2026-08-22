import Link from "next/link";
import { DARK_CARD_PADDED } from "@/lib/theme";

// Real revision sessions — MicroProofAttempt rows where
// intervalDaysAfterReview is set (i.e. a revision review, not a first-time
// Micro-Proof) — see getRevisionOverview in lib/revisionInsights.js.
// Deliberately secondary/compact, per AGENTS.md.
export default function RevisionHistory({ history }) {
  if (history.length === 0) return null;

  return (
    <div className={DARK_CARD_PADDED}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-neutral-300">Recent Revision Sessions</h2>
        <Link href="/activity" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
          View all →
        </Link>
      </div>
      <ul className="mt-2.5 space-y-2">
        {history.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-neutral-300">{h.concept}</span>
            <span className="shrink-0 text-xs text-neutral-500">
              <span className={h.understanding === "weak" ? "text-amber-400" : "text-emerald-400"}>
                {h.understanding === "weak" ? "Needs another review" : "Completed"}
              </span>
              {" · "}Score {h.score}/10 · {h.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
