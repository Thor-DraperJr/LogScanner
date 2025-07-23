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
