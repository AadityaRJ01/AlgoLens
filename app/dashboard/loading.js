function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

function SkeletonCard({ className = "", lines = 3 }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-neutral-900/60 p-5 sm:p-6 space-y-3 ${className}`}>
      <SkeletonBlock className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#05060a]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="h-8 w-8 rounded-full" />
        </div>

        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-neutral-900/60 p-5 space-y-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-7 w-14" />
            </div>
          ))}
        </div>

        <SkeletonCard lines={2} />
      </div>
    </div>
  );
}
