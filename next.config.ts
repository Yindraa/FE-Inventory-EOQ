import type { NextConfig } from "next";

const NextConfig = {
  eslint: {
    // Warning: This allows you to deploy with errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows you to deploy with errors
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add transpilePackages for Chart.js
  transpilePackages: ["chart.js", "react-chartjs-2"],
};
export default NextConfig;
