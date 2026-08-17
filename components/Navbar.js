import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="w-full bg-slate-900 text-slate-100 p-4 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">AlgoLens</Link>
        <div className="flex gap-6 text-sm font-medium items-center">
          <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link href="/recommendations" className="hover:text-blue-400 transition-colors">Recommendations</Link>
          <Link href="/revision" className="hover:text-blue-400 transition-colors">Revision</Link>
          <Link href="/doubt-solver" className="hover:text-blue-400 transition-colors">Doubt Solver</Link>
          <Link href="/settings" className="hover:text-blue-400 transition-colors">Settings</Link>
          {!userId ? (
            <>
              <Link href="/sign-in" className="hover:text-blue-400 transition-colors">Sign In</Link>
              <Link href="/sign-up" className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-white transition-colors">Sign Up</Link>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </nav>
  );
}
