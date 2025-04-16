// pet‑adoption-frontend/next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ▶️ Add this:
  images: {
    // if you fetch from http://localhost:8080/uploads/…
    domains: ["localhost", "35.225.196.242"],

  },
};

export default nextConfig;
