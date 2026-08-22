import Link from "next/link";
import ProductPreview from "./ProductPreview";

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8 sm:pt-16 lg:pb-32">
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
        <div className="landing-animate-in text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-indigo-300">
            AI-POWERED DSA LEARNING
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-neutral-50 sm:text-5xl lg:text-6xl">
            Master DSA.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              Understand Why.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-neutral-400 sm:text-lg lg:mx-0">
            Turn every failed submission into a learning signal. AlgoLens analyzes your
            mistakes, measures your concept mastery, and tells you what to practice next.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 outline-none transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              <span
                aria-hidden="true"
                className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-indigo-500/50 to-blue-500/50 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
              />
              Get Started
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-neutral-200 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="landing-animate-in landing-animate-in-delay-2">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
