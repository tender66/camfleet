import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.22", "francisco-graspable-jeanetta.ngrok-free.dev"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "ngrok-skip-browser-warning", value: "true" }],
      },
    ];
  },
};

export default nextConfig;
