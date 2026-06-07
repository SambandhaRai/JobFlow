import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.10", "localhost"],
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        hostname: "localhost",
        port: "5050",
        protocol: "http",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;