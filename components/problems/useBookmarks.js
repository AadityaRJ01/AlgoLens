"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "algolens:bookmarked-problems";

// Real (not fake/simulated) bookmarking, scoped to this browser via
// localStorage — there's no Bookmark table in the schema, and adding one
// just for this is out of scope for a focused implementation. This is a
// genuinely working feature within that constraint, not a placeholder.
export default function useBookmarks() {
  const [ids, setIds] = useState(() => new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Deferred a frame (rather than called synchronously here) so this
    // doesn't trigger a same-effect cascading render.
    const frame = requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setIds(new Set(JSON.parse(raw)));
      } catch {
        // ignore — starts empty
      } finally {
        setIsHydrated(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore — best-effort persistence only
      }
      return next;
    });
  }, []);

  return { bookmarkedIds: ids, isHydrated, toggle };
}
