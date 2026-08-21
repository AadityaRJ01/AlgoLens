import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { fetchProblemDescription } from "@/lib/leetcode";
import { analyzeFailure, GroqServiceError } from "@/lib/groq";
import { MAX_PASTE_CHARS } from "@/lib/constants";
import { recalculateConceptMastery } from "@/lib/mastery";
import { checkRouteRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = checkRouteRateLimit("failures_analyze", userId, RATE_LIMITS.GROQ_STANDARD);
    if (limited) {
      return NextResponse.json(limited.body, {
        status: limited.status,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      });
    }

    const body = await req.json();
    const { submissionId, sourceCode } = body;

    if (!submissionId || typeof submissionId !== "string") {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    const trimmedCode = typeof sourceCode === "string" ? sourceCode.trim() : "";
    if (!trimmedCode) {
      return NextResponse.json({ error: "Source code is required" }, { status: 400 });
    }
    if (trimmedCode.length > MAX_PASTE_CHARS) {
      return NextResponse.json(
        { error: "Source code is too large to analyze." },
        { status: 413 }
      );
    }

    const submission = await prisma.leetCodeSubmission.findUnique({
      where: { id: submissionId },
      include: { problem: true, account: true },
    });

    // A user may only analyze submissions belonging to their own connected account.
    if (!submission || submission.account.clerkUserId !== userId) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Best-effort context enrichment — analysis still proceeds without it.
    let problemDescription = null;
    try {
      problemDescription = await fetchProblemDescription(submission.problem.titleSlug);
    } catch {
      problemDescription = null;
    }

    let result;
    try {
      result = await analyzeFailure({
        problemTitle: submission.problem.title,
        problemDescription,
        constraints: null,
        tags: submission.problem.topicTags,
        difficulty: submission.problem.difficulty,
        verdict: submission.verdict,
        language: submission.language,
        runtime: submission.runtime,
        memory: submission.memory,
        sourceCode: trimmedCode,
      });
    } catch (err) {
      if (err instanceof GroqServiceError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[FAILURE_ANALYZE_AI_ERROR]", err.message);
      return NextResponse.json(
        { error: "Failed to analyze this submission." },
        { status: 502 }
      );
    }

    const saved = await prisma.failureAnalysis.create({
      data: {
        clerkUserId: userId,
        submissionId: submission.id,
        rootCause: result.rootCause,
        failureCategory: result.failureCategory,
        concept: result.concept,
        evidence: result.evidence,
        preventionRule: result.preventionRule,
        suggestedFollowUp: result.suggestedFollowUp,
        failingTestCase: result.failingTestCase,
        aiModel: result.aiModel,
      },
    });

    // Best-effort: mastery is recalculated from the data we just committed,
    // but a recalculation hiccup shouldn't fail the analysis response.
    try {
      await recalculateConceptMastery(userId, saved.concept);
    } catch (err) {
      console.error("[FAILURE_ANALYZE_MASTERY_ERROR]", err.message);
    }

    return NextResponse.json({
      analysis: {
        rootCause: saved.rootCause,
        failureCategory: saved.failureCategory,
        concept: saved.concept,
        evidence: saved.evidence,
        preventionRule: saved.preventionRule,
        suggestedFollowUp: saved.suggestedFollowUp,
        failingTestCase: saved.failingTestCase,
        aiModel: saved.aiModel,
        createdAt: saved.createdAt,
      },
    });
  } catch (error) {
    console.error("[FAILURE_ANALYZE_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
