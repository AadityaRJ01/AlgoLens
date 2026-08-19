import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { fetchProblemDescription } from "@/lib/leetcode";
import { extractConceptAndMicroProof, GroqServiceError } from "@/lib/groq";
import { ACCEPTED_VERDICT, MAX_PASTE_CHARS } from "@/lib/constants";

function serializeConcept(concept) {
  return {
    id: concept.id,
    name: concept.name,
    coreIdea: concept.coreIdea,
    invariant: concept.invariant,
    aiModel: concept.aiModel,
    createdAt: concept.createdAt,
  };
}

function serializeAttempt(attempt) {
  return {
    id: attempt.id,
    answer: attempt.answer,
    score: attempt.score,
    understanding: attempt.understanding,
    whatWasCorrect: attempt.whatWasCorrect,
    missingPoints: attempt.missingPoints,
    feedback: attempt.feedback,
    createdAt: attempt.createdAt,
  };
}

function serializeMicroProof(microProof) {
  if (!microProof) return null;
  return {
    id: microProof.id,
    question: microProof.question,
    expectedPoints: microProof.expectedPoints,
    createdAt: microProof.createdAt,
    // Attempt history only — never a "current answer" to prefill the editable field with.
    attempts: (microProof.attempts || []).map(serializeAttempt),
  };
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId } = body;
    const sourceCodeOverride = typeof body.sourceCode === "string" ? body.sourceCode.trim() : "";

    if (!submissionId || typeof submissionId !== "string") {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }
    if (sourceCodeOverride.length > MAX_PASTE_CHARS) {
      return NextResponse.json({ error: "Source code is too large." }, { status: 413 });
    }

    const submission = await prisma.leetCodeSubmission.findUnique({
      where: { id: submissionId },
      include: { problem: true, account: true },
    });

    // A user may only extract concepts from submissions belonging to their own connected account.
    if (!submission || submission.account.clerkUserId !== userId) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.verdict !== ACCEPTED_VERDICT) {
      return NextResponse.json(
        { error: "Concept extraction is only available for accepted submissions." },
        { status: 400 }
      );
    }

    // Idempotent: reuse the existing concept + micro-proof for this problem instead
    // of paying for another AI call and creating a duplicate row.
    const existing = await prisma.concept.findUnique({
      where: { clerkUserId_problemId: { clerkUserId: userId, problemId: submission.problemId } },
      include: {
        microProofs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { attempts: { orderBy: { createdAt: "desc" } } },
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        concept: serializeConcept(existing),
        microProof: serializeMicroProof(existing.microProofs[0] || null),
        reused: true,
      });
    }

    // Best-effort context enrichment — extraction still proceeds without it.
    let problemDescription = null;
    try {
      problemDescription = await fetchProblemDescription(submission.problem.titleSlug);
    } catch {
      problemDescription = null;
    }

    const sourceCode = sourceCodeOverride || submission.sourceCode || null;

    let result;
    try {
      result = await extractConceptAndMicroProof({
        problemTitle: submission.problem.title,
        problemDescription,
        tags: submission.problem.topicTags,
        difficulty: submission.problem.difficulty,
        sourceCode,
        language: submission.language,
      });
    } catch (err) {
      if (err instanceof GroqServiceError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[CONCEPT_EXTRACT_AI_ERROR]", err.message);
      return NextResponse.json({ error: "Failed to extract a concept for this problem." }, { status: 502 });
    }

    let created;
    try {
      created = await prisma.concept.create({
        data: {
          clerkUserId: userId,
          problemId: submission.problemId,
          submissionId: submission.id,
          name: result.concept.name,
          coreIdea: result.concept.coreIdea,
          invariant: result.concept.invariant,
          aiModel: result.aiModel,
          microProofs: {
            create: {
              clerkUserId: userId,
              question: result.microProof.question,
              expectedPoints: result.microProof.expectedPoints,
              aiModel: result.aiModel,
            },
          },
        },
        include: { microProofs: true },
      });
    } catch (err) {
      // Unique constraint race: another concurrent request already created this
      // user's concept for this problem — fetch and return that one instead.
      if (err.code === "P2002") {
        const raceWinner = await prisma.concept.findUnique({
          where: { clerkUserId_problemId: { clerkUserId: userId, problemId: submission.problemId } },
          include: {
            microProofs: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { attempts: { orderBy: { createdAt: "desc" } } },
            },
          },
        });
        if (raceWinner) {
          return NextResponse.json({
            concept: serializeConcept(raceWinner),
            microProof: serializeMicroProof(raceWinner.microProofs[0] || null),
            reused: true,
          });
        }
      }
      throw err;
    }

    return NextResponse.json({
      concept: serializeConcept(created),
      microProof: serializeMicroProof(created.microProofs[0]),
      reused: false,
    });
  } catch (error) {
    console.error("[CONCEPT_EXTRACT_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
