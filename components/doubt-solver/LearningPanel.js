import { DARK_CARD_PADDED, DARK_DIFFICULTY_STYLES } from "@/lib/theme";

// The real hint-progression system has 4 levels (see HINT_LEVELS in
// lib/groq.js: concept -> approach -> implementation -> full explanation),
// not 3 — 3 is only where the *solution gate* unlocks (a separate, parallel
// condition). The counter must be measured against the real max (4) so it
// can never show an impossible ratio like "4 / 3".
const MAX_HINT_LEVEL = 4;

// RIGHT pane — a read-only summary of state already tracked elsewhere
// (selectedProblem, masteryContext from the real personalization lookup in
// lib/doubtSolverContext.js, currentLevel). No new state or requests.
//
// Target Concept prefers the real, mastery-linked concept name
// (masteryContext.concept) when one exists, and otherwise falls back to the
// problem's own primary topic tag — the same real signal
// lib/doubtSolverContext.js itself uses to look up mastery in the first
// place — rather than showing nothing just because this concept doesn't
// have tracked mastery data yet.
export default function LearningPanel({ selectedProblem, masteryContext, currentLevel }) {
  const topicTags = selectedProblem?.topicTags || [];
  const targetConcept = masteryContext?.concept || topicTags[0] || null;

  return (
    <div className="space-y-4">
      <div className={DARK_CARD_PADDED}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your Session</p>
        <dl className="mt-3 space-y-2.5 text-sm">
          <Row label="Difficulty">
            {selectedProblem?.difficulty ? (
              <span className={`font-medium ${DARK_DIFFICULTY_STYLES[selectedProblem.difficulty] || "text-slate-300"}`}>
                {selectedProblem.difficulty}
              </span>
            ) : (
              <span className="text-slate-600">—</span>
            )}
          </Row>
          <Row label="Topic">
            <span className="text-slate-300">{topicTags.length ? topicTags.slice(0, 3).join(" / ") : "—"}</span>
          </Row>
          <Row label="Target Concept">
            {targetConcept ? (
              <span className="font-medium text-violet-300">{targetConcept}</span>
            ) : (
              <span className="text-slate-600">—</span>
            )}
          </Row>
          <Row label="Hint Counter">
            <span className="font-medium text-slate-200">{currentLevel} / {MAX_HINT_LEVEL}</span>
          </Row>
        </dl>

        {masteryContext && (
          <div className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-500">
            Mastery: <span className="font-medium text-slate-300">{masteryContext.masteryScore}%</span>
            <span className="mx-1.5 text-slate-700">·</span>
            Related failures: <span className="font-medium text-slate-300">{masteryContext.failureCount}</span>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-violet-400/20 bg-slate-900/60 p-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-transparent"
        />
        <p className="relative text-xs font-semibold uppercase tracking-wide text-violet-300">Learn, Don&apos;t Just Copy</p>
        <p className="relative mt-1.5 text-sm leading-relaxed text-slate-400">
          Hints escalate one level at a time so you stay in the driver&apos;s seat. The full
          solution only unlocks after three real attempts to reason it out yourself.
        </p>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
