import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-900 text-slate-100 p-4 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">AlgoCompass</Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link href="/recommendations" className="hover:text-blue-400 transition-colors">Recommendations</Link>
          <Link href="/revision" className="hover:text-blue-400 transition-colors">Revision</Link>
          <Link href="/doubt-solver" className="hover:text-blue-400 transition-colors">Doubt Solver</Link>
          <Link href="/settings" className="hover:text-blue-400 transition-colors">Settings</Link>
        </div>
      </div>
    </nav>
  );
}
