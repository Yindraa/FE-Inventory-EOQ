import type { NextConfig } from "next";

const NextConfig = {
  eslint: {
    // This disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This disables TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};
export default NextConfig;
