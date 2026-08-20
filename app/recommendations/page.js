import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getOrGenerateRecommendations, CatalogNotInitializedError } from "@/lib/recommendations";
import RefreshButton from "./RefreshButton";
import InitCatalogButton from "./InitCatalogButton";
import EmptyState from "@/components/ui/EmptyState";
import { CARD_PADDED, DIFFICULTY_STYLES, PRIORITY_STYLES, BTN_PRIMARY, pageClass } from "@/lib/theme";

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
    <div className={pageClass("max-w-4xl")}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">What Should I Solve Next?</h1>
          <p className="text-slate-600 mt-1">Based on your current learning profile.</p>
        </div>
        {masteryCount > 0 && <RefreshButton />}
      </div>

      {masteryCount === 0 && (
        <EmptyState message="Complete more problems and Micro-Proofs to unlock personalized recommendations." />
      )}

      {masteryCount > 0 && catalogNotInitialized && (
        <div className={`${CARD_PADDED} space-y-3`}>
          <p className="text-slate-600">
            The global LeetCode problem catalog hasn&apos;t been initialized yet, so we have no
            pool of problems to recommend from. Initialize it once and recommendations will
            appear.
          </p>
          <InitCatalogButton />
        </div>
      )}

      {masteryCount > 0 && !catalogNotInitialized && recommendations.length === 0 && (
        <EmptyState message="No recommendations available right now — we couldn't find an unsolved problem in our catalog matching your weakest concepts. Sync more LeetCode activity or check back later." />
      )}

      {recommendations.length > 0 && (
        <ol className="space-y-4">
          {recommendations.map((rec, i) => (
            <li key={rec.id} className={CARD_PADDED}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 font-semibold">{i + 1}.</span>
                    <h2 className="font-semibold text-slate-900">{rec.problem.title}</h2>
                    <span className={`text-sm font-semibold ${DIFFICULTY_STYLES[rec.problem.difficulty] || "text-slate-500"}`}>
                      {rec.problem.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {rec.problem.topicTags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[rec.priorityLabel] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                >
                  Priority: {rec.priorityLabel}
                </span>
              </div>

              <div className="mt-3 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  Target: <span className="font-medium text-slate-800">{rec.targetConcept}</span>
                </span>
                <span>
                  Mastery: <span className="font-medium text-slate-800">{rec.masteryScore}%</span>
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Why</h3>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{rec.reason}</p>
              </div>

              {rec.problem.url && (
                <a
                  href={rec.problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block mt-4 ${BTN_PRIMARY}`}
                >
                  Solve on LeetCode
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
