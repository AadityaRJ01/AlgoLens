"use client";

import Link from "next/link";
import { DARK_CARD_PADDED } from "@/lib/theme";
import useInView from "@/components/landing/useInView";
import EmptyState from "@/components/ui/EmptyState";

const BAR_TONE = {
  WEAK: "from-rose-500 to-orange-400",
  DEVELOPING: "from-amber-500 to-blue-500",
  STRONG: "from-emerald-500 to-blue-500",
  NEUTRAL: "from-blue-500 to-indigo-500",
};

// Plain-text status line (not a pill) so a mastery row communicates more
// than a bare percentage without adding visual weight — see AGENTS.md
// dashboard refinement #5 ("Needs attention" / "Improving" / ...).
const STATUS_LABEL = {
  WEAK: { text: "Needs attention", tone: "text-amber-400" },
  DEVELOPING: { text: "Improving", tone: "text-blue-400" },
  STRONG: { text: "Strong", tone: "text-emerald-400" },
  NEUTRAL: { text: "Developing", tone: "text-neutral-500" },
};

function TrendBadge({ trend }) {
  if (!trend) return null;
  const isUp = trend.direction === "up";
  return (
    <span className={`text-xs font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
      {isUp ? "↑" : "↓"} {Math.round(trend.deltaPoints)}%
    </span>
  );
}

function ConceptRow({ concept, masteryScore, status, trend, isInView, delay }) {
  const statusLabel = STATUS_LABEL[status] || STATUS_LABEL.NEUTRAL;
  return (
    <Link
      href="/mastery"
      className="group block rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-white/[0.04]"
    >
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-neutral-200">{concept}</p>
          <p className={`text-xs font-medium ${statusLabel.tone}`}>{statusLabel.text}</p>
        </div>
        <span className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-semibold text-neutral-100">{masteryScore}%</span>
          <TrendBadge trend={trend} />
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${BAR_TONE[status] || BAR_TONE.NEUTRAL} transition-[width] duration-1000 ease-out`}
          style={{ width: isInView ? `${masteryScore}%` : "0%", transitionDelay: `${delay}ms` }}
        />
      </div>
    </Link>
  );
}

// "Your Concept Mastery" — section 7. `masteryList` is real ConceptMastery
// data (weakest-first, see lib/dashboard.js), never mocked.
export default function ConceptMasterySection({ masteryList }) {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section className={DARK_CARD_PADDED}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-neutral-50">Your Concept Mastery</h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            See where you are strong — and where you need to improve.
          </p>
        </div>
        <Link href="/mastery" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
          View all →
        </Link>
      </div>

      {masteryList.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            tone="dark"
            message="Complete a few Micro-Proofs to build your learning profile."
            actionHref="/concepts"
            actionLabel="Extract a concept"
          />
        </div>
      ) : (
        <div ref={ref} className="mt-4 space-y-3">
          {masteryList.map((m, i) => (
            <ConceptRow key={m.concept} {...m} isInView={isInView} delay={i * 90} />
          ))}
        </div>
      )}
    </section>
  );
}
