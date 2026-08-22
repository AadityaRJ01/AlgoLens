import { STATUS_STYLES, STATUS_LABELS, DARK_STATUS_STYLES } from "@/lib/theme";

// Generic pill badge. Pass either a raw `className` + `children`, or a
// mastery `status` ("STRONG"/"DEVELOPING"/"WEAK") to get the app-wide
// semantic color for free. Pass `tone="dark"` on the dark (dashboard-family)
// pages to get the dark-surface variant of the same semantic colors.
export default function Badge({ status, className, children, tone }) {
  const palette = tone === "dark" ? DARK_STATUS_STYLES : STATUS_STYLES;
  const style = className || palette[status] || palette.NEUTRAL;
  const label = children ?? STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${style}`}>
      {label}
    </span>
  );
}
