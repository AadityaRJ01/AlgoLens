"use client";

import { useState } from "react";
import Link from "next/link";
import { DARK_DIFFICULTY_STYLES, DARK_BTN_SECONDARY } from "@/lib/theme";
import { BookmarkIcon, CheckIcon } from "@/components/icons";
import ProblemStatus from "./ProblemStatus";
import ProblemInsight from "./ProblemInsight";
import ProblemProgress from "./ProblemProgress";

// One problem row. Hover reveals a small AlgoLens insight (CSS-only);
// clicking the row expands full "Problem Details" (real progress + real
// learning signal + a recommended action that reuses the correct existing
// route — /failures/[id], /concepts/[id], or the external LeetCode URL —
// never a new/duplicated solve flow).
export default function ProblemRow({ problem, isBookmarked, onToggleBookmark }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const recommendedAction = problem.latestFailedSubmissionId
    ? { label: "Analyze Previous Attempt →", href: `/failures/${problem.latestFailedSubmissionId}` }
    : problem.latestAcceptedSubmissionId
    ? { label: "View in Micro-Proofs →", href: `/concepts/${problem.latestAcceptedSubmissionId}` }
    : { label: "Solve →", href: problem.url, external: true };

  return (
    <li className="group/row border-b border-white/5 last:border-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsExpanded((v) => !v)}
        className="flex cursor-pointer flex-col gap-2 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(problem.id);
              }}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this problem"}
              aria-pressed={isBookmarked}
              className="shrink-0 text-neutral-600 transition-colors hover:text-amber-300"
            >
              <BookmarkIcon
                width={15}
                height={15}
                fill={isBookmarked ? "currentColor" : "none"}
                className={isBookmarked ? "text-amber-400" : ""}
              />
            </button>
            {problem.isSolved ? (
              <CheckIcon width={14} height={14} className="shrink-0 text-emerald-400" />
            ) : (
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/15" />
            )}
            <span className="truncate text-sm font-medium text-neutral-100">{problem.title}</span>
            <span className={`shrink-0 text-xs font-semibold ${DARK_DIFFICULTY_STYLES[problem.difficulty] || "text-neutral-400"}`}>
              {problem.difficulty}
            </span>
            {problem.isRecommended && (
              <span className="shrink-0 rounded-full border border-blue-400/25 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                Recommended
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 pl-[3.375rem] sm:pl-[3.375rem]">
            {problem.topicTags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-neutral-500">
                {tag}
              </span>
            ))}
          </div>

          {/* Hover-only mini insight preview — CSS-only reveal. */}
          {problem.insight && (
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-hover/row:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <p className="mt-1.5 pl-[3.375rem] text-xs italic leading-snug text-purple-300/80">{problem.insight}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 pl-[3.375rem] sm:pl-0">
          <ProblemStatus status={problem.status} />
          {problem.masteryScore !== null && <span className="text-xs text-neutral-500">{problem.masteryScore}%</span>}
          {problem.lastAttempted && <span className="hidden text-xs text-neutral-600 md:inline">{problem.lastAttempted}</span>}
          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Solve →
            </a>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t border-white/5 bg-white/[0.02] px-4 py-3.5 sm:px-5">
          <ProblemProgress problem={problem} />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400/90">Learning Signal</p>
            <p className="mt-1 text-sm text-neutral-300">
              {problem.learningSignal || "No failure history recorded for this concept yet."}
            </p>
          </div>

          <div>
            {recommendedAction.external ? (
              <a
                href={recommendedAction.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={DARK_BTN_SECONDARY}
              >
                {recommendedAction.label}
              </a>
            ) : (
              <Link href={recommendedAction.href} onClick={(e) => e.stopPropagation()} className={DARK_BTN_SECONDARY}>
                {recommendedAction.label}
              </Link>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
