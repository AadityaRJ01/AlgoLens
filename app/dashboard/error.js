"use client";

import { DARK_BTN_PRIMARY } from "@/lib/theme";

export default function DashboardError({ error, reset }) {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="rounded-xl border border-rose-400/20 bg-slate-900/60 p-6 text-center space-y-3">
          <h2 className="text-lg font-semibold text-slate-50">Couldn&apos;t load your dashboard</h2>
          <p className="text-sm text-slate-400">
            Something went wrong while loading your learning overview. Your data is safe — please try again.
          </p>
          <button onClick={() => reset()} className={DARK_BTN_PRIMARY}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
