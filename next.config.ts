import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable PWA features
  experimental: {
    // Enable service worker for PWA
  },
  // Static export for Azure Static Web Apps
  output: 'export',
  trailingSlash: true,
  // Optimize for mobile
  images: {
    unoptimized: true, // Required for static export
    formats: ['image/webp', 'image/avif'],
  },
  // Security headers disabled for static export
  // Headers are not supported with output: 'export'
};

export default nextConfig;
