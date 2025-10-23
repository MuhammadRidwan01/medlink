import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

// Optional bundle analyzer (won't crash if not installed)
let wrap = (c: NextConfig) => c;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ba = require("@next/bundle-analyzer");
  wrap = ba({ enabled: process.env.ANALYZE === "true" });
} catch {}

export default wrap(baseConfig);
