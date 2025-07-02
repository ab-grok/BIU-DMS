import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // or whatever limit you need
    },
  },
  // eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
