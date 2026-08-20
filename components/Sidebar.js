import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/mastery", label: "Mastery" },
  { href: "/revision", label: "Revision" },
  { href: "/recommendations", label: "Practice" },
  { href: "/failures", label: "Failure Analysis" },
  { href: "/concepts", label: "Micro-Proofs" },
  { href: "/doubt-solver", label: "AI Doubt Solver" },
  { href: "/settings", label: "Settings" },
];

// Server-rendered navigation shell: a fixed left sidebar at md+, and a
// top bar + checkbox-toggled dropdown menu below md — no client JS needed
// for the mobile menu (pure CSS peer-checked toggle).
export default async function Sidebar() {
  const { userId } = await auth();

  return (
    <>
      <div className="md:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-900 text-slate-100 px-4 py-3 border-b border-slate-800">
          <Link href="/" className="text-lg font-bold tracking-tight text-white">
            AlgoLens
          </Link>
          <div className="flex items-center gap-4">
            {userId ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link href="/sign-in" className="text-sm font-medium hover:text-blue-400 transition-colors">
                Sign In
              </Link>
            )}
            <label
              htmlFor="nav-toggle"
              className="cursor-pointer p-1"
              aria-label="Toggle navigation menu"
            >
              <span className="block w-6 h-0.5 bg-slate-100 mb-1.5" />
              <span className="block w-6 h-0.5 bg-slate-100 mb-1.5" />
              <span className="block w-6 h-0.5 bg-slate-100" />
            </label>
          </div>
        </header>

        <input type="checkbox" id="nav-toggle" className="peer hidden" />
        <nav className="hidden peer-checked:flex flex-col bg-slate-900 text-slate-100 px-4 py-2 border-b border-slate-800 sticky top-[49px] z-20">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2.5 text-sm font-medium border-b border-slate-800 last:border-0 hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {!userId && (
            <Link href="/sign-up" className="py-2.5 text-sm font-medium text-blue-400">
              Sign Up
            </Link>
          )}
        </nav>
      </div>

      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 bg-slate-900 text-slate-100 min-h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            AlgoLens
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800">
          {userId ? (
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <span className="text-xs text-slate-400">Account</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/sign-in" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-center bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-white text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
