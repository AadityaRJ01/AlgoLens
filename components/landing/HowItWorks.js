import ScrollReveal from "./ScrollReveal";

const STEPS = [
  { number: "01", title: "SOLVE", description: "Solve DSA problems and build your coding history." },
  { number: "02", title: "ANALYZE", description: "Understand why your solution failed." },
  { number: "03", title: "UNDERSTAND", description: "Prove that you understand the underlying concept." },
  { number: "04", title: "IMPROVE", description: "Revise weak areas and practice the right problems next." },
];

// Serves as the real "#how-it-works" anchor target for the Hero's "See How
// It Works" button and the Navbar's "How It Works" link (both from Phase 1).
export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:py-32"
    >
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2
          id="how-it-works-heading"
          className="text-3xl font-bold leading-tight tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent sm:text-4xl lg:text-5xl"
        >
          How AlgoLens Works
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base text-white sm:text-lg">
          Every problem you solve becomes another signal about how you learn.
        </p>
      </ScrollReveal>

      <div className="relative mt-20">
        {/* connecting line, running behind the cards: vertical timeline on
            mobile, horizontal through the row on desktop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-400/25 to-transparent lg:left-0 lg:right-0 lg:top-1/2 lg:bottom-auto lg:h-px lg:w-auto lg:bg-gradient-to-r"
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex flex-1 items-center gap-3 lg:items-stretch">
              <ScrollReveal delayMs={i * 100} className="flex-1">
                <div className="group relative z-10 h-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 shadow-lg shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.07]">
                  <span className="bg-gradient-to-br from-indigo-300 to-blue-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent drop-shadow-[0_0_18px_rgba(99,102,241,0.55)]">
                    {step.number}
                  </span>
                  <h3 className="mt-3 text-base font-semibold tracking-wide text-neutral-50">{step.title}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{step.description}</p>
                </div>
              </ScrollReveal>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden shrink-0 self-center text-lg leading-none text-white/15 lg:block"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
