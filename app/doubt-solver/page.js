import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DoubtSolverWorkspace from "./DoubtSolverWorkspace";

export default async function DoubtSolverPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Doubt Solver</h1>
        <p className="text-slate-600 mt-1">
          Stuck on a problem? Get progressively stronger hints — you stay responsible for solving it.
        </p>
      </div>
      <DoubtSolverWorkspace />
    </div>
  );
}
