import type { NextConfig } from "next";

const r2Public = (process.env.R2_PUBLIC_URL || "").trim();
let r2Hostname: string | null = null;
try {
  if (r2Public) r2Hostname = new URL(r2Public).hostname;
} catch {
  /* ignore */
}

const SECURITY_HEADERS = [
  // Browser-enforced clickjacking protection
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down browser features we don't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS for a year, including subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "picsum.photos" },
      ...(r2Hostname
        ? [{ protocol: "https" as const, hostname: r2Hostname }]
        : []),
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
