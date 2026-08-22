import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

// Closing CTA. Reuses the Hero's established primary-button treatment
// (Phase 1) for consistency. The panel background carries a richer
// dark-to-blue-violet gradient than the rest of the page's flat surfaces,
// so this closing section reads as the most "charged" moment on the page.
export default function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[26rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/25 blur-[120px]"
      />

      <ScrollReveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-indigo-400/20 bg-gradient-to-br from-indigo-950 via-[#0c0a22] to-violet-950/80 px-6 py-16 text-center shadow-2xl shadow-black/50 sm:px-12 sm:py-20">
          <h2
            id="final-cta-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl"
          >
            Stop Solving Randomly.
            <br />
            <span className="text-indigo-300">START LEARNING DELIBERATELY.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-neutral-400 sm:text-lg">
            Build a deeper understanding of DSA with a learning system that adapts to your
            strengths and weaknesses.
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 outline-none transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              <span
                aria-hidden="true"
                className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-indigo-500/50 to-blue-500/50 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
              />
              Start with AlgoLens
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
