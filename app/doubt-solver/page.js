import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DoubtSolverWorkspace from "./DoubtSolverWorkspace";
import { pageClass } from "@/lib/theme";

export default async function DoubtSolverPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className={pageClass("max-w-4xl")}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">AI Doubt Solver</h1>
        <p className="text-slate-600 mt-1">
          Stuck on a problem? Get progressively stronger hints — you stay responsible for solving it.
        </p>
      </div>
      <DoubtSolverWorkspace />
    </div>
  );
}
