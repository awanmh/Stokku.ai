import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Proxy API requests through Next.js to avoid CORS issues.
  // Browser → localhost:3000/api/v1/* → Next.js proxy → backend:8080/api/v1/*
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
