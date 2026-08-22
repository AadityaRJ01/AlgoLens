import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRevisionOverview } from "@/lib/revisionInsights";
import { pageClass } from "@/lib/theme";
import EmptyState from "@/components/ui/EmptyState";
import RevisionPriorityCard from "@/components/revision/RevisionPriorityCard";
import RevisionQueue from "@/components/revision/RevisionQueue";
import RevisionHistory from "@/components/revision/RevisionHistory";

const TOP_PRIORITY_COUNT = 2;

// "What do I need to revise right now?" — priority items are the real,
// deterministic urgency ranking from rankConceptsByUrgency
// (lib/recommendations.js), never a plain "previously solved problems"
// list. See lib/revisionInsights.js for how this page's data is built.
export default async function RevisionPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { priorityItems, history } = await getRevisionOverview(userId);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-50">
      <div className={pageClass("max-w-4xl")}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">Revision</h1>
          <p className="mt-1 text-sm text-slate-400">Revisit the concepts you&apos;re most likely to forget.</p>
        </div>

        {priorityItems.length === 0 ? (
          <EmptyState
            tone="dark"
            message="You're all caught up — nothing urgently needs revision right now. Answer a Micro-Proof to build your learning profile."
            actionHref="/concepts"
            actionLabel="Answer a Micro-Proof"
          />
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Needs Revision</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {priorityItems.slice(0, TOP_PRIORITY_COUNT).map((item) => (
                  <RevisionPriorityCard key={item.concept} item={item} />
                ))}
              </div>
            </section>

            <RevisionQueue items={priorityItems} />
          </>
        )}

        <RevisionHistory history={history} />
      </div>
    </div>
  );
}
