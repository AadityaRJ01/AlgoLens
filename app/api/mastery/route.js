import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Authenticated retrieval of the current user's Concept Mastery profile.
// Every query is scoped to the caller's own clerkUserId — no user can ever
// see another user's mastery data.
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.conceptMastery.findMany({
      where: { clerkUserId: userId },
      orderBy: { masteryScore: "desc" },
    });

    return NextResponse.json({
      mastery: records.map((r) => ({
        concept: r.concept,
        masteryScore: r.masteryScore,
        status: r.status,
        averageMicroProofScore: r.averageMicroProofScore,
        totalMicroProofAttempts: r.totalMicroProofAttempts,
        failureCount: r.failureCount,
        successfulProblemCount: r.successfulProblemCount,
        lastEvaluatedAt: r.lastEvaluatedAt,
      })),
    });
  } catch (error) {
    console.error("[MASTERY_LIST_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
