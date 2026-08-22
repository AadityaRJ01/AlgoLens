import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getOrGenerateRecommendations, CatalogNotInitializedError } from "@/lib/recommendations";
import { getRecommendationEngineData } from "@/lib/recommendationsInsights";
import RefreshButton from "./RefreshButton";
import InitCatalogButton from "./InitCatalogButton";
import EmptyState from "@/components/ui/EmptyState";
import { DARK_CARD_PADDED, pageClass } from "@/lib/theme";
import EngineStatusBar from "@/components/recommendations/EngineStatusBar";
import PrimaryPrescriptionCard from "@/components/recommendations/PrimaryPrescriptionCard";
import CognitiveGapClusters from "@/components/recommendations/CognitiveGapClusters";
import ProgressivePathway from "@/components/recommendations/ProgressivePathway";
import RecentlyPracticedTable from "@/components/recommendations/RecentlyPracticedTable";

// AlgoLens's AI diagnostic engine — the "why" behind every recommendation,
// not just a problem list. Problem SELECTION is never recomputed here: the
// hero and every cluster candidate come straight from lib/recommendations.js
// (Phase 8's deterministic engine + its real Groq-authored reasons).
// lib/recommendationsInsights.js only adds real presentation data
// (clustering, traceback links, pathway, history) plus a couple of clearly
// isolated, deterministic estimates — see that file's header comment.
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

  const engineData =
    masteryCount > 0 && !catalogNotInitialized ? await getRecommendationEngineData(userId, recommendations) : null;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-50">
      <div className={pageClass("max-w-5xl")}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Recommendations</h1>
            <p className="mt-1 text-sm text-slate-400">
              Precision-engineered problem sets generated from your recent learning signals.
            </p>
          </div>
          {masteryCount > 0 && <RefreshButton />}
        </div>

        {masteryCount === 0 && (
          <EmptyState tone="dark" message="Complete more problems and Micro-Proofs to unlock personalized recommendations." />
        )}

        {masteryCount > 0 && catalogNotInitialized && (
          <div className={`${DARK_CARD_PADDED} space-y-3`}>
            <p className="text-slate-400">
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

        {engineData && (
          <>
            <EngineStatusBar stats={engineData.engineStats} />

            {engineData.hero && <PrimaryPrescriptionCard hero={engineData.hero} />}

            {engineData.clusters.length > 0 && <CognitiveGapClusters clusters={engineData.clusters} />}

            {engineData.pathway && <ProgressivePathway pathway={engineData.pathway} />}

            <RecentlyPracticedTable history={engineData.completedHistory} />
          </>
        )}
      </div>
    </div>
  );
}
