import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

export default function RevisionLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SkeletonBlock className="h-8 w-56" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
