"use client";

import { useEffect, useRef, useState } from "react";

// Shared "has this element entered the viewport yet" hook used to gate
// one-shot entrance animations (progress bars filling, etc.) across the
// dashboard-family pages. Fires once and then disconnects.
export default function useInView({ threshold = 0.3 } = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      // Deferred a frame (rather than called synchronously here) so this
      // doesn't trigger a same-effect cascading render.
      const frame = requestAnimationFrame(() => setIsInView(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView];
}
