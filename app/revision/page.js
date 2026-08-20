import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { CARD_PADDED, BTN_PRIMARY, pageClass } from "@/lib/theme";

const STATUS_EMOJI = { STRONG: "🟢", DEVELOPING: "🟡", WEAK: "🔴" };

function ScheduleCard({ schedule }) {
  const status = schedule.mastery?.status;

  return (
    <li className={`${CARD_PADDED} p-5`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span aria-hidden="true">{STATUS_EMOJI[status] || "⚪"}</span>
          {schedule.concept}
        </h3>
        <Badge status={status}>Mastery: {schedule.mastery?.masteryScore ?? "—"}%</Badge>
      </div>
      <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
        <span>Last score: {schedule.lastScore}/10</span>
        <span>Review count: {schedule.reviewCount}</span>
        <span>Next review: {new Date(schedule.nextReviewAt).toLocaleDateString()}</span>
      </div>
      <Link href={`/revision/${encodeURIComponent(schedule.concept)}`} className={`inline-block mt-3 ${BTN_PRIMARY}`}>
        Review
      </Link>
    </li>
  );
}

export default async function RevisionPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const schedules = await prisma.revisionSchedule.findMany({
    where: { clerkUserId: userId },
    include: { mastery: true },
    orderBy: { nextReviewAt: "asc" },
  });

  const now = new Date();
  const due = schedules.filter((s) => s.nextReviewAt <= now);
  const upcoming = schedules.filter((s) => s.nextReviewAt > now);

  return (
    <div className={pageClass("max-w-4xl")}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Revision Queue</h1>
        <p className="text-slate-600 mt-1">
          Weak concepts come back sooner, strong concepts come back later — scheduled
          automatically from your Micro-Proof performance and Concept Mastery.
        </p>
      </div>

      {schedules.length === 0 && (
        <EmptyState
          message="No revision schedule yet. Answer a Micro-Proof to start one."
          actionHref="/concepts"
          actionLabel="Answer a Micro-Proof"
        />
      )}

      {schedules.length > 0 && due.length === 0 && (
        <p className="text-sm text-slate-600">You&apos;re all caught up. Nothing is due for revision right now.</p>
      )}

      {due.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Due Now</h2>
          <ul className="space-y-3">
            {due.map((s) => (
              <ScheduleCard key={s.id} schedule={s} />
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Upcoming</h2>
          <ul className="space-y-3">
            {upcoming.map((s) => (
              <ScheduleCard key={s.id} schedule={s} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
