import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getOrGenerateRecommendations, CatalogNotInitializedError } from "@/lib/recommendations";
import RefreshButton from "./RefreshButton";
import InitCatalogButton from "./InitCatalogButton";
import EmptyState from "@/components/ui/EmptyState";
import { DARK_CARD_PADDED, DARK_DIFFICULTY_STYLES, DARK_PRIORITY_STYLES, DARK_BTN_PRIMARY, pageClass } from "@/lib/theme";

export default async function RecommendationsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const masteryCount = await prisma.conceptMastery.count({ where: { clerkUserId: userId } });

  let recommendations = [];
  let catalogNotInitialized = false;
  if (masteryCount > 0) {
    try {
      recommendations = await getOrGenerateRecommendations(userId);
    } catch (err) {
      if (err instanceof CatalogNotInitializedError) {
        catalogNotInitialized = true;
      } else {
        throw err;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-4xl")}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">What Should I Solve Next?</h1>
            <p className="mt-1 text-sm text-neutral-400">Based on your current learning profile.</p>
          </div>
          {masteryCount > 0 && <RefreshButton />}
        </div>

        {masteryCount === 0 && (
          <EmptyState tone="dark" message="Complete more problems and Micro-Proofs to unlock personalized recommendations." />
        )}

        {masteryCount > 0 && catalogNotInitialized && (
          <div className={`${DARK_CARD_PADDED} space-y-3`}>
            <p className="text-neutral-400">
              The global LeetCode problem catalog hasn&apos;t been initialized yet, so we have no
              pool of problems to recommend from. Initialize it once and recommendations will
              appear.
            </p>
            <InitCatalogButton />
          </div>
        )}

        {masteryCount > 0 && !catalogNotInitialized && recommendations.length === 0 && (
          <EmptyState
            tone="dark"
            message="No recommendations available right now — we couldn't find an unsolved problem in our catalog matching your weakest concepts. Sync more LeetCode activity or check back later."
          />
        )}

        {recommendations.length > 0 && (
          <ol className="space-y-4">
            {recommendations.map((rec, i) => (
              <li key={rec.id} className={DARK_CARD_PADDED}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-neutral-500 font-semibold">{i + 1}.</span>
                      <h2 className="font-semibold text-neutral-50">{rec.problem.title}</h2>
                      <span className={`text-sm font-semibold ${DARK_DIFFICULTY_STYLES[rec.problem.difficulty] || "text-neutral-400"}`}>
                        {rec.problem.difficulty}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {rec.problem.topicTags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${DARK_PRIORITY_STYLES[rec.priorityLabel] || DARK_PRIORITY_STYLES.Low}`}
                  >
                    Priority: {rec.priorityLabel}
                  </span>
                </div>

                <div className="mt-3 text-sm text-neutral-400 flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    Target: <span className="font-medium text-neutral-200">{rec.targetConcept}</span>
                  </span>
                  <span>
                    Mastery: <span className="font-medium text-neutral-200">{rec.masteryScore}%</span>
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Why</h3>
                  <p className="mt-1 text-sm text-neutral-300 whitespace-pre-wrap">{rec.reason}</p>
                </div>

                {rec.problem.url && (
                  <a
                    href={rec.problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block mt-4 ${DARK_BTN_PRIMARY}`}
                  >
                    Solve on LeetCode
                  </a>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
