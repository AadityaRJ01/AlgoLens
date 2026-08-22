"use client";

import { useEffect, useRef, useState } from "react";

// Shared "has this element entered the viewport yet" hook used to gate
// one-shot entrance animations (progress bars filling, node illumination)
// across the landing page's product-preview panels. Fires once and then
// disconnects — these are entrance animations, not scroll-linked effects.
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
      setIsInView(true);
      return;
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
