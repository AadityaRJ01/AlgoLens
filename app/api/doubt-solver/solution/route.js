import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateFullSolution, GroqServiceError } from "@/lib/groq";
import { getDoubtPersonalizationContext } from "@/lib/doubtSolverContext";
import { MAX_PASTE_CHARS, MAX_DOUBT_CHARS } from "@/lib/constants";
import { checkRouteRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const MAX_PREVIOUS_HINTS = 4;

// Phase 9 enhancement: full solution reveal. Only reachable after the user
// has already gone through Hints 1-3 and explicitly clicks "Get Full
// Solution" client-side; enforced again here so the gate can't be bypassed
// by calling the API directly. Stateless like the hint endpoint — nothing
// about this session is persisted to the database.
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = checkRouteRateLimit("doubt_solver_solution", userId, RATE_LIMITS.DOUBT_SOLVER_SOLUTION);
    if (limited) {
      return NextResponse.json(limited.body, {
        status: limited.status,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      });
    }

    const body = await req.json();
    const problemTitle = typeof body.problemTitle === "string" ? body.problemTitle.trim() : "";
    const doubt = typeof body.doubt === "string" ? body.doubt.trim() : "";
    const language = typeof body.language === "string" ? body.language.trim() : "";
    const currentCode = typeof body.currentCode === "string" ? body.currentCode : "";
    const problemDescription = typeof body.problemDescription === "string" ? body.problemDescription : "";
    const constraints = typeof body.constraints === "string" ? body.constraints : "";
    const topicTags = Array.isArray(body.topicTags) ? body.topicTags.filter((t) => typeof t === "string") : [];
    const problemSlug = typeof body.problemSlug === "string" ? body.problemSlug.trim() : "";
    const previousHints = Array.isArray(body.previousHints)
      ? body.previousHints.filter((h) => typeof h === "string").slice(0, MAX_PREVIOUS_HINTS)
      : [];

    if (!problemTitle) {
      return NextResponse.json({ error: "A problem title is required." }, { status: 400 });
    }
    if (doubt.length > MAX_DOUBT_CHARS) {
      return NextResponse.json({ error: "Your doubt text is too long." }, { status: 413 });
    }
    if (currentCode.length > MAX_PASTE_CHARS) {
      return NextResponse.json({ error: "Code is too large." }, { status: 413 });
    }
    // Mirrors the client-side gate: the full solution is only offered after
    // all three progressive hints have been generated for this session.
    if (previousHints.length < 3) {
      return NextResponse.json(
        { error: "Get all three hints before requesting the full solution." },
        { status: 400 }
      );
    }

    const { masteryContext, failureContext } = await getDoubtPersonalizationContext(userId, {
      topicTags,
      problemSlug,
    });

    let result;
    try {
      result = await generateFullSolution({
        problemTitle,
        problemDescription,
        constraints,
        language,
        currentCode,
        doubt,
        previousHints,
        masteryContext,
        failureContext,
      });
    } catch (err) {
      const status = err instanceof GroqServiceError ? err.status : 502;
      console.error("[DOUBT_SOLVER_SOLUTION_AI_ERROR]", err.message);
      return NextResponse.json(
        { error: "Unable to generate the solution right now. Please try again." },
        { status }
      );
    }

    return NextResponse.json({
      solution: {
        approach: result.approach,
        whyItWorks: result.whyItWorks,
        code: result.code,
        timeComplexity: result.timeComplexity,
        spaceComplexity: result.spaceComplexity,
        keyTakeaway: result.keyTakeaway,
      },
      aiModel: result.aiModel,
    });
  } catch (error) {
    console.error("[DOUBT_SOLVER_SOLUTION_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
