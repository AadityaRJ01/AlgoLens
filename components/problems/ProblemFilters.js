import Link from "next/link";
import { DIFFICULTIES, TOPICS } from "@/lib/problemsInsights";

const STATUS_OPTIONS = [
  { id: null, label: "All" },
  { id: "recommended", label: "🔵 Recommended" },
  { id: "weak", label: "🔴 Weak Areas" },
  { id: "solved", label: "🟢 Solved" },
];

function buildHref(current, overrides) {
  const next = { ...current, ...overrides };
  const sp = new URLSearchParams();
  if (next.q) sp.set("q", next.q);
  if (next.difficulty) sp.set("difficulty", next.difficulty);
  if (next.topic) sp.set("topic", next.topic);
  if (next.status) sp.set("status", next.status);
  const qs = sp.toString();
  return qs ? `/problems?${qs}` : "/problems";
}

// Real server-driven filters (URL params, plain links — no client JS
// needed), matching the pattern the original /problems page already used
// for difficulty. Status options read from lib/problemsInsights.js's
// getProblemsListData, which itself reads real ConceptMastery/Recommendation
// data — nothing here duplicates that logic.
export default function ProblemFilters({ current }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.label}
            href={buildHref(current, { status: opt.id })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              current.status === opt.id
                ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300"
                : "border-slate-800 text-slate-400 hover:text-slate-100"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Link
          href={buildHref(current, { difficulty: null })}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            !current.difficulty ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300" : "border-slate-800 text-slate-400 hover:text-slate-100"
          }`}
        >
          All
        </Link>
        {DIFFICULTIES.map((d) => (
          <Link
            key={d}
            href={buildHref(current, { difficulty: current.difficulty === d ? null : d })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              current.difficulty === d
                ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300"
                : "border-slate-800 text-slate-400 hover:text-slate-100"
            }`}
          >
            {d}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 overflow-x-auto">
        <Link
          href={buildHref(current, { topic: null })}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            !current.topic ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300" : "border-slate-800 text-slate-400 hover:text-slate-100"
          }`}
        >
          All Topics
        </Link>
        {TOPICS.map((t) => (
          <Link
            key={t}
            href={buildHref(current, { topic: current.topic === t ? null : t })}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              current.topic === t
                ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300"
                : "border-slate-800 text-slate-400 hover:text-slate-100"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}
