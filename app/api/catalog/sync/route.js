import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncLeetCodeProblemCatalog } from "@/lib/leetcodeCatalog";
import { checkRouteRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

// Phase 8: imports/refreshes the global LeetCode problem catalog — public,
// read-only reference data shared by every user. Requires auth only to
// avoid unauthenticated abuse of an outbound-fetch-heavy endpoint; the
// catalog itself is not user-specific and never touches a user's own
// LeetCode submission history.
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = checkRouteRateLimit("catalog_sync", userId, RATE_LIMITS.CATALOG_SYNC);
    if (limited) {
      return NextResponse.json(limited.body, {
        status: limited.status,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      });
    }

    const result = await syncLeetCodeProblemCatalog();
    if (result.fetched === 0) {
      return NextResponse.json(
        { error: result.error || "Catalog sync failed to import any problems." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[CATALOG_SYNC_ERROR]", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
