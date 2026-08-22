import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMasteryOverview, getConceptDetail } from "@/lib/masteryInsights";
import { getMockSubconceptBreakdown } from "@/lib/mockSubconcepts";
import { pageClass } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";
import OverallMasteryCard from "@/components/mastery/OverallMasteryCard";
import ConceptMasteryList from "@/components/mastery/ConceptMasteryList";
import MasteryDetail from "@/components/mastery/MasteryDetail";

// The Mastery page: how well do I actually understand each concept, why am
// I weak, am I improving, and what should I practice next. All real data
// (see lib/masteryInsights.js) except the sub-concept breakdown, which is
// isolated mock data (lib/mockSubconcepts.js) since no sub-concept schema
// exists yet. Concept selection is a real navigable link (?concept=...),
// the same master/detail pattern already used on /analyze.
export default async function MasteryPage({ searchParams }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const { masteryList, summary } = await getMasteryOverview(userId);

  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-6xl")}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">Mastery</h1>
          <p className="mt-1 text-sm text-neutral-400">Track what you understand — and what needs more work.</p>
        </div>

        {masteryList.length === 0 ? (
          <EmptyState
            tone="dark"
            message="Complete a few Micro-Proofs to build your learning profile."
            actionHref="/concepts"
            actionLabel="Extract a concept"
          />
        ) : (
          <MasteryBody masteryList={masteryList} summary={summary} userId={userId} requestedConcept={params?.concept} />
        )}
      </div>
    </div>
  );
}

async function MasteryBody({ masteryList, summary, userId, requestedConcept }) {
  const selectedConcept =
    (requestedConcept && masteryList.find((m) => m.concept === requestedConcept)?.concept) || masteryList[0].concept;

  const detail = await getConceptDetail(userId, selectedConcept);
  const breakdown = detail ? getMockSubconceptBreakdown(detail.mastery.concept, detail.mastery.masteryScore) : [];

  return (
    <>
      <OverallMasteryCard
        overallMasteryPercent={summary.overallMasteryPercent}
        overallTrend={summary.overallTrend}
        conceptsStudied={summary.conceptsStudied}
        conceptsMastered={summary.conceptsMastered}
        conceptsNeedingAttention={summary.conceptsNeedingAttention}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_1.5fr] lg:items-start">
        <ConceptMasteryList masteryList={masteryList} selectedConcept={selectedConcept} />
        {detail && <MasteryDetail detail={detail} breakdown={breakdown} />}
      </div>
    </>
  );
}
