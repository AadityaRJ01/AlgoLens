import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateDoubtHint, GroqServiceError } from "@/lib/groq";
import { getDoubtPersonalizationContext } from "@/lib/doubtSolverContext";
import { MAX_PASTE_CHARS, MAX_DOUBT_CHARS } from "@/lib/constants";
import { checkRouteRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const VALID_HINT_LEVELS = [1, 2, 3, 4];
const MAX_PREVIOUS_HINTS = 3;

// Phase 9: AI Doubt Solver. Stateless — no chat history is persisted; the
// client resends the full session (problem, code, doubt, prior hints) on
// every request, and this route re-derives personalized context fresh each
// time from the caller's own mastery/failure data. Never picks or reveals
// a full solution; that responsibility lives in the Groq prompt itself.
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = checkRouteRateLimit("doubt_solver_hint", userId, RATE_LIMITS.GROQ_STANDARD);
    if (limited) {
      return NextResponse.json(limited.body, {
        status: limited.status,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      });
    }

    const body = await req.json();
    const problemTitle = typeof body.problemTitle === "string" ? body.problemTitle.trim() : "";
    const doubt = typeof body.doubt === "string" ? body.doubt.trim() : "";
    const hintLevel = Number(body.hintLevel);
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
    if (!doubt) {
      return NextResponse.json({ error: "Please describe your doubt." }, { status: 400 });
    }
    if (doubt.length > MAX_DOUBT_CHARS) {
      return NextResponse.json({ error: "Your doubt text is too long." }, { status: 413 });
    }
    if (currentCode.length > MAX_PASTE_CHARS) {
      return NextResponse.json({ error: "Code is too large." }, { status: 413 });
    }
    if (!VALID_HINT_LEVELS.includes(hintLevel)) {
      return NextResponse.json({ error: "Invalid hint level." }, { status: 400 });
    }

    // Best-effort personalization from the caller's own learning profile
    // (Phase 6 mastery, Phase 4 failures). Never fails the hint request —
    // a hiccup here just means the hint is less personalized. Shared with
    // the full-solution endpoint via lib/doubtSolverContext.js.
    const { masteryContext, failureContext } = await getDoubtPersonalizationContext(userId, {
      topicTags,
      problemSlug,
    });

    let result;
    try {
      result = await generateDoubtHint({
        problemTitle,
        problemDescription,
        constraints,
        language,
        currentCode,
        doubt,
        hintLevel,
        previousHints,
        masteryContext,
        failureContext,
      });
    } catch (err) {
      const status = err instanceof GroqServiceError ? err.status : 502;
      console.error("[DOUBT_SOLVER_AI_ERROR]", err.message);
      return NextResponse.json(
        { error: "AI coaching is temporarily unavailable. Please try again." },
        { status }
      );
    }

    return NextResponse.json({
      hint: result.hint,
      hintLevel,
      aiModel: result.aiModel,
      masteryContext,
    });
  } catch (error) {
    console.error("[DOUBT_SOLVER_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
