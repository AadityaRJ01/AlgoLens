import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const RESULT_LIMIT = 15;

// Phase 9: lightweight typeahead search over the global LeetCode problem
// catalog (Phase 8), used by the Doubt Solver's optional "select a problem"
// flow. Read-only, public reference data — no user-specific info returned.
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) {
      return NextResponse.json({ problems: [] });
    }

    const problems = await prisma.leetCodeProblemCatalog.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      orderBy: { title: "asc" },
      take: RESULT_LIMIT,
      select: { slug: true, title: true, difficulty: true, topicTags: true },
    });

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("[CATALOG_SEARCH_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
