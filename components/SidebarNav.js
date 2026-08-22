"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  AnalyzeIcon,
  ProblemsIcon,
  MasteryIcon,
  RevisionIcon,
  ConceptsIcon,
  DoubtIcon,
  RecommendationsIcon,
  SettingsIcon,
} from "@/components/icons";

const ICONS = {
  DashboardIcon,
  AnalyzeIcon,
  ProblemsIcon,
  MasteryIcon,
  RevisionIcon,
  ConceptsIcon,
  DoubtIcon,
  RecommendationsIcon,
  SettingsIcon,
};

// Primary nav (top): the core learning loop. "LEARNING" group: the
// supporting/analysis surfaces around it. Every href maps to a real,
// existing route — nothing here is a placeholder link.
const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "DashboardIcon" },
  { href: "/analyze", label: "Analyze", icon: "AnalyzeIcon" },
  { href: "/problems", label: "Problems", icon: "ProblemsIcon" },
  { href: "/mastery", label: "Mastery", icon: "MasteryIcon" },
  { href: "/revision", label: "Revision", icon: "RevisionIcon" },
];

const LEARNING_LINKS = [
  { href: "/recommendations", label: "Recommendations", icon: "RecommendationsIcon" },
  { href: "/concepts", label: "Micro-Proofs", icon: "ConceptsIcon" },
  { href: "/doubt-solver", label: "AI Doubt Solver", icon: "DoubtIcon" },
];

const BOTTOM_LINKS = [{ href: "/settings", label: "Settings", icon: "SettingsIcon" }];

function isActive(pathname, href) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label, icon, pathname, onNavigate }) {
  const Icon = ICONS[icon];
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-500/10 text-slate-50 ring-1 ring-inset ring-indigo-400/25"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      }`}
    >
      <Icon className={active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// Shared nav body used inside both the desktop rail and the mobile sheet.
function NavBody({ pathname, onNavigate }) {
  return (
    <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
      <div className="space-y-1">
        {PRIMARY_LINKS.map((link) => (
          <NavLink key={link.href} {...link} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="my-4 border-t border-slate-800" />
      <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-600">LEARNING</p>
      <div className="space-y-1">
        {LEARNING_LINKS.map((link) => (
          <NavLink key={link.href} {...link} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="my-4 border-t border-slate-800" />
      <div className="space-y-1">
        {BOTTOM_LINKS.map((link) => (
          <NavLink key={link.href} {...link} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </div>
    </nav>
  );
}

// Client-side nav body (needs usePathname for active-link state) + mobile
// menu behavior. `profileSlot` is the Clerk UserButton/sign-in links,
// rendered server-side by Sidebar.js and passed through as a node so this
// component doesn't need to know about auth.
export default function SidebarNav({ profileSlot }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close the mobile sheet on route change. Adjusting state during render
  // (rather than in an effect) per https://react.dev/learn/you-might-not-need-an-effect
  // avoids an extra post-commit render pass.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-[#0D1220]/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-slate-50">
          AlgoLens
        </Link>
        <div className="flex items-center gap-3">
          {profileSlot}
          <button
            type="button"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileOpen}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5 hover:text-slate-100"
          >
            {isMobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {isMobileOpen && (
        <div className="flex max-h-[70vh] flex-col border-b border-slate-800 bg-[#0D1220] md:hidden">
          <NavBody pathname={pathname} onNavigate={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-[#0D1220] md:flex">
        <div className="border-b border-slate-800 px-5 py-5">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-slate-50">
            AlgoLens
          </Link>
        </div>

        <NavBody pathname={pathname} />

        <div className="border-t border-slate-800 px-4 py-4">{profileSlot}</div>
      </aside>
    </>
  );
}
