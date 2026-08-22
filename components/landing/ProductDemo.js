"use client";

import ScrollReveal from "./ScrollReveal";
import useInView from "./useInView";

// Purely decorative, hand-authored product screenshot for marketing
// purposes — not wired to the database or the real analysis engine (see
// lib/groq.js / lib/mastery.js / lib/recommendations.js for that).
const RECOMMENDED_PRACTICE = [
  { title: "3Sum", difficulty: "Medium", tone: "text-amber-400" },
  { title: "Container With Most Water", difficulty: "Medium", tone: "text-amber-400" },
  { title: "Trapping Rain Water", difficulty: "Hard", tone: "text-rose-400" },
];

// Large "real product screenshot" section demonstrating the actual failure
// analysis output — sits directly below the Hero, before the smaller
// four-panel FeatureShowcase grid. Reuses the same window-chrome/panel
// visual language as ProductPreview/FeatureShowcase for consistency.
export default function ProductDemo() {
  const [ref, isInView] = useInView({ threshold: 0.25 });

  return (
    <section
      aria-labelledby="product-demo-heading"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:py-32"
    >
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2
          id="product-demo-heading"
          className="text-3xl font-bold leading-tight tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent sm:text-4xl lg:text-5xl"
        >
          See What AlgoLens Finds.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base text-white sm:text-lg">
          Turn every failed submission into an actionable learning signal.
        </p>
      </ScrollReveal>

      <ScrollReveal delayMs={120} className="relative mt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[24rem] w-[44rem] -translate-x-1/2 rounded-full bg-blue-700/10 blur-[130px]"
        />

        <div
          ref={ref}
          className="landing-float mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl shadow-black/50 backdrop-blur-sm"
        >
          {/* browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/[0.02] px-5 py-4">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-3 rounded-md bg-white/5 px-3 py-1 text-xs text-neutral-500">
              algolens.app/submission/failed-analysis
            </span>
          </div>

          <div className="grid gap-px bg-white/5 sm:grid-cols-5">
            {/* left: root cause breakdown */}
            <div className="bg-neutral-900/90 px-6 py-6 sm:col-span-3 sm:px-8 sm:py-8">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span className="text-xs font-semibold tracking-wide text-neutral-400">
                  FAILURE ANALYSIS
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-neutral-50 sm:text-2xl">
                Why did I fail?
              </h3>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.07] px-4 py-3.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-rose-300">Root Cause</p>
                  <p className="mt-1 text-sm text-neutral-200">
                    Missing invariant — the two-pointer window never accounts for the case where
                    both ends need to shrink together.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm text-neutral-400">Concept</span>
                  <span className="text-sm font-medium text-neutral-100">Two Pointers</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Concept Mastery</span>
                  <span className="font-semibold text-neutral-100">68%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-[1100ms] ease-out"
                    style={{ width: isInView ? "68%" : "0%", transitionDelay: "150ms" }}
                  />
                </div>
              </div>
            </div>

            {/* right: recommended practice */}
            <div className="bg-neutral-900/70 px-6 py-6 sm:col-span-2 sm:px-6 sm:py-8">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="text-xs font-semibold tracking-wide text-neutral-400">
                  RECOMMENDED PRACTICE
                </span>
              </div>

              <ul className="mt-4 space-y-2.5">
                {RECOMMENDED_PRACTICE.map((problem) => (
                  <li
                    key={problem.title}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm"
                  >
                    <span className="font-medium text-neutral-100">{problem.title}</span>
                    <span className={`text-xs font-semibold ${problem.tone}`}>{problem.difficulty}</span>
                  </li>
                ))}
              </ul>

              <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Targets your weakest concept
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
