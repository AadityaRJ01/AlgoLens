import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import SidebarNav from "./SidebarNav";

// Server-rendered shell: resolves auth once here (server-only) and hands the
// interactive nav (active-link state, mobile menu) to the client component
// SidebarNav. Rendered by AppShell on every route except the landing page,
// including signed-out routes like /sign-in — hence the `userId` branch.
export default async function Sidebar() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  const profileSlot = userId ? (
    <div className="flex items-center gap-3">
      <UserButton afterSignOutUrl="/" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-200">
          {user?.firstName || "Your account"}
        </p>
        <p className="truncate text-xs text-neutral-500">Profile</p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <Link href="/sign-in" className="text-sm font-medium text-neutral-300 transition-colors hover:text-neutral-100">
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-3 py-1.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Sign Up
      </Link>
    </div>
  );

  return <SidebarNav profileSlot={profileSlot} />;
}
