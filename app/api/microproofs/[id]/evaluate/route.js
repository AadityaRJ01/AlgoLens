import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { evaluateMicroProofAnswer, GroqServiceError } from "@/lib/groq";
import { MAX_ANSWER_CHARS } from "@/lib/constants";
import { recalculateConceptMastery } from "@/lib/mastery";
import { normalizeConceptName } from "@/lib/conceptNormalization";
import { scheduleOrUpdateRevision, buildReviewExplanation } from "@/lib/revision";

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await req.json();
    const answer = typeof body.answer === "string" ? body.answer.trim() : "";

    if (!answer) {
      return NextResponse.json({ error: "An answer is required" }, { status: 400 });
    }
    if (answer.length > MAX_ANSWER_CHARS) {
      return NextResponse.json({ error: "Answer is too long." }, { status: 413 });
    }

    const microProof = await prisma.microProof.findUnique({
      where: { id },
      include: { concept: { include: { problem: true } } },
    });

    // A user may only evaluate their own micro-proofs.
    if (!microProof || microProof.clerkUserId !== userId || microProof.concept.clerkUserId !== userId) {
      return NextResponse.json({ error: "Micro-proof not found" }, { status: 404 });
    }

    let result;
    try {
      result = await evaluateMicroProofAnswer({
        problemTitle: microProof.concept.problem.title,
        difficulty: microProof.concept.problem.difficulty,
        tags: microProof.concept.problem.topicTags,
        conceptName: microProof.concept.name,
        coreIdea: microProof.concept.coreIdea,
        invariant: microProof.concept.invariant,
        question: microProof.question,
        expectedPoints: microProof.expectedPoints,
        userAnswer: answer,
      });
    } catch (err) {
      if (err instanceof GroqServiceError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[MICROPROOF_EVALUATE_AI_ERROR]", err.message);
      return NextResponse.json({ error: "Failed to evaluate this answer." }, { status: 502 });
    }

    // Every answer is a new, independent attempt — the MicroProof question itself
    // is never overwritten, and no prior attempt is ever modified or deleted.
    const attempt = await prisma.microProofAttempt.create({
      data: {
        microProofId: microProof.id,
        clerkUserId: userId,
        answer,
        score: result.score,
        understanding: result.understanding,
        whatWasCorrect: result.whatWasCorrect,
        missingPoints: result.missingPoints,
        feedback: result.feedback,
        aiModel: result.aiModel,
      },
    });

    // Best-effort: mastery + the revision schedule are recalculated from the
    // data we just committed, but a hiccup here shouldn't fail the
    // evaluation response the user is waiting on.
    let masteryBefore = null;
    let updatedMastery = null;
    let revision = null;
    let explanation = null;
    try {
      const concept = normalizeConceptName(microProof.concept.name);
      if (concept) {
        masteryBefore = await prisma.conceptMastery.findUnique({
          where: { clerkUserId_concept: { clerkUserId: userId, concept } },
        });

        updatedMastery = await recalculateConceptMastery(userId, microProof.concept.name);

        if (updatedMastery) {
          const { schedule, intervalDays, previousScore } = await scheduleOrUpdateRevision(userId, concept, {
            score: attempt.score,
            masteryScore: updatedMastery.masteryScore,
          });

          // Denormalized snapshot for the Revision History view (Phase 7).
          await prisma.microProofAttempt.update({
            where: { id: attempt.id },
            data: { intervalDaysAfterReview: intervalDays },
          });

          revision = {
            nextReviewAt: schedule.nextReviewAt,
            currentIntervalDays: schedule.currentIntervalDays,
            reviewCount: schedule.reviewCount,
            status: schedule.status,
          };
          explanation = buildReviewExplanation({
            previousScore,
            newScore: attempt.score,
            intervalDays,
            stillShaky: false,
          });
        }
      }
    } catch (err) {
      console.error("[MICROPROOF_EVALUATE_MASTERY_ERROR]", err.message);
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        answer: attempt.answer,
        score: attempt.score,
        understanding: attempt.understanding,
        whatWasCorrect: attempt.whatWasCorrect,
        missingPoints: attempt.missingPoints,
        feedback: attempt.feedback,
        createdAt: attempt.createdAt,
        intervalDaysAfterReview: revision?.currentIntervalDays ?? null,
      },
      mastery: updatedMastery
        ? {
            previousScore: masteryBefore?.masteryScore ?? null,
            masteryScore: updatedMastery.masteryScore,
            status: updatedMastery.status,
          }
        : null,
      revision,
      explanation,
    });
  } catch (error) {
    console.error("[MICROPROOF_EVALUATE_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
