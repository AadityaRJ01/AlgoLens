import { STATUS_STYLES, STATUS_LABELS } from "@/lib/theme";

// Generic pill badge. Pass either a raw `className` + `children`, or a
// mastery `status` ("STRONG"/"DEVELOPING"/"WEAK") to get the app-wide
// semantic color for free.
export default function Badge({ status, className, children }) {
  const style = className || STATUS_STYLES[status] || STATUS_STYLES.NEUTRAL;
  const label = children ?? STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${style}`}>
      {label}
    </span>
  );
}
