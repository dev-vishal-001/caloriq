import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Any existing config options here
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      config.devtool = "source-map"; // ensures proper mapping in browser
    }
    return config;
  },
};

export default nextConfig;
