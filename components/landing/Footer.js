import Link from "next/link";
import BrandMark from "./BrandMark";

const FOOTER_ANCHOR_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
];

// Minimal footer. No social links — none exist for this product.
export default function Footer() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="max-w-xs">
            <span className="text-xl font-semibold tracking-tight text-neutral-50">
              <BrandMark />
            </span>
            <p className="mt-2 text-sm text-neutral-500">
              Personalized DSA learning built around how you actually learn.
            </p>
          </div>

          <nav aria-label="Footer" className="flex items-center gap-6">
            {FOOTER_ANCHOR_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-sm text-sm text-neutral-400 outline-none transition-colors hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/sign-in"
              className="rounded-sm text-sm text-neutral-400 outline-none transition-colors hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              Sign In
            </Link>
          </nav>
        </div>

        <p className="mt-10 text-center text-xs text-neutral-600 sm:text-left">© 2026 AlgoLens</p>
      </div>
    </footer>
  );
}
