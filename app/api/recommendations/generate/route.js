import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrGenerateRecommendations, CatalogNotInitializedError } from "@/lib/recommendations";

function serialize(rec) {
  return {
    id: rec.id,
    targetConcept: rec.targetConcept,
    masteryScore: rec.masteryScore,
    reason: rec.reason,
    priorityScore: rec.priorityScore,
    priorityLabel: rec.priorityLabel,
    generatedAt: rec.generatedAt,
    problem: {
      title: rec.problem.title,
      difficulty: rec.problem.difficulty,
      topicTags: rec.problem.topicTags,
      url: rec.problem.url,
    },
  };
}

// Regenerates the current user's recommendations: deterministic candidate
// selection always re-runs (cheap), but Groq is only called for genuinely
// new recommendations — see lib/recommendations.js.
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recommendations = await getOrGenerateRecommendations(userId);
    return NextResponse.json({ recommendations: recommendations.map(serialize) });
  } catch (error) {
    if (error instanceof CatalogNotInitializedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[RECOMMENDATIONS_GENERATE_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
