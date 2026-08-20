"use client";

export default function GlobalError({ error, reset }) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white border border-rose-200 rounded-xl shadow-sm p-6 text-center space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
        <p className="text-sm text-slate-600">
          This page hit an unexpected error. Please try again.
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
