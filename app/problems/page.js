import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCatalogProblemCount } from "@/lib/leetcodeCatalog";
import { getProblemsListData, DIFFICULTIES } from "@/lib/problemsInsights";
import { DARK_CARD, pageClass } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";
import InitCatalogButton from "@/app/recommendations/InitCatalogButton";
import ProblemSearch from "@/components/problems/ProblemSearch";
import ProblemFilters from "@/components/problems/ProblemFilters";
import BookmarkableProblemList from "@/components/problems/BookmarkableProblemList";

// The central DSA problem library — not a LeetCode mirror. Every row
// carries a real "why should I solve it" signal (see
// lib/problemsInsights.js): mastery/status from the real ConceptMastery
// engine, "Recommended" from the real, already-persisted Recommendation
// table, and a learning signal from real FailureAnalysis history. No
// business logic (mastery scoring, recommendation selection) is
// recomputed here — only read and presented.
export default async function ProblemsPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const q = (params?.q || "").trim();
  const difficulty = DIFFICULTIES.includes(params?.difficulty) ? params.difficulty : null;
  const topic = typeof params?.topic === "string" ? params.topic : null;
  const status = ["recommended", "weak", "solved"].includes(params?.status) ? params.status : null;
  const page = Math.max(1, Number(params?.page) || 1);

  const current = { q, difficulty, topic, status };

  const catalogCount = await getCatalogProblemCount();

  const data =
    catalogCount > 0 ? await getProblemsListData(userId, { q, difficulty, topic, status, page }) : null;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-50">
      <div className={pageClass("max-w-5xl")}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Problems</h1>
          <p className="mt-1 text-sm text-slate-400">
            Practice problems that strengthen the concepts you actually need to improve.
          </p>
        </div>

        {catalogCount === 0 && (
          <div className={`${DARK_CARD} p-6 space-y-3`}>
            <p className="text-sm text-slate-400">
              The global problem catalog hasn&apos;t been initialized yet, so there&apos;s no pool of problems to browse.
            </p>
            <InitCatalogButton />
          </div>
        )}

        {data && (
          <>
            <div className="space-y-3">
              <ProblemSearch current={current} />
              <ProblemFilters current={current} />
            </div>

            {data.problems.length === 0 && status === "recommended" ? (
              <EmptyState
                tone="dark"
                message="You're caught up 🎉 — your current learning signals don't have any urgent recommendations."
                actionHref="/problems"
                actionLabel="Explore Problems →"
              />
            ) : data.problems.length === 0 ? (
              <EmptyState
                tone="dark"
                message="No problems found. Try another search or adjust your filters."
                actionHref="/problems"
                actionLabel="Clear Filters"
              />
            ) : (
              <>
                <BookmarkableProblemList problems={data.problems} />

                {data.totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>
                      Page {page} of {data.totalPages} · {data.totalCount} problem{data.totalCount === 1 ? "" : "s"}
                    </span>
                    <div className="flex gap-2">
                      {page > 1 && (
                        <PageLink current={current} page={page - 1}>
                          ← Previous
                        </PageLink>
                      )}
                      {page < data.totalPages && (
                        <PageLink current={current} page={page + 1}>
                          Next →
                        </PageLink>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PageLink({ current, page, children }) {
  const sp = new URLSearchParams();
  if (current.q) sp.set("q", current.q);
  if (current.difficulty) sp.set("difficulty", current.difficulty);
  if (current.topic) sp.set("topic", current.topic);
  if (current.status) sp.set("status", current.status);
  sp.set("page", String(page));
  return (
    <Link href={`/problems?${sp.toString()}`} className="rounded-lg border border-white/10 px-3 py-1.5 font-medium text-slate-300 hover:bg-white/5">
      {children}
    </Link>
  );
}
