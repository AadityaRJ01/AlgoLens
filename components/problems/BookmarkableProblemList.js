"use client";

import { useMemo, useState } from "react";
import { DARK_CARD } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";
import ProblemRow from "./ProblemRow";
import useBookmarks from "./useBookmarks";

// Owns the one genuinely client-only piece of this page: bookmarks
// (localStorage — see useBookmarks.js, there's no Bookmark table in the
// schema). Everything else (search/difficulty/topic/status) is server-
// filtered before `problems` ever reaches this component.
export default function BookmarkableProblemList({ problems }) {
  const { bookmarkedIds, isHydrated, toggle } = useBookmarks();
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const visible = useMemo(
    () => (showBookmarkedOnly ? problems.filter((p) => bookmarkedIds.has(p.id)) : problems),
    [problems, showBookmarkedOnly, bookmarkedIds]
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setShowBookmarkedOnly((v) => !v)}
        disabled={!isHydrated}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          showBookmarkedOnly
            ? "border-amber-400/40 bg-amber-500/10 text-amber-300"
            : "border-slate-800 text-slate-400 hover:text-slate-100"
        }`}
      >
        🔖 Bookmarked{isHydrated && bookmarkedIds.size > 0 ? ` (${bookmarkedIds.size})` : ""}
      </button>

      {visible.length === 0 ? (
        <EmptyState
          tone="dark"
          message={
            showBookmarkedOnly
              ? "No bookmarked problems on this page yet — bookmark one with the flag icon."
              : "No problems found. Try another search or adjust your filters."
          }
        />
      ) : (
        <div className={`${DARK_CARD} overflow-hidden`}>
          <ul>
            {visible.map((problem) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                isBookmarked={bookmarkedIds.has(problem.id)}
                onToggleBookmark={toggle}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
