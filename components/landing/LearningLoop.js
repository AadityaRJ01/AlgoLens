"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "./ScrollReveal";

const LOOP_STEPS = [
  "PROBLEM",
  "FAILURE",
  "CONCEPT",
  "MICRO-PROOF",
  "MASTERY",
  "REVISION",
  "RECOMMENDATION",
  "IMPROVEMENT",
];

// Decorative "loop closes back to the top" connector, drawn along the right
// edge of the node column. Uses a generous strokeDasharray (comfortably
// larger than the path's actual length in viewBox units) so the classic
// dash-offset reveal trick works without needing to measure real path
// length. Progress (0-1) tracks how many nodes have been illuminated.
function LoopBackConnector({ progress }) {
  const DASH = 260;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -right-1 top-0 hidden h-full w-10 sm:-right-6 sm:block sm:w-14"
    >
      <defs>
        <linearGradient id="loop-back-gradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.85" />
        </linearGradient>
        <marker id="loop-back-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#818cf8" />
        </marker>
      </defs>
      <path
        d="M10,92 C34,92 34,8 10,8"
        fill="none"
        stroke="url(#loop-back-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        markerEnd="url(#loop-back-arrow)"
        style={{
          strokeDasharray: DASH,
          strokeDashoffset: DASH * (1 - progress),
          transition: "stroke-dashoffset 0.5s ease-out",
        }}
      />
    </svg>
  );
}

// Visually distinctive "system diagram" section: the loop sits inside its
// own bordered, glowing, dotted-grid panel so it reads as a different kind
// of section from the plain-background Hero/FeatureShowcase/HowItWorks
// above it — reinforcing "loop, not a list" rather than another feature row.
//
// Nodes progressively illuminate (and stay lit) as the user scrolls past
// them, and a curved connector along the right edge "draws itself in" at
// the same pace, closing from IMPROVEMENT back up toward PROBLEM to
// communicate the continuous loop.
export default function LearningLoop() {
  const nodeRefs = useRef([]);
  const [litCount, setLitCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setLitCount(LOOP_STEPS.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.dataset.index);
          setLitCount((prev) => Math.max(prev, index + 1));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -45% 0px" }
    );

    nodeRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="learning-loop-heading"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:py-32"
    >
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2
          id="learning-loop-heading"
          className="text-3xl font-bold leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl"
        >
          A Learning Loop,
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            NOT A PROBLEM LIST.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-400 sm:text-lg">
          Your mistakes shape what you learn next.
        </p>
      </ScrollReveal>

      <ScrollReveal delayMs={120} className="relative mt-16">
        <div
          aria-hidden="true"
          className="landing-glow-drift pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[26rem] w-[26rem] rounded-full bg-violet-700/15 blur-[130px]"
        />

        <div className="landing-schematic-grid relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/40 px-6 py-16 shadow-2xl shadow-black/40 backdrop-blur-sm sm:px-10">
          <div className="relative mx-auto max-w-xs sm:max-w-sm">
            {/* thin central connecting line running through every node */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-indigo-400/30 to-transparent"
            />

            <LoopBackConnector progress={litCount / LOOP_STEPS.length} />

            <div className="relative flex flex-col items-center gap-3">
              {LOOP_STEPS.map((label, i) => {
                const isLit = i < litCount;
                return (
                  <div key={label} className="contents">
                    <div
                      ref={(el) => (nodeRefs.current[i] = el)}
                      data-index={i}
                      className={`relative z-10 inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 backdrop-blur-sm transition-all duration-500 ${
                        isLit
                          ? "border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_24px_-6px_rgba(129,140,248,0.9)]"
                          : "border-white/10 bg-white/5 shadow-[0_0_20px_-8px_rgba(129,140,248,0.35)]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-all duration-500 ${
                          isLit
                            ? "bg-indigo-400 shadow-[0_0_10px_2px_rgba(129,140,248,0.9)]"
                            : "bg-white/20"
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold tracking-[0.15em] transition-colors duration-500 ${
                          isLit ? "text-neutral-50" : "text-neutral-500"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < LOOP_STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`relative z-10 text-sm leading-none transition-colors duration-500 ${
                          isLit ? "text-indigo-300/60" : "text-white/20"
                        }`}
                      >
                        &#8964;
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="relative z-10 mx-auto mt-8 max-w-sm text-center text-xs text-neutral-500">
              <span aria-hidden="true" className="mr-1">↻</span>
              Improvement feeds directly back into your next problem — the loop never stops.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
