import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { evaluateMicroProofAnswer, GroqServiceError } from "@/lib/groq";
import { MAX_ANSWER_CHARS } from "@/lib/constants";

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
      },
    });
  } catch (error) {
    console.error("[MICROPROOF_EVALUATE_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
