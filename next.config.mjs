/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard production security headers, applied to every route.
  //
  // A Content-Security-Policy is intentionally NOT included here: this app
  // relies on Clerk's hosted components and Next.js's own inline
  // bootstrap scripts, and a CSP tight enough to matter but not verified
  // against both in a live browser risks silently breaking sign-in rather
  // than hardening it. The headers below are safe, unambiguous wins that
  // don't touch script/style/connect behavior.
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];

    if (process.env.NODE_ENV === "production") {
      // Only sent in production so local http:// development is unaffected.
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
