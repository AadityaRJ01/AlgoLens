"use client";

export default function DashboardError({ error, reset }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="bg-white border border-rose-200 rounded-xl shadow-sm p-6 text-center space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Couldn&apos;t load your dashboard</h2>
        <p className="text-sm text-slate-600">
          Something went wrong while loading your learning overview. Your data is safe — please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
