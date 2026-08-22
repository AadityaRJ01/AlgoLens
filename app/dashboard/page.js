import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/dashboard";
import { pageClass } from "@/lib/theme";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import RecommendationHero from "@/components/dashboard/RecommendationHero";
import ConceptMasterySection from "@/components/dashboard/ConceptMasterySection";
import LearningSignalsList from "@/components/dashboard/LearningSignalsList";
import ActivityChart from "@/components/dashboard/ActivityChart";
import LearningLoopIndicator from "@/components/dashboard/LearningLoopIndicator";

const SIGNALS_PREVIEW_COUNT = 5;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Which stage of the PROBLEM -> FAILURE -> CONCEPT -> MASTERY -> REVISION ->
// RECOMMENDATION loop the user is "in" right now, for the compact
// LearningLoopIndicator. A live recommendation is always the most actionable
// next step, so it wins; otherwise the most recent real signal's type maps
// onto the stage that produced it. Purely a presentation-layer read of data
// already fetched by getDashboardData — no new query, nothing fabricated.
function deriveCurrentStage(data) {
  if (data.recommendations.length > 0) return "Recommendation";

  const latest = data.recentActivity[0];
  if (!latest) return "Problem";

  switch (latest.type) {
    case "FAILURE":
      return "Failure";
    case "MICROPROOF":
      return "Concept";
    case "MASTERY":
      return "Mastery";
    case "REVISION":
      return "Revision";
    case "SOLVED":
    default:
      return "Problem";
  }
}

// The authenticated home. Dark, product-first — matches the landing page's
// visual identity but stays restrained (see AGENTS: "landing page = marketing,
// dashboard = product"). Section order follows AGENTS.md's dashboard
// refinement #1: greeting, quick stats, recommended action, weak concepts,
// recent signals, activity — "how am I doing" -> "what should I do next" ->
// "why" -> "how is my learning progressing." Every number is real (see
// lib/dashboard.js); nothing on this page is mocked.
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [user, data] = await Promise.all([currentUser(), getDashboardData(userId)]);
  const firstName = user?.firstName || null;
  const topRecommendation = data.recommendations[0] || null;
  const currentStage = deriveCurrentStage(data);

  return (
    <div className={`min-h-screen bg-[#0B0F17] text-slate-50`}>
      <div className={pageClass()}>
        <PageHeader
          greeting={getGreeting()}
          name={firstName}
          subtitle="Here's what your learning signals are telling you."
          streakDays={data.summary.streakDays}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Problems Solved" value={data.summary.problemsSolved} />
          <StatCard
            label="Average Mastery"
            value={data.summary.overallMasteryPercent !== null ? `${data.summary.overallMasteryPercent}%` : "—"}
          />
          <StatCard label="Current Streak" value={`${data.summary.streakDays}d`} />
          <StatCard
            label="Weak Concepts"
            value={data.summary.conceptsToImprove}
            accent={data.summary.conceptsToImprove > 0 ? "warning" : undefined}
          />
        </div>

        <RecommendationHero rec={topRecommendation} />

        <ConceptMasterySection masteryList={data.masteryList} />

        <LearningSignalsList events={data.recentActivity.slice(0, SIGNALS_PREVIEW_COUNT)} />

        <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
          <div className="lg:col-span-2">
            <ActivityChart data={data.weeklyActivity} />
          </div>
          <LearningLoopIndicator currentStage={currentStage} />
        </div>
      </div>
    </div>
  );
}
