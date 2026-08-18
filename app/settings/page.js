import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import LeetCodeSettings from "./LeetCodeSettings";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const account = await prisma.leetCodeAccount.findUnique({
    where: { clerkUserId: userId },
    include: {
      _count: {
        select: { submissions: true }
      }
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your connected accounts and preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">LeetCode Integration</h2>
          <p className="text-slate-500 mt-1">Connect your public LeetCode profile to import submissions.</p>
        </div>
        
        <div className="p-6 bg-slate-50">
          <LeetCodeSettings initialAccount={account} />
        </div>
      </div>
    </div>
  );
}
