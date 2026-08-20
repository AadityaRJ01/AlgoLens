import Link from "next/link";
import { CARD_PADDED, BTN_SECONDARY } from "@/lib/theme";

// Consistent "nothing here yet" card, used instead of a blank section
// anywhere a dashboard/page card has no data yet.
export default function EmptyState({ message, actionHref, actionLabel }) {
  return (
    <div className={`${CARD_PADDED} text-slate-600 text-sm`}>
      <p>{message}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={`inline-block mt-3 ${BTN_SECONDARY}`}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
