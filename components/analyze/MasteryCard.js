// Real ConceptMastery score (+ optional real trend, see buildConceptTrends
// in lib/dashboard.js, or the server-computed before/after from a fresh
// Micro-Proof evaluation) for the concept this analysis is about. Never
// shown with a fabricated number — `mastery` is null (rendered as "not
// enough evidence yet") whenever there's no ConceptMastery row for this
// concept.
export default function MasteryCard({ mastery }) {
  if (!mastery || mastery.score === null) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-400/90">Concept Mastery</p>
        <p className="mt-1.5 text-sm text-slate-500">Not enough evidence yet.</p>
      </div>
    );
  }

  const { score, trend } = mastery;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-400/90">Concept Mastery</p>
      <p className="mt-1 text-2xl font-bold text-slate-50">{score}%</p>
      {trend && (
        <p className={`mt-0.5 text-xs font-medium ${trend.direction === "up" ? "text-emerald-400" : "text-rose-400"}`}>
          {trend.direction === "up" ? "↑" : "↓"} {Math.round(trend.deltaPoints)}%{" "}
          <span className="text-slate-500">recent performance</span>
        </p>
      )}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
