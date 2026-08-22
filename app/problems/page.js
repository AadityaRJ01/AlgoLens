import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { ACCEPTED_VERDICT } from "@/lib/constants";
import { getCatalogProblemCount } from "@/lib/leetcodeCatalog";
import { DARK_CARD, DARK_DIFFICULTY_STYLES, DARK_STATUS_DOT, pageClass } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";
import InitCatalogButton from "@/app/recommendations/InitCatalogButton";
import { SearchIcon, CheckIcon } from "@/components/icons";

const PAGE_SIZE = 30;
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// The dashboard-family "Problems" surface — a browsable view over the real
// global LeetCode catalog (Phase 8, lib/leetcodeCatalog.js), cross-referenced
// with the signed-in user's own accepted submissions (solved) and Concept
// Mastery (best-effort match via topic tag -> normalized concept name).
// No mock data: an empty catalog shows the same real init flow already used
// on /recommendations, reused here rather than duplicated.
export default async function ProblemsPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const q = (params?.q || "").trim();
  const difficulty = DIFFICULTIES.includes(params?.difficulty) ? params.difficulty : null;

  const catalogCount = await getCatalogProblemCount();

  const [problems, solvedTitles, masteries] = catalogCount
    ? await Promise.all([
        prisma.leetCodeProblemCatalog.findMany({
          where: {
            ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
            ...(difficulty ? { difficulty } : {}),
          },
          orderBy: { title: "asc" },
          take: PAGE_SIZE,
        }),
        prisma.leetCodeSubmission.findMany({
          where: { account: { clerkUserId: userId }, verdict: ACCEPTED_VERDICT },
          select: { problem: { select: { title: true } } },
          distinct: ["problemId"],
        }),
        prisma.conceptMastery.findMany({ where: { clerkUserId: userId }, select: { concept: true, masteryScore: true, status: true } }),
      ])
    : [[], [], []];

  const solvedSet = new Set(solvedTitles.map((s) => s.problem.title.toLowerCase()));
  const masteryByConcept = new Map(masteries.map((m) => [m.concept, m]));

  function masteryForProblem(topicTags) {
    for (const tag of topicTags) {
      const concept = normalizeConceptName(tag);
      const match = concept && masteryByConcept.get(concept);
      if (match) return match;
    }
    return null;
  }

  const filterHref = (next) => {
    const sp = new URLSearchParams();
    if (next.q ?? q) sp.set("q", next.q ?? q);
    if (next.difficulty ?? difficulty) sp.set("difficulty", next.difficulty ?? difficulty);
    const qs = sp.toString();
    return qs ? `/problems?${qs}` : "/problems";
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-5xl")}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">Problems</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Search the problem catalog by difficulty and topic — solved and mastery status shown where known.
          </p>
        </div>

        {catalogCount === 0 && (
          <div className={`${DARK_CARD} p-6 space-y-3`}>
            <p className="text-sm text-neutral-400">
              The global problem catalog hasn&apos;t been initialized yet, so there&apos;s no pool of problems to browse.
            </p>
            <InitCatalogButton />
          </div>
        )}

        {catalogCount > 0 && (
          <>
            <form className="flex flex-wrap items-center gap-3" action="/problems">
              <div className="relative">
                <SearchIcon width={15} height={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Search problems…"
                  className="w-56 rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-indigo-400/50"
                />
              </div>
              {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
              <div className="flex items-center gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <Link
                    key={d}
                    href={filterHref({ difficulty: difficulty === d ? null : d })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      difficulty === d
                        ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300"
                        : "border-white/10 text-neutral-400 hover:text-neutral-100"
                    }`}
                  >
                    {d}
                  </Link>
                ))}
                {difficulty && (
                  <Link href={filterHref({ difficulty: null })} className="text-xs text-neutral-500 hover:text-neutral-300">
                    Clear
                  </Link>
                )}
              </div>
              <button type="submit" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/5">
                Search
              </button>
            </form>

            {problems.length === 0 ? (
              <EmptyState tone="dark" message="No problems match this search." />
            ) : (
              <div className={`${DARK_CARD} overflow-hidden`}>
                <ul className="divide-y divide-white/5">
                  {problems.map((p) => {
                    const mastery = masteryForProblem(p.topicTags);
                    const isSolved = solvedSet.has(p.title.toLowerCase());
                    return (
                      <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isSolved ? (
                              <CheckIcon width={14} height={14} className="shrink-0 text-emerald-400" />
                            ) : (
                              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/15" />
                            )}
                            <span className="truncate text-sm font-medium text-neutral-100">{p.title}</span>
                            <span className={`text-xs font-semibold ${DARK_DIFFICULTY_STYLES[p.difficulty] || "text-neutral-400"}`}>
                              {p.difficulty}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5 pl-6">
                            {p.topicTags.slice(0, 3).map((tag) => (
                              <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-neutral-500">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          {mastery && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                              <span className={`h-1.5 w-1.5 rounded-full ${DARK_STATUS_DOT[mastery.status] || DARK_STATUS_DOT.NEUTRAL}`} />
                              {mastery.masteryScore}%
                            </span>
                          )}
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                            >
                              Solve →
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
