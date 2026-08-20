"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/recommendations/generate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to refresh recommendations.");
      }

      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isRefreshing ? "Refreshing..." : "Refresh Recommendations"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
