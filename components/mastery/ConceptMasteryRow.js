import Link from "next/link";

const BAR_TONE = {
  WEAK: "from-rose-500 to-orange-400",
  DEVELOPING: "from-amber-500 to-blue-500",
  STRONG: "from-emerald-500 to-blue-500",
  NEUTRAL: "from-blue-500 to-indigo-500",
};

const STATUS_LABEL = {
  WEAK: { text: "Needs Attention", tone: "text-amber-400" },
  DEVELOPING: { text: "Improving", tone: "text-blue-400" },
  STRONG: { text: "Strong", tone: "text-emerald-400" },
  NEUTRAL: { text: "Developing", tone: "text-slate-500" },
};

// A single concept row — click to open its MasteryDetail (see
// app/mastery/page.js's ?concept= query param, the same navigate-via-link
// pattern already used for switching submissions on /analyze).
export default function ConceptMasteryRow({ concept, masteryScore, status, trend, isSelected }) {
  const statusLabel = STATUS_LABEL[status] || STATUS_LABEL.NEUTRAL;

  return (
    <Link
      href={`/mastery?concept=${encodeURIComponent(concept)}`}
      className={`block rounded-lg border px-3 py-2.5 transition-all ${
        isSelected
          ? "border-indigo-400/30 bg-indigo-500/[0.06]"
          : "border-transparent hover:border-violet-500/30 hover:bg-[#151D2E] hover:shadow-md hover:shadow-violet-500/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-100">{concept}</p>
          <p className={`text-xs ${statusLabel.tone}`}>
            {masteryScore}% · {statusLabel.text}
          </p>
        </div>
        {trend && (
          <span className={`shrink-0 text-xs font-medium ${trend.direction === "up" ? "text-emerald-400" : "text-rose-400"}`}>
            {trend.direction === "up" ? "↑" : "↓"} {Math.round(trend.deltaPoints)}%
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${BAR_TONE[status] || BAR_TONE.NEUTRAL}`}
          style={{ width: `${masteryScore}%` }}
        />
      </div>
    </Link>
  );
}
