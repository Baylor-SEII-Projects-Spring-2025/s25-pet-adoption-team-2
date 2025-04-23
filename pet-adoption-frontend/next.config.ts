import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // allow these hosts in <Image src="…" />
    domains: [
      "localhost",
      "35.225.196.242",
      "aboutads.info"
    ],
  },
};

export default nextConfig;
