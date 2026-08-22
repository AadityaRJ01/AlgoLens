import { AlertIcon } from "@/components/icons";

// Real per-concept root-cause text pulled straight from FailureAnalysis
// rows (Phase 4, the Analyze page's own output) — see getConceptDetail in
// lib/masteryInsights.js. Never generic/fabricated bullets.
export default function CommonMistakes({ mistakes, submissionCount }) {
  if (mistakes.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-400/90">Common Mistakes</p>
        <p className="mt-1.5 text-sm text-neutral-500">No failure analyses for this concept yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-400/90">Common Mistakes</p>
        <span className="text-[11px] text-neutral-600">Detected across {submissionCount} recent submission{submissionCount === 1 ? "" : "s"}</span>
      </div>
      <ul className="mt-1.5 space-y-1.5">
        {mistakes.map((m) => (
          <li key={m.id} className="flex items-start gap-2 text-sm text-neutral-300">
            <AlertIcon width={14} height={14} className="mt-0.5 shrink-0 text-rose-400/80" />
            {m.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
