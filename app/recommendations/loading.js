import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";

export default function RecommendationsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <SkeletonBlock className="h-8 w-72" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}
