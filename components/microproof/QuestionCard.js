import { DARK_CARD_PADDED } from "@/lib/theme";

// The real Micro-Proof question, generated once at concept-extraction time
// (Phase 5, POST /api/concepts/extract) and never fabricated or rewritten
// here.
export default function QuestionCard({ question }) {
  return (
    <div className={`${DARK_CARD_PADDED} ring-1 ring-inset ring-indigo-400/10`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400/90">Prove Your Understanding</p>
      <p className="mt-2 text-base font-medium leading-relaxed text-slate-100 whitespace-pre-wrap">{question}</p>
    </div>
  );
}
