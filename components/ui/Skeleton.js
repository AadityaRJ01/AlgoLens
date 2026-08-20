// Minimal pulse-skeleton primitives for route-level loading.js files.
// No client JS — just a CSS animation via Tailwind's `animate-pulse`.

export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-3">
      <SkeletonBlock className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}
