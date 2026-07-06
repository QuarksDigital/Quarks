import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve modern formats from the built-in image optimizer (next/image).
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
