import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

const STATUS_META = {
  STRONG: { emoji: "🟢", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DEVELOPING: { emoji: "🟡", style: "bg-amber-50 text-amber-700 border-amber-200" },
  WEAK: { emoji: "🔴", style: "bg-rose-50 text-rose-700 border-rose-200" },
};

function ScheduleCard({ schedule }) {
  const meta = STATUS_META[schedule.mastery?.status] || { emoji: "⚪", style: "bg-slate-50 text-slate-600 border-slate-200" };

  return (
    <li className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span>{meta.emoji}</span>
          {schedule.concept}
        </h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.style}`}>
          Mastery: {schedule.mastery?.masteryScore ?? "—"}%
        </span>
      </div>
      <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
        <span>Last score: {schedule.lastScore}/10</span>
        <span>Review count: {schedule.reviewCount}</span>
        <span>Next review: {new Date(schedule.nextReviewAt).toLocaleDateString()}</span>
      </div>
      <Link
        href={`/revision/${encodeURIComponent(schedule.concept)}`}
        className="inline-block mt-3 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
      >
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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Revision Queue</h1>
        <p className="text-slate-600 mt-1">
          Weak concepts come back sooner, strong concepts come back later — scheduled
          automatically from your Micro-Proof performance and Concept Mastery.
        </p>
      </div>

      {schedules.length === 0 && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600">
          No revision schedule yet.{" "}
          <Link href="/concepts" className="text-blue-600 hover:underline font-medium">
            Answer a Micro-Proof
          </Link>{" "}
          to start one.
        </div>
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
