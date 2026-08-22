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
    <div className="min-h-screen bg-[#0B0F17] text-slate-50">
      <div className={pageClass("max-w-7xl")}>
        <DoubtSolverWorkspace />
      </div>
    </div>
  );
}
