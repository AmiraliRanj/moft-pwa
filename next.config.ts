import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    const businessUrl = process.env.BUSINESS_PWA_URL?.replace(/\/$/, "")
      || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");
    if (!businessUrl) return [];
    const origin = new URL(businessUrl);
    if (!["http:", "https:"].includes(origin.protocol) || origin.pathname !== "/" || origin.search || origin.hash || origin.username || origin.password) {
      throw new Error("BUSINESS_PWA_URL must be an HTTP(S) origin, without a path, query, fragment or credentials.");
    }
    return [{ source: "/business/:path*", destination: `${origin.origin}/business/:path*`, permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" }
        ]
      }
    ];
  }
};

export default nextConfig;
