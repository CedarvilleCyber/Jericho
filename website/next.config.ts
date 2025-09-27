// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/console/ws",
        destination: `http://localhost:${process.env.CONSOLE_PROXY_PORT || 8787}/console/ws`,
      },
    ];
  },
};

export default nextConfig;
