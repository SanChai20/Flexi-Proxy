import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  async headers() {
    return [
      {
        source: "/api/:slug",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // 设置你的来源
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ]
      }
    ]
  }
};

export default nextConfig;