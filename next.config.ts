import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.5.236.27", "*.local"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
