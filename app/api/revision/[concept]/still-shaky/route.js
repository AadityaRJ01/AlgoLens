import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { markRevisionStillShaky } from "@/lib/revision";

// "Still Shaky": the user doesn't feel solid on this concept even after
// reviewing it, so it's rescheduled sooner without altering the score or
// attempt that was just recorded. Scoped to the caller's own schedule —
// markRevisionStillShaky only ever looks up/updates by (clerkUserId, concept).
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { concept: rawConcept } = await params;
    const concept = decodeURIComponent(rawConcept || "");
    if (!concept) {
      return NextResponse.json({ error: "concept is required" }, { status: 400 });
    }

    const updated = await markRevisionStillShaky(userId, concept);
    if (!updated) {
      return NextResponse.json({ error: "Revision schedule not found" }, { status: 404 });
    }

    return NextResponse.json({
      revision: {
        concept: updated.concept,
        nextReviewAt: updated.nextReviewAt,
        currentIntervalDays: updated.currentIntervalDays,
        reviewCount: updated.reviewCount,
        lastScore: updated.lastScore,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("[REVISION_STILL_SHAKY_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
