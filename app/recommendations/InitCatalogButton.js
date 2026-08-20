"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InitCatalogButton() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/catalog/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize the problem catalog.");
      }

      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSyncing ? "Initializing catalog..." : "Initialize Problem Catalog"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
