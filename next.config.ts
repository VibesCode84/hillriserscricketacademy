import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
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
