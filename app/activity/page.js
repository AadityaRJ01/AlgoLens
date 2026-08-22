import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getActivityHistory } from "@/lib/dashboard";
import { pageClass } from "@/lib/theme";
import LearningSignalsList from "@/components/dashboard/LearningSignalsList";

// Destination for the dashboard's "Recent Learning Signals -> View all"
// link. Reuses the same real event-history data/logic as the dashboard
// (see getActivityHistory in lib/dashboard.js) and the same list component,
// just with a much larger limit — this is a read-only view, not a new
// feature.
export default async function ActivityPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const events = await getActivityHistory(userId, { limit: 50 });

  return (
    <div className="min-h-screen bg-[#05060a] text-neutral-50">
      <div className={pageClass("max-w-3xl")}>
        <div>
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-300">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">
            Learning Activity History
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Every solve, failure, Micro-Proof, revision, and mastery update — in order.
          </p>
        </div>

        <LearningSignalsList events={events} title="All Learning Signals" hideViewAll />
      </div>
    </div>
  );
}
