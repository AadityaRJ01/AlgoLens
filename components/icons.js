// Minimal hand-rolled inline SVG icon set for the authenticated app shell.
// No icon library exists in package.json yet (see BrandMark.js for the same
// pattern on the landing page), so these stay dependency-free rather than
// pulling one in for ~12 glyphs. Each is a plain 20x20 stroke icon that
// inherits color via currentColor.
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export function DashboardIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="12" width="8" height="9" rx="1.5" />
      <rect x="3" y="14" width="8" height="7" rx="1.5" />
    </svg>
  );
}

export function AnalyzeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function ProblemsIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  );
}

export function MasteryIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function RevisionIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12a8 8 0 0 1 13.9-5.4M20 12a8 8 0 0 1-13.9 5.4" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </svg>
  );
}

export function ConceptsIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 8.5 4.9v8.2L12 21l-8.5-4.9V7.9L12 3Z" />
      <path d="M12 3v9M3.5 7.9 12 12l8.5-4.1M12 12v9" />
    </svg>
  );
}

export function DoubtIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4h16v12H8l-4 4V4Z" />
      <path d="M9.2 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.2.8-1.2 1.7" />
      <circle cx="11.7" cy="16.3" r="0.4" fill="currentColor" />
    </svg>
  );
}

export function RecommendationsIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v2.5M12 18.5V21M4.2 4.2l1.8 1.8M18 18l1.8 1.8M3 12h2.5M18.5 12H21M4.2 19.8 6 18M18 6l1.8-1.8" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a7.7 7.7 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-1.7-1L15 3.6h-4l-.4 2.4a7.6 7.6 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9c.5.4 1.1.75 1.7 1l.4 2.4h4l.4-2.4c.6-.25 1.2-.6 1.7-1l2.3.9 2-3.4-2-1.5Z" />
    </svg>
  );
}

export function ProfileIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function FlameIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1.5-.7-2.3-1.3-3.1.6 2-.6 3.1-1.7 3.1-1.4 0-2-1.1-1.7-2.6.3-1.6-.3-3.2-1.3-4.4Z" />
      <path d="M8.5 13.5c-.6 1-.9 1.9-.9 3a4.4 4.4 0 0 0 8.8 0c0-1.6-.6-2.7-1.3-3.6" />
    </svg>
  );
}

export function BellIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function AlertIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function BookmarkIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h12a.5.5 0 0 1 .5.5v16.5l-6.5-4-6.5 4V4a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}
