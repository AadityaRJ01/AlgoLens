"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";

// Anchor links into the Features and How It Works sections below.
const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
];

// Shared keyboard-focus treatment for every plain-text interactive element
// on the landing page (branded ring, since the near-black background makes
// each browser's default focus outline look inconsistent/low-contrast).
const FOCUS_RING =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";

// Minimal marketing navbar for the public landing page only. The
// authenticated app's own navigation (components/Sidebar.js) is untouched
// and keeps rendering on every other route via components/AppShell.js.
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 border-b transition-colors duration-300 ${
        isScrolled
          ? "border-white/10 bg-[#05060a]/75 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <Link href="/" className={`text-lg font-semibold tracking-tight text-neutral-50 ${FOCUS_RING}`}>
          <BrandMark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm text-neutral-400 transition-colors hover:text-neutral-100 ${FOCUS_RING}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/sign-in"
            className={`text-sm font-medium text-neutral-300 transition-colors hover:text-neutral-100 ${FOCUS_RING}`}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-950/40 outline-none transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-900/50 focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
