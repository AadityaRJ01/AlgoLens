import Link from "next/link";
import { DARK_CARD_PADDED } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";

// Signal presentation config, keyed by the real event `type` emitted by
// lib/dashboard.js's buildRecentActivity — every entry rendered here is a
// real stored event, never mocked. MASTERY events additionally branch on
// the real `status` field so a mastery update reads as WEAK CONCEPT /
// IMPROVED / MASTERED rather than one generic label.
const TONE = {
  rose: { dot: "bg-rose-400", text: "text-rose-400" },
  emerald: { dot: "bg-emerald-400", text: "text-emerald-400" },
  amber: { dot: "bg-amber-400", text: "text-amber-400" },
  blue: { dot: "bg-blue-400", text: "text-blue-400" },
  indigo: { dot: "bg-indigo-400", text: "text-indigo-400" },
};

function signalMeta(event) {
  switch (event.type) {
    case "FAILURE":
      return { tag: "FAILED", tone: TONE.rose };
    case "SOLVED":
      return { tag: "SOLVED", tone: TONE.emerald };
    case "MICROPROOF":
      return { tag: "MICRO-PROOF", tone: TONE.indigo };
    case "REVISION":
      return { tag: "REVISED", tone: TONE.blue };
    case "MASTERY":
      if (event.status === "WEAK") return { tag: "WEAK CONCEPT", tone: TONE.amber };
      if (event.status === "STRONG") return { tag: "MASTERED", tone: TONE.emerald };
      return { tag: "IMPROVED", tone: TONE.blue };
    default:
      return { tag: event.type, tone: TONE.indigo };
  }
}

function SignalRow({ event }) {
  const { tag, tone } = signalMeta(event);
  return (
    <li className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="mt-1.5 shrink-0">
        <span className={`block h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold tracking-wide ${tone.text}`}>{tag}</span>
        </div>
        <p className="truncate text-sm text-slate-200">{event.label}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {event.detail}
          {event.date && <> · {new Date(event.date).toLocaleDateString()}</>}
        </p>
      </div>
    </li>
  );
}

// "Recent Learning Signals" — the core AlgoLens philosophy made visible:
// every attempt (pass or fail) becomes a labeled signal. `events` is
// pre-sliced by the caller (dashboard shows the latest 5; /activity shows
// the full history).
export default function LearningSignalsList({ events, title = "Recent Learning Signals", hideViewAll = false }) {
  return (
    <section className={DARK_CARD_PADDED}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-50">{title}</h2>
        {!hideViewAll && (
          <Link href="/activity" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="mt-4">
          <EmptyState tone="dark" message="No activity yet. Solve a problem or complete a Micro-Proof to get started." />
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-white/5">
          {events.map((event, i) => (
            <SignalRow key={i} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
}
