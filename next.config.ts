import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép mở bản dev từ điện thoại / máy khác trong mạng LAN (vd: http://192.168.1.98:3000)
  allowedDevOrigins: ["192.168.1.98", "192.168.*.*"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
