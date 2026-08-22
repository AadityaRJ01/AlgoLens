function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

function SkeletonCard({ lines = 2 }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
      <SkeletonBlock className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}

export default function MasteryLoading() {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <SkeletonBlock className="h-8 w-56" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      </div>
    </div>
  );
}
