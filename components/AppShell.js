"use client";

import { usePathname } from "next/navigation";

// The public landing page ("/") is a full-bleed marketing page with its own
// navbar (components/landing/Navbar.js) and must not be squeezed into the
// authenticated app's Sidebar layout. Every other route keeps the existing
// Sidebar-driven shell exactly as it was — this component only decides
// which shell to render, it doesn't change either one.
export default function AppShell({ sidebar, children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="md:flex md:min-h-screen">
      {sidebar}
      <div className="flex-1 min-w-0">
        <main>{children}</main>
      </div>
    </div>
  );
}
