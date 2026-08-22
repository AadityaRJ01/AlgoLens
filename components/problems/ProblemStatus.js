import { STATUS_META } from "./statusMeta";

export default function ProblemStatus({ status, compact = false }) {
  const meta = STATUS_META[status] || STATUS_META.NOT_ATTEMPTED;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}>
      {meta.emoji} {meta.label}
    </span>
  );
}
