import { UserButton } from "@clerk/nextjs";
import { FlameIcon } from "@/components/icons";

// Compact product-dashboard header — deliberately restrained next to the
// landing page's hero (see AGENTS instructions: "dashboard = product, not
// marketing"). streakDays is real, derived in lib/dashboard.js from actual
// submission/attempt timestamps — never fabricated.
export default function PageHeader({ greeting, name, subtitle, streakDays }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-50 sm:text-2xl">
          {greeting}
          {name ? `, ${name}` : ""} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {streakDays > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <FlameIcon width={14} height={14} />
            {streakDays} day{streakDays === 1 ? "" : "s"}
          </span>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}
