import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Avoid Turbopack persistent cache corruption on Windows/OneDrive paths.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
