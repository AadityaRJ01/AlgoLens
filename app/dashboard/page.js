import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-4 text-slate-600">Your User ID: {userId}</p>
    </div>
  );
}
