import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
        AlgoCompass
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl">
        Your AI-powered competitive programming companion. Master algorithms and ace your coding interviews.
      </p>
      <div className="flex gap-4 justify-center">
        <Link 
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all"
        >
          Get Started
        </Link>
        <Link 
          href="/dashboard"
          className="bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-8 rounded-lg shadow-sm border border-slate-200 transition-all"
        >
          Try Demo
        </Link>
      </div>
    </div>
  );
}
