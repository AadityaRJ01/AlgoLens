// Root Cause gets its own dedicated, visually prominent treatment — a
// subtle rose/pink accent box, distinct from the plain structured text used
// for the rest of the analysis — since it's the single most important
// answer to "what specifically caused my failure?"
export default function RootCauseCard({ rootCause }) {
  return (
    <div className="rounded-lg border border-rose-400/20 bg-rose-500/[0.07] px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-300">Root Cause</p>
      <p className="mt-1 text-[15px] font-medium leading-snug text-neutral-100 whitespace-pre-wrap">{rootCause}</p>
    </div>
  );
}
