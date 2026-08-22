import Link from "next/link";
import { CARD_PADDED, BTN_SECONDARY, DARK_CARD_PADDED, DARK_BTN_SECONDARY } from "@/lib/theme";

// Consistent "nothing here yet" card, used instead of a blank section
// anywhere a dashboard/page card has no data yet. Pass `tone="dark"` on the
// dark (dashboard-family) pages to get the dark-surface variant.
export default function EmptyState({ message, actionHref, actionLabel, tone }) {
  const isDark = tone === "dark";
  return (
    <div className={`${isDark ? DARK_CARD_PADDED : CARD_PADDED} text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
      <p>{message}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={`inline-block mt-3 ${isDark ? DARK_BTN_SECONDARY : BTN_SECONDARY}`}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
