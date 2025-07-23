import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable PWA features
  experimental: {
    // Enable service worker for PWA
  },
  // Remove static export to enable API routes
  // output: 'export', // Disabled for Azure Static Web Apps with API support
  trailingSlash: true,
  // Optimize for mobile
  images: {
    unoptimized: true, // Required for Azure Static Web Apps
    formats: ['image/webp', 'image/avif'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
