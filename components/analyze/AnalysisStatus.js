"use client";

import { useEffect, useState } from "react";

const STAGES = [
  "Checking correctness",
  "Finding failure",
  "Identifying concept",
  "Updating mastery",
  "Generating recommendation",
];

// Cosmetic staged-progress readout shown while the real (single) POST
// /api/failures/analyze request is in flight. The request itself isn't
// staged server-side — this just paces through the stages of what that one
// call actually does (diagnose -> extract concept -> recalc mastery),
// capping at the last stage until the real response returns, so it never
// implies a stage completed before the request actually did.
export default function AnalysisStatus() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Deferred a frame (rather than called synchronously here) so this
      // doesn't trigger a same-effect cascading render.
      const frame = requestAnimationFrame(() => setStageIndex(STAGES.length - 1));
      return () => cancelAnimationFrame(frame);
    }

    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
      <p className="text-sm font-medium text-slate-200">Analyzing your solution…</p>
      <ol className="flex flex-col items-start gap-1.5">
        {STAGES.map((stage, i) => {
          const marker = i < stageIndex ? "✓" : i === stageIndex ? "●" : "○";
          return (
            <li
              key={stage}
              className={`flex items-center gap-2 text-xs transition-colors ${
                i < stageIndex ? "text-slate-500" : i === stageIndex ? "font-medium text-indigo-300" : "text-slate-700"
              }`}
            >
              <span aria-hidden="true" className={i < stageIndex ? "text-emerald-400" : ""}>
                {marker}
              </span>
              {stage}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
