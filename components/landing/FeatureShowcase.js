import ScrollReveal from "./ScrollReveal";

// Purely decorative, hand-authored product visualizations for marketing
// purposes. None of this data is real or wired to the database — see
// lib/mastery.js, lib/revision.js, lib/recommendations.js, and lib/groq.js
// for the actual engines behind these features inside the authenticated app.
const MASTERY_ROWS = [
  { concept: "Two Pointers", value: 68, tone: "from-blue-500 to-indigo-500" },
  { concept: "Greedy", value: 82, tone: "from-emerald-500 to-blue-500" },
  { concept: "Dynamic Programming", value: 41, tone: "from-rose-500 to-orange-400" },
];

function PanelChrome({ label }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-4">
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      <span className="ml-3 text-xs text-neutral-500">{label}</span>
    </div>
  );
}

function PanelShell({ eyebrow, eyebrowTone, title, glowTone, children }) {
  return (
    <div className="group relative h-full">
      <div
        aria-hidden="true"
        className={`absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br ${glowTone} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-neutral-900/70 shadow-xl shadow-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1">
        <PanelChrome label="AlgoLens" />
        <div className="flex flex-1 flex-col gap-4 px-6 py-6">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${eyebrowTone}`} />
            <span className="text-xs font-semibold tracking-wide text-neutral-400">{eyebrow}</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-50">{title}</h3>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FailureAnalysisPanel() {
  return (
    <PanelShell
      eyebrow="FAILURE ANALYSIS"
      eyebrowTone="bg-rose-400"
      title="Why did I fail?"
      glowTone="from-rose-600/30 via-orange-500/10 to-transparent"
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-300">Root Cause</p>
          <p className="mt-1 text-sm text-neutral-200">Missing invariant</p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span className="text-neutral-400">Concept</span>
          <span className="font-medium text-neutral-100">Two Pointers</span>
        </div>
      </div>
    </PanelShell>
  );
}

function ConceptMasteryPanel() {
  return (
    <PanelShell
      eyebrow="CONCEPT MASTERY"
      eyebrowTone="bg-indigo-400"
      title="Your understanding, quantified"
      glowTone="from-indigo-600/30 via-blue-500/10 to-transparent"
    >
      <div className="space-y-3.5">
        {MASTERY_ROWS.map((row) => (
          <div key={row.concept}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-300">{row.concept}</span>
              <span className="font-semibold text-neutral-100">{row.value}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${row.tone}`}
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function MicroProofsPanel() {
  return (
    <PanelShell
      eyebrow="MICRO-PROOFS"
      eyebrowTone="bg-violet-400"
      title="Prove you understand it"
      glowTone="from-violet-600/30 via-indigo-500/10 to-transparent"
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-sm italic text-neutral-200">
            &ldquo;Why can the heaviest person be considered first?&rdquo;
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Concept understanding check
        </span>
      </div>
    </PanelShell>
  );
}

function RecommendationsPanel() {
  return (
    <PanelShell
      eyebrow="PERSONALIZED RECOMMENDATIONS"
      eyebrowTone="bg-blue-400"
      title="Recommended next"
      glowTone="from-blue-600/30 via-violet-500/10 to-transparent"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm font-semibold text-neutral-100">3Sum</span>
          <span className="text-xs font-semibold text-amber-400">Medium</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Target</span>
          <span className="font-medium text-neutral-100">Two Pointers</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Priority</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
            High
          </span>
        </div>
      </div>
    </PanelShell>
  );
}

// Feature showcase — sits directly below the (untouched) Hero. Also serves
// as the real "#features" anchor target for the Navbar/Hero links.
export default function FeatureShowcase() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="landing-glow-drift pointer-events-none absolute left-1/2 top-0 -z-10 h-[28rem] w-[42rem] rounded-full bg-indigo-700/10 blur-[140px]"
      />

      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2
          id="features-heading"
          className="text-3xl font-bold leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-5xl"
        >
          Your Mistakes Become
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            Learning Signals.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base text-white sm:text-lg">
          AlgoLens connects your failures, concepts, mastery, revision, and practice into one
          continuous learning system.
        </p>
      </ScrollReveal>

      <div className="relative mt-16">
        {/* connecting line behind the cards: vertical on mobile, horizontal
            through the row on desktop — same treatment as How It Works,
            reinforcing that this is one flow, not four unrelated features */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-rose-400/20 via-indigo-400/20 to-blue-400/20 lg:left-0 lg:right-0 lg:top-1/2 lg:bottom-auto lg:h-px lg:w-auto lg:bg-gradient-to-r"
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {[FailureAnalysisPanel, ConceptMasteryPanel, MicroProofsPanel, RecommendationsPanel].map(
            (Panel, i, arr) => (
              <div key={Panel.name} className="flex flex-1 items-center gap-3 lg:items-stretch">
                <ScrollReveal delayMs={i * 90} className="flex-1">
                  <Panel />
                </ScrollReveal>
                {i < arr.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden shrink-0 self-center text-lg leading-none text-white/15 lg:block"
                  >
                    →
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
