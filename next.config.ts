import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // The Postgres store reads db/schema.sql at runtime
  outputFileTracingIncludes: { "/**": ["./db/schema.sql"] },
  serverExternalPackages: ["pg"],
};

export default nextConfig;
