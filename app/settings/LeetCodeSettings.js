"use client";

import { useState } from "react";

export default function LeetCodeSettings({ initialAccount }) {
  const [username, setUsername] = useState(initialAccount?.username || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState(null);

  const handleSync = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSyncing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/leetcode/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sync");
      }

      setMessage({ type: "success", text: `Successfully synced ${data.importedSubmissions} submissions.` });
      setStats(data.stats);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSync} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
            LeetCode Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. neetcode"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={isSyncing}
          />
        </div>
        <button
          type="submit"
          disabled={isSyncing || !username}
          className="w-full sm:w-auto px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSyncing ? "Syncing..." : "Sync Data"}
        </button>
      </form>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Show Initial Stats if available, or updated stats after sync */}
      {(stats || initialAccount) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500 font-medium">Total Solved</div>
            <div className="text-2xl font-bold text-slate-900">{stats ? stats.totalSolved : '-'}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500 font-medium">Easy</div>
            <div className="text-2xl font-bold text-emerald-600">{stats ? stats.easySolved : '-'}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500 font-medium">Medium</div>
            <div className="text-2xl font-bold text-amber-500">{stats ? stats.mediumSolved : '-'}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500 font-medium">Hard</div>
            <div className="text-2xl font-bold text-rose-500">{stats ? stats.hardSolved : '-'}</div>
          </div>
        </div>
      )}
      
      {initialAccount && !stats && (
        <div className="text-sm text-slate-500 mt-4">
          <p>Imported Submissions: {initialAccount._count?.submissions || 0}</p>
          <p>Last Synced: {new Date(initialAccount.lastSyncedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
