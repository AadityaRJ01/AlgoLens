import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { fetchUserProfile, fetchRecentSubmissions, fetchProblemMetadata } from "@/lib/leetcode";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: "LeetCode username is required" }, { status: 400 });
    }

    // 1. Validate user and get stats
    let profileStats;
    try {
      profileStats = await fetchUserProfile(username);
    } catch (e) {
      return NextResponse.json({ error: "Invalid LeetCode username or API error" }, { status: 400 });
    }

    // 2. Fetch recent submissions
    const recentSubmissions = await fetchRecentSubmissions(username, 20);

    // 3. Upsert LeetCodeAccount
    const account = await prisma.leetCodeAccount.upsert({
      where: { clerkUserId: userId },
      update: {
        username: profileStats.username,
        lastSyncedAt: new Date(),
      },
      create: {
        clerkUserId: userId,
        username: profileStats.username,
        lastSyncedAt: new Date(),
      },
    });

    // 4. Process submissions
    let importedCount = 0;
    for (const sub of recentSubmissions) {
      // Extract submission ID from url if possible (e.g. /submissions/detail/12345/)
      const match = sub.url?.match(/\/detail\/(\d+)\//);
      let submissionId = match ? match[1] : null;

      // If we can't find an ID, we use timestamp as a fallback unique identifier
      if (!submissionId && sub.timestamp) {
        submissionId = `ts-${sub.timestamp}`;
      }

      if (!submissionId) continue;

      // Ensure problem exists
      let problem = await prisma.leetCodeProblem.findUnique({
        where: { titleSlug: sub.titleSlug }
      });

      if (!problem) {
        // Fetch metadata
        const meta = await fetchProblemMetadata(sub.titleSlug);
        if (meta) {
          problem = await prisma.leetCodeProblem.create({
            data: {
              questionNumber: meta.questionFrontendId,
              title: sub.title,
              titleSlug: sub.titleSlug,
              difficulty: meta.difficulty,
              topicTags: meta.topicTags.map(t => t.name),
              url: `https://leetcode.com/problems/${sub.titleSlug}/`
            }
          });
        }
      }

      if (problem) {
        // Create or update submission
        // We use findFirst to check existence because multiple nulls are allowed in @@unique,
        // but here submissionId is always non-null (we fall back to timestamp)
        const existing = await prisma.leetCodeSubmission.findFirst({
          where: {
            accountId: account.id,
            submissionId: submissionId
          }
        });

        if (!existing) {
          await prisma.leetCodeSubmission.create({
            data: {
              accountId: account.id,
              problemId: problem.id,
              submissionId: submissionId,
              verdict: sub.statusDisplay,
              language: sub.lang,
              timestamp: new Date(parseInt(sub.timestamp) * 1000),
              runtime: sub.runtime !== "N/A" ? sub.runtime : null,
              memory: sub.memory !== "N/A" ? sub.memory : null,
              sourceCode: null // Public API doesn't provide source code
            }
          });
          importedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: profileStats,
      importedSubmissions: importedCount,
      lastSyncedAt: account.lastSyncedAt,
    });
  } catch (error) {
    console.error("[LEETCODE_SYNC_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
