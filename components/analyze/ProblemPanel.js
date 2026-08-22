import Link from "next/link";
import { DARK_CARD_PADDED, DARK_DIFFICULTY_STYLES } from "@/lib/theme";
import { parseProblemStatement } from "./parseProblemStatement";
import { topicTagClass } from "./topicTagColors";

const VERDICT_TONE = {
  Accepted: "text-emerald-400",
};

function verdictTone(verdict) {
  return VERDICT_TONE[verdict] || "text-rose-400";
}

// LEFT panel — problem context. `description` is the real LeetCode problem
// statement (lib/leetcode.js fetchProblemDescription, best-effort/nullable),
// split into Description/Examples/Constraints via parseProblemStatement.js
// so it doesn't dominate the panel. The submission's verdict is explicitly
// labeled "Last submission" — it's LeetCode's historical judge result, not
// AlgoLens's current AI analysis state, which only appears on the right
// after the user clicks Analyze Solution.
export default function ProblemPanel({ submission, description, recentSubmissions }) {
  const { problem } = submission;
  const { description: desc, examples, constraints } = parseProblemStatement(description);

  return (
    <div className="space-y-4">
      <div className={DARK_CARD_PADDED}>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400/90">Problem</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold text-neutral-50">{problem.title}</h2>
          <span className={`text-sm font-semibold ${DARK_DIFFICULTY_STYLES[problem.difficulty] || "text-neutral-400"}`}>
            {problem.difficulty}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {problem.topicTags.map((tag) => (
            <span key={tag} className={`rounded-full border px-2 py-0.5 text-xs ${topicTagClass(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 border-t border-white/10 pt-3 text-xs">
          <span className="text-neutral-500">Last submission: </span>
          <span className={`font-semibold ${verdictTone(submission.verdict)}`}>{submission.verdict}</span>
          <span className="mx-1.5 text-neutral-700">·</span>
          <span className="text-blue-400/70">{submission.language}</span>
          <span className="mx-1.5 text-neutral-700">·</span>
          <span className="text-neutral-500">{new Date(submission.timestamp).toLocaleDateString()}</span>
        </div>

        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
          {desc && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Description</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">{desc}</p>
            </div>
          )}

          {examples.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-400/80">Examples</p>
              <div className="mt-1 space-y-1">
                {examples.map((example, i) => (
                  <details key={i} className="rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5" open={i === 0}>
                    <summary className="cursor-pointer text-xs font-medium text-neutral-300">▸ Example {i + 1}</summary>
                    <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-neutral-400">{example}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {constraints && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/80">Constraints</p>
              <details className="mt-1 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5">
                <summary className="cursor-pointer text-xs font-medium text-neutral-300">▸ Show constraints</summary>
                <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-neutral-400">{constraints}</p>
              </details>
            </div>
          )}

          {!desc && examples.length === 0 && !constraints && (
            <p className="text-xs text-neutral-500">
              Description unavailable right now — problem statements are fetched live from LeetCode.
            </p>
          )}
        </div>

        {problem.url && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block border-t border-white/10 pt-3 text-xs font-medium text-indigo-400 hover:text-indigo-300"
          >
            View on LeetCode ↗
          </a>
        )}
      </div>

      {recentSubmissions.length > 1 && (
        <div className={DARK_CARD_PADDED}>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recent Submissions</p>
          <ul className="mt-2 space-y-1">
            {recentSubmissions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/analyze?submission=${s.id}`}
                  className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                    s.isSelected ? "bg-indigo-500/10 text-neutral-50 ring-1 ring-inset ring-indigo-400/25" : "text-neutral-400 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{s.title}</span>
                  <span className={`shrink-0 text-[11px] font-medium ${verdictTone(s.verdict)}`}>{s.verdict}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
