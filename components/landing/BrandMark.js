// Small glossy "lens" icon standing in for the second half of the
// "AlgoLens" wordmark — a literal optical lens, per the brand reference.
// Pure inline SVG, no image asset/dependency.
function LensIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="inline-block shrink-0 align-[-1px]"
    >
      <defs>
        <radialGradient id="algolens-lens" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="30%" stopColor="#60a5fa" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </radialGradient>
      </defs>
      <circle cx="8" cy="8" r="7" fill="url(#algolens-lens)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <ellipse cx="5.6" cy="5.2" rx="2.1" ry="1.2" fill="rgba(255,255,255,0.6)" transform="rotate(-30 5.6 5.2)" />
    </svg>
  );
}

// Composable brand mark: "Algo" + lens icon + "Lens". Deliberately carries
// no typography/color classes of its own — callers (Navbar, Footer) apply
// those via their own wrapping element so the mark fits each context.
export default function BrandMark() {
  return (
    <span className="inline-flex items-center gap-1">
      Algo
      <LensIcon />
      Lens
    </span>
  );
}
