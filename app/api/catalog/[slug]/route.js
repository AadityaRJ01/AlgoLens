import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { fetchProblemDescription } from "@/lib/leetcode";

// Phase 9: returns catalog metadata for one problem plus a best-effort live
// description fetch, used to auto-populate the Doubt Solver form when the
// user selects a problem from the catalog. Public reference data.
export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const problem = await prisma.leetCodeProblemCatalog.findUnique({ where: { slug } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    let description = null;
    try {
      description = await fetchProblemDescription(problem.slug);
    } catch {
      description = null;
    }

    return NextResponse.json({
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      topicTags: problem.topicTags,
      url: problem.url,
      description,
    });
  } catch (error) {
    console.error("[CATALOG_PROBLEM_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
