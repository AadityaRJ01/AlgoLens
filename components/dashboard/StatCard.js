import { DARK_CARD_PADDED } from "@/lib/theme";

// Compact stat tile — intentionally small (see AGENTS instructions: "Do NOT
// make these cards huge"). `accent` swaps the value color for the one card
// that should read as an attention signal (Weak Concepts) rather than a
// plain metric.
export default function StatCard({ label, value, hint, accent }) {
  return (
    <div className={DARK_CARD_PADDED}>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p
        className={`mt-1.5 text-2xl font-bold sm:text-3xl ${
          accent === "warning" ? "text-amber-300" : "text-neutral-50"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
