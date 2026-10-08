import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos are already web-sized WebP; serving them as-is works the same on Vercel and Cloudflare
  images: { unoptimized: true },
  poweredByHeader: false,
  // Cloudflare (OpenNext) bundles the standalone output; WORKERS_CI is set by Cloudflare Workers Builds
  output: process.env.WORKERS_CI ? "standalone" : undefined,
  // The Postgres store reads db/schema.sql at runtime
  outputFileTracingIncludes: { "/**": ["./db/schema.sql"] },
  serverExternalPackages: ["pg"],
  // Pages retired when the site moved to a register-your-interest launch
  async redirects() {
    return [
      { source: "/academy", destination: "/programmes", permanent: true },
      { source: "/academy/:slug", destination: "/programmes", permanent: true },
      { source: "/sessions", destination: "/how-booking-works", permanent: true },
      { source: "/find-my-session", destination: "/register", permanent: true },
      { source: "/little-cricketers", destination: "/early-risers", permanent: true },
    ];
  },
};

export default nextConfig;
